// server.js — run: node server.js → http://localhost:3000
//
// /action does exactly this, for any component/action pair:
//   1. build any callback props as REAL closures (from data supplied by
//      the client — never trusted server memory)
//   2. `new ComponentClass(ctorArgs)` — one instance, not a tree
//   3. call the one method that was clicked
//   4. diff each instance's declared state fields against what it went
//      in with, and return only what changed, keyed by concrete ref
//
// A callback prop firing is not a special case — `this.onAdd(id)` inside
// `add()` is a real function call. If `add()` never calls it (inStock is
// false), the closure is simply never invoked and Cart is never even
// constructed. No tracing, no inlining, no dispatch table.

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { readFileSync } from 'node:fs'
import { registry } from './tags.js'

const app = new Hono()
const template = readFileSync(new URL('./index.html', import.meta.url), 'utf-8')

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function pickState(instance, ChildClass) {
  let out = {}
  for (let key of ChildClass.meta.state) out[key] = instance[key]
  return out
}

// Renders one child inside `parentRef`. `dataProps` are plain values;
// `fnProps` maps a prop name to the name of the method on the PARENT it's
// wired to — this is exactly what a `<AddButton onAdd={addItem} />` macro
// would resolve into automatically. Written by hand here for the same
// reason components.js's `meta` is: there's no macro yet.
function renderChild(ChildClass, dataProps, fnProps, parentName, parentRef, ref) {
  let ctorArgs = { ...dataProps }
  for (let key of Object.keys(fnProps)) ctorArgs[key] = () => {} // never invoked during render

  let instance = new ChildClass(ctorArgs)
  let html = instance.render()

  let props = {}
  for (let [k, v] of Object.entries(dataProps)) props[k] = { value: v }
  for (let [propName, actionName] of Object.entries(fnProps)) {
    props[propName] = { component: parentName, ref: parentRef, action: actionName }
  }

  let state = pickState(instance, ChildClass)

  return `<div data-ref="${ref}" data-component="${ChildClass.name}"
               data-state="${escapeAttr(JSON.stringify(state))}"
               data-props="${escapeAttr(JSON.stringify(props))}">${html}</div>`
}

app.get('/', (c) => {
  let { Cart, AddButton } = registry
  let cart = new Cart({ itemCount: 0 })

  let childHtml = renderChild(
    AddButton,
    { productId: 1, inStock: true },
    { onAdd: 'addItem' },
    'Cart', 'root-cart', 'product-1'
  )

  let cartHtml = cart.render(childHtml)
  let rootHtml = `<div data-ref="root-cart" data-component="Cart"
                        data-state="${escapeAttr(JSON.stringify(pickState(cart, Cart)))}"
                        data-props="{}">${cartHtml}</div>`

  let meta = Object.fromEntries(Object.entries(registry).map(([name, cls]) => [name, cls.meta]))
  let metaScript = `<script>window.__META__ = ${JSON.stringify(meta)}</script>`

  let page = template
    .replace('<!--META-->', metaScript)
    .replace('<!--APP-->', rootHtml)

  return c.html(page)
})

app.post('/action', async (c) => {
  let body = await c.req.json()
  let ChildClass = registry[body.component]
  if (!ChildClass) return c.json({ error: `unknown component "${body.component}"` }, 404)

  let writes = {}

  let ctorArgs = { ...body.reads }
  for (let [propName, ref] of Object.entries(body.props || {})) {
    let TargetClass = registry[ref.component]
    if (!TargetClass) return c.json({ error: `unknown component "${ref.component}"` }, 404)

    // The real closure. Calling it constructs the target, runs its real
    // method, and records whatever changed — nothing here is special-cased
    // for being "a prop call" versus any other function call.
    ctorArgs[propName] = (...args) => {
      let target = new TargetClass(ref.reads)
      target[ref.action](...args)
      let changed = {}
      for (let key of TargetClass.meta.state) {
        if (target[key] !== ref.reads[key]) changed[key] = target[key]
      }
      if (Object.keys(changed).length) {
        writes[ref.ref] = { ...(writes[ref.ref] || {}), ...changed }
      }
    }
  }

  let instance = new ChildClass(ctorArgs)
  if (typeof instance[body.action] !== 'function') {
    return c.json({ error: `unknown action "${body.action}" on ${body.component}` }, 404)
  }
  instance[body.action](...(body.params || []))

  let selfChanged = {}
  for (let key of ChildClass.meta.state) {
    if (instance[key] !== body.reads[key]) selfChanged[key] = instance[key]
  }
  if (Object.keys(selfChanged).length) writes[body.ref] = selfChanged

  return c.json({ writes })
})

serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000) }, (info) => {
  console.log(`http://localhost:${info.port}`)
})