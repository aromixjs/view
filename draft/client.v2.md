```markdown
# Dynamic Layout & Binding Tokens (`sliz`)

The `sliz` attribute is a unified, utility-first token system. It merges appearance (CSS) and behavior (framework state, events, and attributes) into a single declarative string. 

Framework internals (`t`, `a`, `e`, `trigger`) use the exact same syntax as user-defined styling tokens. For attributes and events, the parser's native bracket `[]` scopes are used to group nested HTML keys, preventing the need to register a token for every single HTML attribute.

---

### Single Dynamic Text

User Writes:

```html
<script server>
  let message = "Data";
</script>
<span>{message}</span>
```

Component IR Generated:

```js
function Home() {
   let message = "Data";

   const template = () => {
      const $ = []

      $.push({
         type: NodeType.PairTag,
         name: 'span',
         attributes: [{
            key: 'sliz',
            value: 't:c2.s0' // 't' token for text binding
         }],
         child: [{
            type: NodeType.Text,
            value: message
         }]
      })

      return $
   }

   return {
      get s0() {
         return message
      },
   };
}
```

Browser Gets:

```html
<span sliz="t:c2.s0">Data</span>
```

---

### Single Text Node With Multiple Dynamic Segments

> **Note:**
>
> Due to time constraints, V1 uses a naive full-text replacement strategy for text nodes containing multiple dynamic expressions.
>
> **TODO:**
>
> Update multi-segment text handling to support compact incremental updates. The compiled metadata should retain the positions of each dynamic expression within the single text node so that, when one expression changes, the runtime can update only that portion of the text node instead of reconstructing and replacing the entire text value. Positions must remain correct when earlier dynamic expressions change length.

User Writes:

```html
<script server>
  import { kv } from "#kv";
  const user = kv.get("user:12345");
</script>
<div>user data: {user.name} - {user.email}</div>
```

Component IR Generated:

```js
import { kv } from "#kv";

function Home() {
  const user = kv.get("user:12345");

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",
      attributes: [
        {
          key: "sliz",
          value: "t:c2.s1",
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: `user data: ${user.name} - ${user.email}`,
        },
      ],
    });

    return $;
  };

  return {
    get s1() {
      return `user data: ${user.name} - ${user.email}`;
    },
  };
}
```

Browser Gets:

```html
<div sliz="t:c2.s1">user data: John Doe - john@mail.com</div>
```

---

### Dynamic Attributes

User Writes:

```html
<script server>
  const title = "User Profile";
  const elementId = "profile";
  const isHidden = false;
</script>

<div id="{elementId}" title="{title}" hidden="{isHidden}">Profile</div>
```

Component IR Generated:

```js
function Home() {
  const title = "User Profile";
  const elementId = "profile";
  const isHidden = false;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",

      attributes: [
        { key: "id", value: elementId },
        { key: "title", value: title },
        { key: "hidden", value: isHidden },
        // 'a' token groups HTML attributes into a scope
        { key: "sliz", value: "a:[id:c2.s1 title:c2.s2 hidden:c2.s3]" },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });

    return $;
  };
  return {
    get s1() {
      return elementId;
    },
    get s2() {
      return title;
    },
    get s3() {
      return isHidden;
    },
  };
}
```

Browser Gets:

```html
<div
  sliz="a:[id:c2.s1 title:c2.s2 hidden:c2.s3]"
  id="profile"
  title="User Profile"
>
  Profile
</div>
```

---

### Single Attribute With a Single Dynamic Segment

User Writes:

```html
<script server>
  const name = "John";
</script>

<div title="Hello {name}">Profile</div>
```

Component IR Generated:

```js
function Home() {
  const name = "John";

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",

      attributes: [
        {
          key: "title",
          value: `Hello ${name}`,
        },
        {
          key: "sliz",
          value: "a:[title:c2.s1]",
        },
      ],

      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });

    return $;
  };

  return {
    get s1() {
      return `Hello ${name}`;
    },
  };
}
```

Browser Gets:

```html
<div sliz="a:[title:c2.s1]" title="Hello John">Profile</div>
```

---

### Single Event With No Arguments

User Writes:

```html
<script server>
  function save() {
    //...
  }
