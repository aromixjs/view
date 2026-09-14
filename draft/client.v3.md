Here is the new section to add to your documentation. It completely removes HTML comments and wrapper elements. Instead, it uses a new `sliz` token (`b`) that binds the block's output directly to the `innerHTML` of a native HTML element, keeping the architecture 100% unified.

---

### Structural Control Flow (Block Functions & `innerHTML` Binding)

> **Note:**
> Re-running the main `template()` function during an RPC is expensive and risks re-triggering side effects (like DB queries in an `onRender` hook). 
>
> To avoid this, the compiler extracts `.if` and `.for` logic into isolated `b0`, `b1` block functions. The main `template()` function acts purely as an entry point that calls these blocks in serial to generate the initial HTML.
>
> During a subsequent RPC, the server **never** runs `template()` and **never** runs `onRender`. It treats the RPC as a normal action mutation, diffs the state, and if a state tied to a block changes, it executes *only that specific block function*. The client receives the HTML string and swaps the `innerHTML` of the element holding the `b` (block) token. No HTML comments or wrapper elements are needed.

User Writes:

```html
<script server>
  let isLoggedIn = false;
  function login() { isLoggedIn = true; }
</script

<div .if={isLoggedIn}>
  <button onClick={logout}>Welcome Back!</button>
</div>
<div .else>
  <button onClick={login}>Please Login</button>
</div>
```

Component IR Generated:

```js
function Home() {
  let isLoggedIn = false;
  function login() { isLoggedIn = true; }

  // 1. The compiler extracts control flow into isolated block functions.
  // They take the current state as arguments and return an HTML string.
  const b0 = (s0) => {
    if (s0) {
      return `<div><button sliz="e:[click:c2.a1]">Welcome Back!</button></div>`;
    }
    return `<div><button sliz="e:[click:c2.a0]">Please Login</button></div>`;
  };

  // 2. The template is just an entry point. 
  // The compiler hoists the block token (`b:c2.b0`) to a native parent 
  // element. If there is no explicit parent, it wraps the output in a 
  // native `<div>` to serve as the anchor.
  const template = () => {
    return `<div sliz="b:c2.b0">${b0(isLoggedIn)}</div>`;
  };

  return {
    a0: login,
    a1: logout,
    get s0() { return isLoggedIn; },
    set s0(v) { isLoggedIn = v; },
    // Expose blocks so the server RPC handler can call them directly
    blocks: { b0 },
  };
}
```

Browser Gets (Initial Render):

```html
<!-- The sliz token acts as the anchor. No comments, no artificial wrappers. -->
<div sliz="b:c2.b0">
  <div>
    <button sliz="e:[click:c2.a0]">Please Login</button>
  </div>
</div>
```

### The RPC Resolution Mechanism (Server & Client)

1. **Client Click:** User clicks "Please Login". Client packs `c2.s0` (false) and sends RPC for `c2.a0`.
2. **Server Action:** Server reconstructs `Home`, sets `isLoggedIn = true`, and runs `a0()`. **No `onRender` hook runs.**
3. **Server Diff:** Server sees `s0` changed from `false` to `true`.
4. **Server Block Execution:** Server sees `s0` is bound to block `b0`. It calls `Home.blocks.b0(true)`, which returns `<div><button sliz="e:[click:c2.a1]">Welcome Back!</button></div>`.
5. **Network Response:** Server responds: `{ writes: { "c2.b0": "<div><button sliz=\"e:[click:c2.a1]\">Welcome Back!</button></div>" } }`
6. **Client Swap:** The client runtime sees a write to `c2.b0`. It queries the DOM for `[sliz~="b:c2.b0"]`, and sets its `innerHTML` to the new string. The `sliz` runtime on the client automatically parses and binds the new `<button>`.

### Looping (`for`)

For loops work identically. The block function takes the array state as an argument, maps over it, and returns a concatenated HTML string.

User Writes:

```html
<script server>
  let users = [{ name: "John" }, { name: "Jane" }];
</script>

<ul .for={users}>
  <li>{user.name}</li>
</ul>
```

Component IR Generated:

```js
function Home() {
  let users = [{ name: "John" }, { name: "Jane" }];

  const b0 = (s0) => {
    return s0.map(user => `<li sliz="t:c3.s0">${user.name}</li>`).join("");
  };

  const template = () => {
    // The `<ul>` is the native parent, so it gets the block token
    return `<ul sliz="b:c2.b0">${b0(users)}</ul>`;
  };

  return {
    get s0() { return users; },
    set s0(v) { users = v; },
    blocks: { b0 },
  };
}
```

### Why this is the ultimate pattern:
1. **Zero Template Re-evaluation:** `template()` is called exactly once during SSR. It is **never** called again during an RPC.
2. **Zero Hook Side-Effects:** Because `template()` isn't called, any DB queries or expensive logic placed in `onRender` hooks are completely isolated from RPC state mutations.
3. **No DOM Bloat:** By using the `b:` token on a native parent element (or a single hoisted root), the structural layout remains clean. No HTML comments or `<template>` wrappers.
4. **Token Unification:** Even structural changes use the exact same `sliz` token syntax (`b:c2.b0` vs `t:c2.s0`), keeping the parser, runtime, and RPC diffing logic 100% unified.