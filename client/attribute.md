### Dynamic Attributes

Dsl:

```html
<script server>
  const title = "John";
  const elementId = "profile";
  const isHidden = false;
</script>

<div id="{elementId}" title="Hello {title}" hidden="{isHidden}">Profile</div>
```

IR:

```js
function Home() {
  const title = "John";
  const elementId = "profile";
  const isHidden = false;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",

      attributes: [
        { key: "id", value: elementId },
        { key: "title", value: `Hello ${name}` },
        { key: "hidden", value: isHidden },
        { key: "liz", value: "a:[id:c2s1 title:c2s2 hidden:c2s3]" },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });

    return $;
  };
  return {
    get s1() {
      return elementId;
    },
    get s2() {
      return `Hello ${name}`;
    },
    get s3() {
      return isHidden;
    },
  };
}
```

Output:

```html
<div liz="a:[id:c2s1 title:c2s2 hidden:c2s3]" id="profile" title="Hello John">
  Profile
</div>
```