</script>
<button onClick="{save}">Save</button>
```

Component IR Generated:

```js
function Home() {
  function save() {
    // ...
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // 'e' token groups HTML events into a scope
          value: "e:[click:c2.a0]",
        },
      ],
      events: [
        {
          key: "onclick",
          value: save,
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Save",
        },
      ],
    });

    return $;
  };

  return {
    a0: save,
  };
}
```

Browser Gets:

```html
<button sliz="e:[click:c2.a0]">Save</button>
```

---

### Event With Multiple Lexical State Dependencies

User Writes:

```html
<script server>
  let name = "";
  let email = "";
  function update() {
    console.log(name);
    console.log(email);
  }
</script>
<input value="{name}" />
<input aria-label="{email}" />
<button onClick="{update}">Save</button>
```

Component IR Generated:

```js
function Home() {
  let name = "";
  let email = "";
  function update() {
    console.log(name);
    console.log(email);
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.EmptyTag,
      name: "input",
      attributes: [
        { key: "value", value: name },
        { key: "sliz", value: "a:[value:c2.s0]" },
      ],
    });

    $.push({
      type: NodeType.EmptyTag,
      name: "input",
      attributes: [
        { key: "aria-label", value: email },
        { key: "sliz", value: "a:[aria-label:c2.s1]" },
      ],
    });

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // Event token followed by action dependency tokens
          value: "e:[click:c2.a0] c2.a0:c2.s0 c2.a0:c2.s1",
        },
      ],
      child: [{ type: NodeType.Text, value: "Save" }],
    });

    return $;
  };

  return {
    a0: update,
    get s0() {
      return name;
    },
    set s0(value) {
      name = value;
    },
    get s1() {
      return email;
    },
    set s1(value) {
      email = value;
    },
  };
}
```

Browser Gets:

```html
<input sliz="a:[value:c2.s0]" value="" />
<input sliz="a:[aria-label:c2.s1]" aria-label="" />

<button sliz="e:[click:c2.a0] c2.a0:c2.s0 c2.a0:c2.s1">Save</button>
```

---

### Event With Multiple Explicit Parameters

User Writes:

```html
<script server>
  function select(id, mode, section) {
    // ...
  }
</script>

<button onClick="{select('12345', 'edit', 'profile')}">Edit</button>
```

Component IR Generated:

```js
function Home() {
  function select(id, mode, section) {
    // ...
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          value:
            "e:[click:c2.a0] c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile",
        },
      ],
      events: [
        {
          key: "onclick",
          value: select,
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Edit",
        },
      ],
    });

    return $;
  };

  return {
    a0: select,
  };
}
```

Browser Gets:

```html
<button sliz="e:[click:c2.a0] c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile">
  Edit
</button>
```

---

### Prop Resolution (Deeply Nested)

> **Note:**
> The concept of a "Component" does not exist on the client side. Components are flattened into native HTML tags.
>
> To avoid exposing user variable names and to avoid a complex cross-module AST tracer, the compiler uses a simple `__` prop pass-through. If a prop is bound to a state/action, the compiler injects a string token (e.g., `__onAdd: "c2.a0"`) alongside the actual value. Children simply pass this string down. When the compiler hits a native HTML element, it directly interpolates this string into the `sliz` attribute.

User Writes:

```html
<!-- App.av -->
<script server>
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }
</script>
<Header onAdd="{recordAdd}" count="{cartCount}" />
```

```html
<!-- Header.av -->
<script server>
  export let onAdd, count;
</script>
<Button onClick="{onAdd}" label="{count}" />
```

```html
<!-- Button.av -->
<script server>
  export let onClick, label;
