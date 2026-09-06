// server.js — run: node server.js → http://localhost:3000
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { readFileSync } from 'node:fs'
import { registry, App, Header, CartBadge, Toast, ProductGrid, ProductCategory, ProductCard } from './components.js'
import { trigger, diffState, runWithContext } from './runtime.js'

const app = new Hono()
const template = readFileSync(new URL('./index.html', import.meta.url), 'utf-8')

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function wrap(ChildClass, instance, innerHtml, ref) {
  let state = {}
  for (let key of ChildClass.meta.state) state[key] = instance[key]
  return `<div data-ref="${ref}" data-component="${ChildClass.name}"
               data-state="${escapeAttr(JSON.stringify(state))}">${innerHtml}</div>`
}

app.get('/', (c) => {
  let toast = new Toast({})
  let toastHtml = wrap(Toast, toast, toast.render(), 'toast-1')

  let cartBadge = new CartBadge({ itemCount: 0 })
  let cartBadgeHtml = wrap(CartBadge, cartBadge, cartBadge.render(), 'cart-badge-1')

  let header = new Header()
  let headerHtml = wrap(Header, header, header.render(cartBadgeHtml), 'header-1')

  let CATALOG = {
    Shoes: [{ productId: 1, name: 'Runner', price: 80 }, { productId: 2, name: 'Sandal', price: 40 }],
    Bags:  [{ productId: 3, name: 'Backpack', price: 60 }, { productId: 4, name: 'Tote', price: 35 }],
  }

  let categoriesHtml = Object.entries(CATALOG).map(([categoryName, products], ci) => {
    let cardsHtml = products.map((p) => {
      let card = new ProductCard(p)
      return wrap(ProductCard, card, card.render(), `card-${p.productId}`)
    }).join('')
    let category = new ProductCategory({ categoryName })
    return wrap(ProductCategory, category, category.render(cardsHtml), `category-${ci}`)
  }).join('')

  let grid = new ProductGrid()
  let gridHtml = wrap(ProductGrid, grid, grid.render(categoriesHtml), 'grid-1')

  let root = new App()
  let rootHtml = wrap(App, root, root.render(headerHtml, gridHtml, toastHtml), 'app-1')

  let meta = Object.fromEntries(Object.entries(registry).map(([name, cls]) => [name, cls.meta]))
  let metaScript = `<script>window.__META__ = ${JSON.stringify(meta)}</script>`

  let page = template.replace('<!--META-->', metaScript).replace('<!--APP-->', rootHtml)
  return c.html(page)
})

app.post('/action', async (c) => {
  let body = await c.req.json()
  let ChildClass = registry[body.component]
  if (!ChildClass) return c.json({ error: `unknown component "${body.component}"` }, 404)
  if (typeof ChildClass.prototype[body.action] !== 'function') {
    return c.json({ error: `unknown action "${body.action}" on ${body.component}` }, 404)
  }

  let ctx = { triggers: body.triggers || {}, writes: {} }

  // Direct callback props (validated in the previous prototype) still
  // work exactly as before, unchanged — trigger() is additive, not a
  // replacement for parent/child callback props.
  let ctorArgs = { ...body.reads }
  for (let [propName, ref] of Object.entries(body.props || {})) {
    let TargetClass = registry[ref.component]
    ctorArgs[propName] = (...args) => {
      let target = new TargetClass(ref.reads)
      target[ref.action](...args)
      let changed = diffState(target, TargetClass.meta.state, ref.reads)
      if (Object.keys(changed).length) {
        ctx.writes[ref.ref] = { ...(ctx.writes[ref.ref] || {}), ...changed }
      }
    }
  }

  runWithContext(ctx, () => {
    let instance = new ChildClass(ctorArgs)
    instance[body.action](...(body.params || []))
    let changed = diffState(instance, ChildClass.meta.state, body.reads)
    if (Object.keys(changed).length) {
      ctx.writes[body.ref] = { ...(ctx.writes[body.ref] || {}), ...changed }
    }
  })

  return c.json({ writes: ctx.writes })
})

serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000) }, (info) => {
  console.log(`http://localhost:${info.port}`)
})