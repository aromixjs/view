// components.js
//
// Everything above `static meta` is completely ordinary — a real
// constructor, real methods, no base class, no decorators, no `props!`
// declaration. This is what a user writes.
//
// `static meta` is the one thing a compiler would generate. It contains
// NO functions, ever — just names: which fields are state, which
// constructor params are callback props, and per action, which fields it
// reads and how many params it takes. Hand-written here to prototype the
// runtime against, since there's no real compiler yet.

export class AddButton {
  constructor({ productId, inStock, onAdd }) {
    this.productId = productId
    this.inStock = inStock
    this.onAdd = onAdd
  }

  add() {
    if (this.inStock) {
      this.onAdd(this.productId)
    }
  }

  render() {
    return `<button data-action="add">Add to cart (#${this.productId})</button>`
  }

  static meta = {
    state: ['productId', 'inStock'],
    props: { onAdd: 'fn' },
    actions: {
      add: { reads: ['productId', 'inStock'], params: [] }
    }
  }
}

export class Cart {
  constructor({ itemCount = 0 } = {}) {
    this.itemCount = itemCount
  }

  addItem(id) {
    this.itemCount++
  }

  render(childrenHtml) {
    return `<div>In cart: <span data-bind="itemCount">${this.itemCount}</span></div>${childrenHtml}`
  }

  static meta = {
    state: ['itemCount'],
    props: {},
    actions: {
      addItem: { reads: ['itemCount'], params: ['id'] }
    }
  }
}

export const registry = { AddButton, Cart }