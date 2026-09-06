// runtime.js
//
// trigger() is the entire cross-tree mechanism. It's a plain function
// call with no relationship to where it's invoked from — the target
// component doesn't need to be an ancestor, a descendant, or anything
// else structurally related to the caller.
//
// NOTE: this uses a single module-level variable as the request context,
// which is NOT safe for concurrent requests on one process — a real
// implementation needs AsyncLocalStorage (or equivalent) here. Flagged
// honestly rather than glossed over; irrelevant to validating the
// pattern itself, but a real blocker before this ships.

let currentCtx = null

export function trigger(Component, action, ...args) {
  if (!currentCtx) throw new Error('trigger() called outside a request')
  let key = `${Component.name}.${action}`
  let entry = currentCtx.triggers[key]
  if (!entry) return // not wired for this request (e.g. component not on page) — no-op, not an error

  let target = new Component(entry.reads)
  target[action](...args)

  let changed = diffState(target, Component.meta.state, entry.reads)
  if (Object.keys(changed).length) {
    currentCtx.writes[entry.ref] = { ...(currentCtx.writes[entry.ref] || {}), ...changed }
  }
}

export function diffState(instance, stateKeys, original) {
  let out = {}
  for (let key of stateKeys) {
    if (instance[key] !== original[key]) out[key] = instance[key]
  }
  return out
}

export function runWithContext(ctx, fn) {
  currentCtx = ctx
  try {
    return fn()
  } finally {
    currentCtx = null
  }
}