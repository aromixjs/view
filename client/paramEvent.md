### Multiple Explicit Parameters

Dsl:

```html
<script server>
  function select(id, mode, section) {
    // ...
  }
</script>

<button onClick="{select('12345', 'edit', 'profile')}">Edit</button>
```

IR:


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
          value: "e:[on:click rpc:c2a0 p0:12345 p1:edit p2:profile]",
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

Output:

```html
<button liz="e:[on:click rpc:c2a0 p0:12345 p1:edit p2:profile]">
  Edit
</button>
```
