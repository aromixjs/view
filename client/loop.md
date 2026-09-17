### Looping

Dsl:

```html
<script server>
  const users = [
    {
      name: "John",
    },
    {
      name: "Jane",
    },
  ];
</script>

<ul>
  <li .for="{user in users}">{user.name}</li>
</ul>
```

IR:

```js
function Home() {
  const users = [
    {
      name: "John",
    },
    {
      name: "Jane",
    },
  ];

  const b0 = () => {
    const $ = [];
    for (user in users) {
      $.push({
        type: NodeType.PairTag,
        name: "li",
        attributes: [
          {
            key: "liz",
            value: "b:c2b0 t:c2s0",
          },
        ],
        children: [
          {
            type: NodeType.Text,
            value: user.name,
          },
        ],
      });
    }

    return $;
  };

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "ui",
      attributes: [],
      children: [
        {
          type: NodeType.Block,
          value: b0(),
        },
      ],
    });

    return $;
  };

  return {
    get s0() {
      return users;
    }
    b0,
    template
  };
}
```

Output:

```html
<ul>
  <li liz="b:c2b0 t:c2s0">John</li>
  <li liz="b:c2b0 t:c2s0">Jane</li>
</ul>
```
