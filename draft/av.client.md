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
            key: 'lay',
            value: 'av:[t:c2.s0]' // t for text
         }]
         child: [{
            type: NodeType.Text,
            value: message
         }]
      })
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
<span lay="av:[t:c2.s0]">Data</span>
```

---

### Single Text Node With Multiple Dynamic Segment

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
          key: "lay",
          value: "av:[t:c2.s1]",
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: `user data: ${user.name} - ${user.email}`,
        },
      ],
    });
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
<div lay="av:[t:c2.s1]">user data: John Doe - john@mail.com</div>
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
        { key: "lay", value: "av:[a.id:c2.s1 a.title:c2.s2 a.hidden:c2.s3]" },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });
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
  lay="av:[a.id:c2.s1 a.title:c2.s2 a.hidden:c2.s3]"
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
          key: "lay",
          value: "av:[a.title:c2.s1]",
        },
      ],

      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });
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
<div lay="av:[a.title:c2.s1]" title="Hello John">Profile</div>
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
          key: "lay",
          value: "av:[e.click:c2.a0]",
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
  };

  return {
    a0: save,
  };
}
```

Browser Gets:

```html
<button lay="av:[e.click:c2.a0]">Save</button>
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
        { key: "lay", value: "av:[a.value:c2.s0]" },
      ],
    });

    $.push({
      type: NodeType.EmptyTag,
      name: "input",
      attributes: [
        { key: "aria-label", value: email },
        { key: "lay", value: "av:[a.aria-label:c2.s1]" },
      ],
    });

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "lay",
          value: "av:[e.click:c2.a0 c2.a0:c2.s0 c2.a0:c2.s1]",
        },
      ],
      child: [{ type: NodeType.Text, value: "Save" }],
    });
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
<input lay="av:[a.value:c2.s0]" value="" />
<input lay="av:[a.aria-label:c2.s1]" aria-label="" />

<button lay="av:[e.click:c2.a0 c2.a0:c2.s0 c2.a0:c2.s1]">Save</button>
```

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
          key: "lay",
          value:
            "av:[e.click:c2.a0 c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile]",
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
  };

  return {
    a0: select,
  };
}
```

Browser Gets:

```html
<button lay="av:[e.click:c2.a0 c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile]">
  Edit
</button>
```

---

### Prop Resolution

```html
<!-- App.av -->
<script server>
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }
</script>
<header onAdd="{recordAdd}" count="{cartCount}" />
```

```html
<!-- Header.av -->
<script server>
  const {onAdd, count} = props<{
    onAdd:Function,
    count:number
  }>()
</script>
<Btn onClick="{onAdd}" label="{count}" />
```

```html
<!-- Btn.av -->
<script server>
  const {onAdd, count} = props<{
    onAdd:Function,
    count:number
  }>()
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
          key: "lay",
          // Directly interpolate the passed-down string token!
          value: `av:[e.click:${props.__onClick} t:${props.__label}]`,
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

browser gets:

```html
<!-- The string tokens flow straight down and are interpolated into the lay attribute -->
<button lay="av:[e.click:c2.a0 t:c2.s0]">Added 0</button>
```

---

### Prop Consumed by Local Action

Note:
When a component receives a function prop but doesn't bind it directly to an HTML element, the compiler tracks the local function that calls it. It then injects the \_\_ token into that local function's dependency list within the lay attribute. This ensures the client knows to pack the root parent's state when the local function is triggered via RPC.

user wirtes:

```html
<!-- App.av -->
<script server>
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }
</script>
<header onAdd="{recordAdd}" count="{cartCount}" />
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
          key: "lay",
          // Compiler sees submit (a0) calls props.onAdd.
          // It interpolates the __ token into a0's dependency list.
          value: `av:[e.click:c3.a0 c3.a0:${props.__onAdd}]`,
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

browser gets:

```html
<!-- Client knows: when c3.a0 fires, pack c2.a0's state for the server -->
<button lay="av:[e.click:c3.a0 c3.a0:c2.a0]">Add</button>
```

---

### Prop Consumed by Local State (Computed Values)

Note:
When a component receives a state prop and uses it to compute local state, the compiler injects the \_\_ token into the local state's dependency list in the lay attribute. This tells the client to pack the root parent's state alongside the local state during an RPC call, so the server can recompute the derived value correctly.

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
          key: "lay",
          // Compiler sees totalPrice (s0) depends on props.price.
          // It interpolates the __ token into s0's dependency list.
          value: `av:[t:c3.s0 c3.s0:${props.__price}]`,
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
<span lay="av:[t:c3.s0 c3.s0:c2.s0]">110</span>
```

---

### Prop Consumed by Both Script and Template

Note:
If a prop is used in both the script (e.g., passed to a local action) and directly in the HTML template, the compiler simply emits both dependencies in the lay attribute. The direct template usage gets its own token, and the script dependency gets its token appended to the local action/state dependency list.

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
          key: "lay",
          // a0 (increment) depends on __onAdjust and __qty
          value: `av:[e.click:c3.a0 c3.a0:${props.__onAdjust} c3.a0:${props.__qty}]`,
        },
      ],
      child: [{ type: NodeType.Text, value: "Add One" }],
    });

    $.push({
      type: NodeType.PairTag,
      name: "div",
      attributes: [
        {
          key: "lay",
          // Direct template consumption of qty
          value: `av:[t:${props.__qty}]`,
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

browser gets:

```html
<button lay="av:[e.click:c3.a0 c3.a0:c2.a0 c3.a0:c2.s0]">Add One</button>
<div lay="av:[t:c2.s0]">Current: 1</div>
```
