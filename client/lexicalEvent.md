### Lexical State Dependencies

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
<button onclick="{update}">Save</button>
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
        { key: "liz", value: "a:[value:c2s0]" },
      ],
    });

    $.push({
      type: NodeType.EmptyTag,
      name: "input",
      attributes: [
        { key: "aria-label", value: email },
        { key: "liz", value: "a:[aria-label:c2s1]" },
      ],
    });

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "liz",
          value: "e:[on:click rpc:c2a0 s:c2s0 s:c2s1]",
        },
      ],
      child: [{ type: NodeType.Text, value: "Save" }],
    });

    return $;
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
<input liz="a:[value:c2s0]" value="" />
<input liz="a:[aria-label:c2s1]" aria-label="" />

<button liz="e:[on:click rpc:c2a0 s:c2s0 s:c2s1]">Save</button>
```
