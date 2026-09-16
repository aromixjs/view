### Multiple Explicit Parameters

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
          value: "e:[on:click rpc:c2a0 p:12345 p:edit p:profile]",
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
<button liz="e:[on:click rpc:c2a0 p:12345 p:edit p:profile]">
  Edit
</button>
```
