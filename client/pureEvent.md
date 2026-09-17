### No Arguments

Dsl:

```html
<script server>
  function save() {
    //...
  }
</script>
<button onClick="{save}">Save</button>
```

IR:


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
          key: "liz",
          value: "e:[on:click rpc:c2a0]",
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

Output:

```html
<button liz="e:[on:click rpc:c2a0]">Save</button>
```
