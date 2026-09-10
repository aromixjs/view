// runtime.js
//
// Two different ways a component instance gets its current values, and
// they're deliberately different:
//
//  - The DIRECTLY clicked component is built via its own `input`
//    parameter — `Factory(reads)` — exactly as validated in every prior
//    prototype.
//  - A component reached through trigger() is built with NO known input
//    shape (the proxy has no idea what that component's props look
//    like), so it's constructed empty — `Target({})` — and every given
//    read is poked in afterward via the generic `update(key, value)`.
//
// That's the actual reason `update()` earns a place in the exposed
// shape rather than being redundant with the constructor parameter: it's
// what makes trigger() generic across any target, without the proxy
// needing to know that target's specific prop names ahead of time.

import { AsyncLocalStorage } from "node:async_hooks";

const als = new AsyncLocalStorage();

export function runWithContext(ctx, fn) {
  return als.run(ctx, fn);
}

export function session() {
  return als.getStore()?.session;
}

// `before` must come from extract() calls made right after construction,
// never from the raw `reads` payload directly — `reads` is only
// guaranteed to contain the fields THIS action declared it needs, but a
// diff has to check every declared state field. Using extract() for both
// snapshots means a field absent from `reads` correctly falls back to
// whatever the constructor's own default produced, on both sides, rather
// than comparing a real value against `undefined` and reporting a false
// change (a field with a default that's never read by this specific
// action).
function snapshotState(instance) {
  let snap = {};
  for (let key of instance.meta.state) snap[key] = instance.extract(key);
  return snap;
}

function diffState(instance, before) {
  let changed = {};
  for (let key of instance.meta.state) {
    let after = instance.extract(key);
    if (after !== before[key]) changed[key] = after;
  }
  return changed;
}

export function trigger(Target) {
  return new Proxy(
    {},
    {
      get:
        (_, method) =>
        (...args) => {
          let ctx = als.getStore();
          let key = `${Target.as}.${method}`;
          let entry = ctx.calls[key];
          if (!entry) return; // target not on this page, or nothing wired this request — silent no-op, by design

          let instance = Target({});
          for (let [k, v] of Object.entries(entry.reads || {})) instance.update(k, v);

          let before = snapshotState(instance);
          let result = instance.actions[method](...args);
          if (result && result.error) {
            ctx.errors[key] = result.error;
            return;
          }
          let changed = diffState(instance, before);
          if (Object.keys(changed).length) {
            changed.__v = (entry.reads.__v || 0) + 1;
            ctx.writes[entry.ref] = { ...(ctx.writes[entry.ref] || {}), ...changed };
          }
        },
    },
  );
}

// Direct (non-trigger) callback props — `<ProductCard onAdd={recordAdd} />`
// — resolve differently: the parent's ref and action are baked into
// data-props at render time, and the client sends that provenance
// alongside the request the same way it sends a trigger entry. This is
// what powers "call back to the ONE specific parent instance this
// component actually lives under" — a case trigger()'s singleton
// registry structurally cannot address (see WishlistPanel/CartBadge vs.
// ProductCategory in components.js).
export function buildPropClosure(TargetFactory, entry) {
  return (...args) => {
    let ctx = als.getStore();
    let instance = TargetFactory({});
    for (let [k, v] of Object.entries(entry.reads || {})) instance.update(k, v);
    let before = snapshotState(instance);
    instance.actions[entry.action](...args);
    let changed = diffState(instance, before);
    if (Object.keys(changed).length) {
      changed.__v = (entry.reads.__v || 0) + 1;
      ctx.writes[entry.ref] = { ...(ctx.writes[entry.ref] || {}), ...changed };
    }
  };
}

export function diffAndRun(instance, actionName, params) {
  let before = snapshotState(instance);
  let result = instance.actions[actionName](...params);
  if (result && result.error) return { error: result.error };
  return { changed: diffState(instance, before) };
}
