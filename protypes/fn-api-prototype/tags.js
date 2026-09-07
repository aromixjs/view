// components.js — every component in the exact shape requested:
//   function Name(props) { ...user code...; const html = () => {...}; const meta = {...}; return {...} }
// `meta` is hand-written here (compiler-generated in the real system,
// same as every prototype before this one). Everything else is exactly
// what a compiler would emit from the `.av` syntax — real closures, real
// control flow, nothing templated.

import { trigger, session } from './runtime.js'

// ───────────────────────── singletons (trigger targets) ─────────────────────────

function Toast(props) {
  let message = props.message ?? ''

  function show(text) { message = text }

  const html = () => `<div class="toast" data-bind="message">${message}</div>`
  const meta = {
    state: ['message'], props: {},
    actions: { show: { reads: [], params: ['text'], calls: [] } }
  }

  return {
    extract: (k) => ({ message })[k],
    update: (k, v) => { if (k === 'message') message = v },
    actions: { show },
    html, meta
  }
}
Toast.as = './Toast'

function CartBadge(props) {
  let itemCount = props.itemCount ?? 0

  function addItem(qty) {
    let ctx = session()
    let multiplier = ctx?.isVIP ? 2 : 1
    itemCount += qty * multiplier
    if (itemCount >= 5) trigger(Toast).show('Bundle discount unlocked!')
  }

  const html = () => `<span data-bind="itemCount">\uD83D\uDED2 ${itemCount}</span>`
  const meta = {
    state: ['itemCount'], props: {},
    actions: { addItem: { reads: ['itemCount'], params: ['qty'], calls: [{ kind: 'trigger', as: './Toast', method: 'show' }] } }
  }

  return {
    extract: (k) => ({ itemCount })[k],
    update: (k, v) => { if (k === 'itemCount') itemCount = v },
    actions: { addItem },
    html, meta
  }
}
CartBadge.as = './CartBadge'

function WishlistPanel(props) {
  let count = props.count ?? 0

  function addToWishlist(productId) { count++ }

  const html = () => `<span data-bind="count">\u2665 ${count}</span>`
  const meta = {
    state: ['count'], props: {},
    actions: { addToWishlist: { reads: ['count'], params: ['productId'], calls: [] } }
  }

  return {
    extract: (k) => ({ count })[k],
    update: (k, v) => { if (k === 'count') count = v },
    actions: { addToWishlist },
    html, meta
  }
}
WishlistPanel.as = './WishlistPanel'

// ProductGrid is BOTH a normal structural parent (renders categories)
// AND a trigger() target reached from a totally different branch
// (SearchBar, under Header) — proving trigger() isn't limited to
// leaf/singleton-shaped components.
function ProductGrid(props, categoriesHtml) {
  let filterTerm = props.filterTerm ?? ''

  function setFilter(term) { filterTerm = term }

  const html = () =>
    `<div class="grid"><p data-bind="filterTerm">Filter: "${filterTerm}"</p>${categoriesHtml || ''}</div>`
  const meta = {
    state: ['filterTerm'], props: {},
    actions: { setFilter: { reads: [], params: ['term'], calls: [] } }
  }

  return {
    extract: (k) => ({ filterTerm })[k],
    update: (k, v) => { if (k === 'filterTerm') filterTerm = v },
    actions: { setFilter },
    html, meta
  }
}
ProductGrid.as = './ProductGrid'

// ───────────────────────── structural / non-singleton parent ─────────────────────────

function SearchBar() {
  let query = ''

  function search(term) {
    query = term
    trigger(ProductGrid).setFilter(term) // far-tree: two branches away, no shared parent involvement needed
  }

  const html = () => `<input data-bind="query" value="${query}"><button data-action="search">Search</button>`
  const meta = {
    state: ['query'], props: {},
    actions: { search: { reads: [], params: ['term'], calls: [{ kind: 'trigger', as: './ProductGrid', method: 'setFilter' }] } }
  }

  return {
    extract: (k) => ({ query })[k],
    update: (k, v) => { if (k === 'query') query = v },
    actions: { search },
    html, meta
  }
}

