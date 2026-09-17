### Prop Consumed by Both Script and Template

Dsl:

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
     const {
       onAdjust,
       qty
     } = props<{
        onAdjust: Function,
        qty: number
     }>()

    function increment() {
      onAdjust(qty + 1);
    }
</script>
<button onClick="{increment}">Add One</button>
<div>Current: {qty}</div>
```

IR (CartItem):

```js
function CartItem({
   props,
   propsMeta
}:{
   props:{
        onAdjust: Function,
        qty: number
   },
   propsMeta:{
              onAdjust: {
               a:string,
               s:Array<string>
              },
        qty: number
   }
}) {


   const {onAdjust, qty} = props

  function increment() {
    onAdjust(qty + 1);
  }

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "liz",
          value: `e:[on:click rpc:c3a0  s:${propsMeta.qty}   ] c3.a0:${props.__onAdjust} c3.a0:${props.__qty}`,
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