</script>
<button onClick="{onClick}">Added {label}</button>
```

Component IR Generated (App):

```js
function App() {
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Header,
      instance: Header({
        onAdd: recordAdd,
        count: cartCount,
        // Compiler injects the root token string directly into the props
        __onAdd: "c2.a0",
        __count: "c2.s0",
      }),
    });

    return $;
  };

  return {
    a0: recordAdd,
    get s0() {
      return cartCount;
    },
    set s0(v) {
      cartCount = v;
    },
  };
}
```

Component IR Generated (Header):

```js
function Header(props) {
  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Button,
      instance: Button({
        onClick: props.onAdd,
        label: props.count,
        // Compiler simply passes the string token down to the next child
        __onClick: props.__onAdd,
        __label: props.__count,
      }),
    });

    return $;
  };

  return {};
}
```

Component IR Generated (Button):

```js
function Button(props) {
  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // Directly interpolate the passed-down string token!
          value: `e:[click:${props.__onClick}] t:${props.__label}`,
        },
      ],
      child: [
        { type: NodeType.Text, value: "Added " },
        { type: NodeType.Text, value: props.label },
      ],
    });

    return $;
  };

  return {};
}
```

Browser Gets:

```html
<!-- The string tokens flow straight down and are interpolated into the sliz attribute -->
<button sliz="e:[click:c2.a0] t:c2.s0">Added 0</button>
```

---

### Prop Consumed by Local Action

> **Note:**
> When a component receives a function prop but doesn't bind it directly to an HTML element, the compiler tracks the local function that calls it. It then injects the `__` token into that local function's dependency list within the `sliz` attribute. This ensures the client knows to pack the root parent's state when the local function is triggered via RPC.

User Writes:

```html
<!-- App.av -->
<script server>
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }
</script>
<Header onAdd="{recordAdd}" count="{cartCount}" />
```

```html
<!-- Header.av -->
<script server>
  export let onAdd, count;
  function submit() {
    // Local action calling the passed prop
    onAdd();
  }
</script>
<button onClick="{submit}">Add</button>
```

Component IR Generated (App):

```js
function App() {
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Header,
      instance: Header({
        onAdd: recordAdd,
        count: cartCount,
        // Compiler injects root token
        __onAdd: "c2.a0",
        __count: "c2.s0",
      }),
    });

    return $;
  };

  return {
    a0: recordAdd,
    get s0() {
      return cartCount;
    },
    set s0(v) {
      cartCount = v;
    },
  };
}
```

Component IR Generated (Header):

```js
function Header(props) {
  function submit() {
    props.onAdd();
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // Compiler sees submit (a0) calls props.onAdd.
          // It interpolates the __ token into a0's dependency list.
          value: `e:[click:c3.a0] c3.a0:${props.__onAdd}`,
        },
      ],
      child: [{ type: NodeType.Text, value: "Add" }],
    });

    return $;
  };

  return {
    a0: submit,
  };
}
```

Browser Gets:

```html
<!-- Client knows: when c3.a0 fires, pack c2.a0's state for the server -->
<button sliz="e:[click:c3.a0] c3.a0:c2.a0">Add</button>
```

---

### Prop Consumed by Local State (Computed Values)

> **Note:**
> When a component receives a state prop and uses it to compute local state, the compiler injects the `__` token into the local state's dependency list in the `sliz` attribute. This tells the client to pack the root parent's state alongside the local state during an RPC call, so the server can recompute the derived value correctly.

User Writes:

```html
<!-- App.av -->
<script server>
  let basePrice = 100;
</script>
<Display price="{basePrice}" />
```

```html
<!-- Display.av -->
<script server>
  export let price;
  // Local state computed from prop
  let totalPrice = price + 10;
