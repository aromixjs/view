### Template Props

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
  let {onAdd, count}= props<{
     onAdd:Function,
     count:number
  }>();
</script>
<button onClick="{onAdd}" label="{count}" />
```

```html
<!-- Button.av -->
<script server>
  let {onClick, label} = props<{
       onClick:Function,
       label:number
    }>();
</script>
<button onClick="{onClick}">Added {label}</button>
```

IR:

```ts
// App.av.ts
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
            s: ['c2s0']
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
  };
}
```

IR (Header):

```ts
// Header.av.ts
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
      a:string,
      s: Array<string>
    };
    count: string;
  };
}) {
  let { onAdd, count } = props;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Component,
      ref: Button,
      instance: Button({
        props: {
          onClick: props.onAdd,
          label: props.count,
        },
        propsMeta: {
          onClick: propsMeta.onAdd,
          label: propsMeta.count,
        },
      }),
    });

    return $;
  };

  return {
    template,
  };
}
```

IR (Button):

```ts
function Button({
  props,
  propsMeta,
}: {
  props: {
    onClick: Function;
    label: number;
  };
  propsMeta: {
    onClick: {
      a:string,
      s: Array<string>
    };
    label: string;
  };
}) {
  const { onClick, label } = props;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "liz",
          value: `e:[on:click rpc:${propsMeta.onClick.a} ${propsMeta.onClick.s.map(s=>`s:${s}`).join(' ')}] t:${propsMeta.label}`,
        },
      ],
      events: [
        {
          key: "onclick",
          value: onClick,
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: `Added  ${label}`,
        },
      ],
    });

    return $;
  };

  return { template };
}
```

Browser Gets:

```html
<button liz="e:[on:click rpc:c2a0 s:c2s0] t:c2s0">Added 0</button>
```
