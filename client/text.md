### Dynamic Text

User Writes:

```html
<script server>
  import { kv } from "#kv";
  const user = kv.get("user:12345");
  let message = "Data";
</script>
<span>{message}</span>
<div>user data: {user.name} - {user.email}</div>
```

Component IR Generated:

```js
async function Home() {
  const user = kv.get("user:12345");
  let message = "Data";

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "span",
      attributes: [
        {
          key: "liz",
          value: "t:c2s0",
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: message,
        },
      ],
    });

    $.push({
      type: NodeType.PairTag,
      name: "div",
      attributes: [
        {
          key: "liz",
          value: "t:c2s1",
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
    get s0() {
      return message;
    },
    get s1() {
      return `user data: ${user.name} - ${user.email}`;
    },
  };
}
```

Browser Gets:

```html
<span liz="t:c2s0">Data</span>
<div liz="t:c2s1">user data: John Doe - john@mail.com</div>
```