// ProductCategory is NOT a singleton — there are two instances (Shoes,
// Bags) — so its `addCount` can only be reached correctly via a real
// callback prop baked to THIS instance's own ref, never via trigger().
function ProductCategory(props, cardsHtml) {
  let addCount = props.addCount ?? 0

  function recordAdd() { addCount++ }

  const html = () =>
    `<section><h3>${props.categoryName} (<span data-bind="addCount">${addCount}</span> added)</h3>${cardsHtml}</section>`
  const meta = {
    state: ['addCount'], props: { categoryName: 'data' },
    actions: { recordAdd: { reads: ['addCount'], params: [], calls: [] } }
  }

  return {
    extract: (k) => ({ addCount, categoryName: props.categoryName })[k],
    update: (k, v) => { if (k === 'addCount') addCount = v },
    actions: { recordAdd },
    html, meta
  }
}

function ProductCard(props) {
  let qty = props.qty ?? 1

  function increment() { qty++ }
  function decrement() { if (qty > 1) qty-- }

  function add() {
    if (qty > props.stock) {
      return { error: { code: 'OUT_OF_STOCK', message: `Only ${props.stock} left of ${props.name}` } }
    }
    props.onAdd()                                  // real callback prop — THIS category, not a singleton
    trigger(Toast).show(`Added ${props.name} to cart`)
    trigger(CartBadge).addItem(qty)
  }

  function save() {
    trigger(WishlistPanel).addToWishlist(props.productId)
  }

  const html = () => `<div class="card">
    <div>${props.name} — $${props.price} (${props.stock} in stock)</div>
    <button data-action="decrement">-</button>
    <span data-bind="qty">${qty}</span>
    <button data-action="increment">+</button>
    <button data-action="add">Add to cart</button>
    <button data-action="save">\u2661 Save</button>
  </div>`

  const meta = {
    state: ['qty'],
    props: { productId: 'data', name: 'data', price: 'data', stock: 'data', onAdd: 'fn' },
    actions: {
      increment: { reads: ['qty'], params: [], calls: [] },
      decrement: { reads: ['qty'], params: [], calls: [] },
      add: {
        reads: ['qty', 'name', 'stock'], params: [],
        calls: [
          { kind: 'prop', name: 'onAdd' },
          { kind: 'trigger', as: './Toast', method: 'show' },
          { kind: 'trigger', as: './CartBadge', method: 'addItem' }
        ]
      },
      save: { reads: ['productId'], params: [], calls: [{ kind: 'trigger', as: './WishlistPanel', method: 'addToWishlist' }] }
    }
  }

  return {
    extract: (k) => ({ ...props, qty })[k], // state key must come LAST — otherwise a same-named input field (props.qty, the original value) silently wins over the mutated closure variable
    update: (k, v) => { if (k === 'qty') qty = v },
    actions: { increment, decrement, add, save },
    html, meta
  }
}

// ───────────────────────── pure layout, no state/actions ─────────────────────────

function Header(cartBadgeHtml, searchBarHtml) {
  return { html: () => `<header>${searchBarHtml}<strong>Shop</strong> ${cartBadgeHtml}</header>`, meta: { state: [], props: {}, actions: {} } }
}
function Sidebar(wishlistHtml) {
  return { html: () => `<aside>${wishlistHtml}</aside>`, meta: { state: [], props: {}, actions: {} } }
}
function App(headerHtml, gridHtml, sidebarHtml, toastHtml) {
  return { html: () => `${headerHtml}${gridHtml}${sidebarHtml}${toastHtml}`, meta: { state: [], props: {}, actions: {} } }
}

export const registry = {
  App, Header, Sidebar, SearchBar, CartBadge, WishlistPanel, Toast, ProductGrid, ProductCategory, ProductCard
}