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
<Chead onAdd="{recordAdd}" count="{cartCount}" />
```

```html
<!-- Chead.av -->
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
          onAdd: {
            a: "c2a0",
            s: ["c2s0"],
          },
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
    onAdd: {
      a: string;
      s: Array<string>;
    };
    count: string;
  };
}) {
  const { onAdd, count } = props;

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
          // Transitive State Deps (d for deps)
          value: `e:[on:click rpc:c3a0 d:c2a0:[${propsMeta.onClick.s.map((s) => `s:${s}`).join(" ")}] ]`,
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Add",
        },
      ],
    });

    return $;
  };

  return {
    a0: submit,
    template,
  };
}
```

Browser Gets:

```html
<button sliz="e:[on:click rpc:c3a0 d:c2a0:[s:c2s0]]">Add</button>
```

---

### Prop Consumed by Local State (Computed Values)

Dsl:

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
  const {price} = props<{
    props:number
  }>()

  let totalPrice = price + 10;
</script>
<span>{totalPrice}</span>
```

IR (App):

```js
function App() {
  let basePrice = 100;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Display,
      instance: Display({
        props: {
          price: basePrice,
        },
        propsMeta: {
          price: "c2s0",
        },
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

IR (Display):

** This Is A huge issue its not good needs to change this  **

```js
function Display({props,propsMeta}:{

props:{
    props:number
  },
propsMeta:{
    props:string
}
}) {

  const {price} = props

  let totalPrice = price + 10;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "span",
      attributes: [
        {
          key: "liz",
          value: `t:c3.s0 c3.s0:${propsMeta.price}`,
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

Browser Gets(old):

```html
<!-- Client knows: if c3.s0 is involved in an RPC, pack c2.s0 too -->
<span sliz="t:c3.s0 c3.s0:c2.s0">110</span>
```