</script>
<span>{totalPrice}</span>
```

Component IR Generated (App):

```js
function App() {
  let basePrice = 100;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Display,
      instance: Display({
        price: basePrice,
        __price: "c2.s0",
      }),
    });

    return $;
  };

  return {
    get s0() {
      return basePrice;
    },
    set s0(v) {
      basePrice = v;
    },
  };
}
```

Component IR Generated (Display):

```js
function Display(props) {
  // Computed local state
  let totalPrice = props.price + 10;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "span",
      attributes: [
        {
          key: "sliz",
          // Compiler sees totalPrice (s0) depends on props.price.
          // It interpolates the __ token into s0's dependency list.
          value: `t:c3.s0 c3.s0:${props.__price}`,
        },
      ],
      child: [{ type: NodeType.Text, value: totalPrice }],
    });

    return $;
  };

  return {
    get s0() {
      return totalPrice;
    },
    set s0(v) {
      totalPrice = v;
    },
  };
}
```

Browser Gets:

```html
<!-- Client knows: if c3.s0 is involved in an RPC, pack c2.s0 too -->
<span sliz="t:c3.s0 c3.s0:c2.s0">110</span>
```

---

### Prop Consumed by Both Script and Template

> **Note:**
> If a prop is used in both the script (e.g., passed to a local action) and directly in the HTML template, the compiler simply emits both dependencies in the `sliz` attribute. The direct template usage gets its own token, and the script dependency gets its token appended to the local action/state dependency list.

User Writes:

```html
<!-- App.av -->
<script server>
  let itemQty = 1;
  function updateQty(newQty) {
    itemQty = newQty;
  }
</script>
<CartItem onAdjust="{updateQty}" qty="{itemQty}" />
```

```html
<!-- CartItem.av -->
<script server>
  export let onAdjust, qty;
  function increment() {
    onAdjust(qty + 1);
  }
</script>
<button onClick="{increment}">Add One</button>
<div>Current: {qty}</div>
```

Component IR Generated (CartItem):

```js
function CartItem(props) {
  function increment() {
    props.onAdjust(props.qty + 1);
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // a0 (increment) depends on __onAdjust and __qty
          value: `e:[click:c3.a0] c3.a0:${props.__onAdjust} c3.a0:${props.__qty}`,
        },
      ],
      child: [{ type: NodeType.Text, value: "Add One" }],
    });

    $.push({
      type: NodeType.PairTag,
      name: "div",
      attributes: [
        {
          key: "sliz",
          // Direct template consumption of qty
          value: `t:${props.__qty}`,
        },
      ],
      child: [{ type: NodeType.Text, value: props.qty }],
    });

    return $;
  };

  return {
    a0: increment,
  };
}
```

Browser Gets:

```html
<button sliz="e:[click:c3.a0] c3.a0:c2.a0 c3.a0:c2.s0">Add One</button>
<div sliz="t:c2.s0">Current: 1</div>
```

---

### Explicit Cross-Component Triggers (Far Tree Communication)

> **Note:**
> Prop drilling is great for direct parent-child relationships, but when two components far apart in the tree need to communicate, prop drilling becomes tedious.
>
> Because the server only hydrates the specific component instance making the RPC call (and any components linked via its `sliz` metadata), you cannot use a global event bus or shared store on the server.
>
> Instead, you use the explicit `trigger` API. The compiler statically analyzes calls to the `trigger` proxy and injects a `trigger:Component.action` token directly into the local function's `sliz` dependency list. This tells the client to find that other component on the page, pack its state, and send it along in the RPC request so the server can build a stand-in closure for it.

User Writes:

```html
<!-- App.av -->
<script server>
  import Header from "./Header.av";
  import UserList from "./UserList.av";
</script>
<Header />
<UserList />
```

```html
<!-- Header.av -->
<script server>
  // Explicitly declare trigger targets
  const t = trigger({ UserList }); 

  let searchQuery = "";
  function syncList() {
    // Call the action on the target component
    t.UserList.refresh(searchQuery); 
  }
</script>
<button onClick={syncList}>Sync List</button>
```

Component IR Generated (Header):

```js
function Header() {
  const t = trigger({ UserList });

  let searchQuery = "";
  function syncList() {
    t.UserList.refresh(searchQuery);
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "sliz",
          // Compiler sees syncList (a0) calls t.UserList.refresh.
          // It injects a trigger token directly into the dep list.
          value: "e:[click:c2.a0] c2.a0:trigger:UserList.a0"
        }
      ],
      child: [{ type: NodeType.Text, value: "Sync List" }]
    });

    return $;
  };

  return {
    a0: syncList,
    get s0() { return searchQuery; },
    set s0(v) { searchQuery = v; }
  };
}
```

Browser Gets:

```html
<button sliz="e:[click:c2.a0] c2.a0:trigger:UserList.a0">Sync List</button>
```