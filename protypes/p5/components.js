// components.js
//
// Ordinary classes — real constructors, real methods. `static meta` is
// the one compiler-generated piece (hand-written here, same as every
// prior prototype), now with one addition: `triggers`, the flattened,
// transitively-closed list of every `trigger(Component, action)` call
// reachable from this action, however many hops deep. The compiler
// builds this by scanning every action's body for `trigger(...)` calls,
// then chasing those targets' own `triggers` lists until nothing new is
// found — a static graph closure, not a runtime trace.

import { trigger } from './runtime.js'

// ---- Singletons — reachable from anywhere via trigger(), never as a prop ----

export class Toast {
  constructor({ message = '' } = {}) {
    this.message = message
  }
  show(text) {
    this.message = text
  }
  render() {
    return `<div class="toast" data-bind="message">${this.message}</div>`
  }
  static meta = {
    state: ['message'],
    props: {},
    actions: { show: { reads: [], params: ['text'], triggers: [] } }
  }
}

export class CartBadge {
  constructor({ itemCount = 0 } = {}) {
    this.itemCount = itemCount
  }
  addItem(qty) {
    this.itemCount += qty
    if (this.itemCount >= 3) {
      trigger(Toast, 'show', 'Bundle discount unlocked!')
    }
  }
  render() {
    return `\uD83D\uDED2 <span data-bind="itemCount">${this.itemCount}</span>`
  }
  static meta = {
    state: ['itemCount'],
    props: {},
    // "Toast.show" is here because addItem calls trigger() itself —
    // this is what makes a CHAINED trigger (fired from inside an action
    // that was itself only reached via trigger) resolve correctly: the
    // flat context object handed to the server already contains this
    // entry too, so the nested call is just another dictionary lookup.
    actions: { addItem: { reads: ['itemCount'], params: ['qty'], triggers: ['Toast.show'] } }
  }
}

// ---- Structural components — no state, no props, just layout ----

export class Header {
  constructor() {}
  render(cartBadgeHtml) {
    return `<header><strong>Shop</strong> ${cartBadgeHtml}</header>`
  }
  static meta = { state: [], props: {}, actions: {} }
}

export class ProductGrid {
  constructor() {}
  render(categoriesHtml) {
    return `<div class="grid">${categoriesHtml}</div>`
  }
  static meta = { state: [], props: {}, actions: {} }
}

export class ProductCategory {
  constructor({ categoryName }) {
    this.categoryName = categoryName
  }
  render(cardsHtml) {
    return `<section><h3>${this.categoryName}</h3>${cardsHtml}</section>`
  }
  static meta = { state: ['categoryName'], props: { categoryName: 'data' }, actions: {} }
}

export class App {
  constructor() {}
  render(headerHtml, gridHtml, toastHtml) {
    return `${headerHtml}${gridHtml}${toastHtml}`
  }
  static meta = { state: [], props: {}, actions: {} }
}

// ---- The leaf, repeated four times in the tree ----

export class ProductCard {
  constructor({ productId, name, price, qty = 1 }) {
    this.productId = productId
    this.name = name
    this.price = price
    this.qty = qty
  }

  increment() { this.qty++ }
  decrement() { if (this.qty > 1) this.qty-- }

  add() {
    // Order matters: "Added to cart" is set first, then addItem runs —
    // if it crosses the bundle threshold, its own trigger() overwrites
    // this message with the bundle one. Last write to the same ref wins,
    // same as two ordinary property writes would. Worth knowing, not
    // something this prototype tries to hide.
    trigger(Toast, 'show', `Added ${this.name} to cart`)
    trigger(CartBadge, 'addItem', this.qty)
  }

  render() {
    return `<div class="card">
      <div>${this.name} — $${this.price}</div>
      <button data-action="decrement">-</button>
      <span data-bind="qty">${this.qty}</span>
      <button data-action="increment">+</button>
      <button data-action="add">Add to cart</button>
    </div>`
  }

  static meta = {
    state: ['productId', 'name', 'price', 'qty'],
    props: { productId: 'data', name: 'data', price: 'data' },
    actions: {
      increment: { reads: ['qty'], params: [], triggers: [] },
      decrement: { reads: ['qty'], params: [], triggers: [] },
      // Flattened transitive closure: CartBadge.addItem is direct;
      // Toast.show is direct too AND reachable through CartBadge.addItem
      // — deduplicated, listed once.
      add: { reads: ['qty', 'name'], params: [], triggers: ['Toast.show', 'CartBadge.addItem'] }
    }
  }
}

export const registry = { App, Header, CartBadge, Toast, ProductGrid, ProductCategory, ProductCard }