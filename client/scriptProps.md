### Script Props

Dsl:

```html
<!-- App.av -->
<script server>
  let cartCount = 0;
  function recordAdd() {
    cartCount++;
  }
</script>
<Head onAdd="{recordAdd}" count="{cartCount}" />
```

```html
<!-- Head.av -->
<script server>

  const {onAdd, count}= props<{
     onAdd:Function,
     count: number
  }>();

   function submit() {
      onAdd();
    }
</script>
<button onClick="{submit}">Add {count}</button>
```

IR (App):

```ts
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
        props: {
          onAdd: recordAdd,
          count: cartCount,
        },
        propsMeta: {
          onAdd: "c2a0",
          count: "c2s0",
        },
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
    template,
  };
}
```

IR (Header):

```ts
function Header({
  props,
  propsMeta,
}: {
  props: {
    onAdd: Function;
    count: number;
  };

  propsMeta: {
    onAdd: string;
    count: string;
  };
}) {

  const {onAdd, count}= props;


  function submit() {
    onAdd();
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "liz",
          value: `e:[on:click rpc:c3a0 s:]`,
        },
      ],
      child: [
         { 
            type: NodeType.Text,
             value: "Add"
              }
              ],
    });

    return $;
  };

  return {
    a0: submit,
    template
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
