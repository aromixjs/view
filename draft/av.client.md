### Single Dynamic Text

User Writes:

```html
<script server>
  let message = "Data";
</script>
<span>{message}</span>
```

Component IR Generated:

```js
function Home() {
   let message = "Data";

   const template = () => {
      const $ = []

      $.push({
         type: NodeType.PairTag,
         name: 'span',
         attributes: [{
            key: 'lay',
            value: 'av:[t:c2.s0]' // t for text
         }]
         child: [{
            type: NodeType.Text,
            value: message
         }]
      })
   }

   return {
      get s0() {
         return message
      },
   };
}
```

Browser Gets:

```html
<span lay="av:[t:c2.s0]">Data</span>
```

---

### Single Text Node With Multiple Dynamic Segment

> **Note:**
>
> Due to time constraints, V1 uses a naive full-text replacement strategy for text nodes containing multiple dynamic expressions.
>
> **TODO:**
>
> Update multi-segment text handling to support compact incremental updates. The compiled metadata should retain the positions of each dynamic expression within the single text node so that, when one expression changes, the runtime can update only that portion of the text node instead of reconstructing and replacing the entire text value. Positions must remain correct when earlier dynamic expressions change length.

User Writes:

```html
<script server>
  import { kv } from "#kv";
  const user = kv.get("user:12345");
</script>
<div>user data: {user.name} - {user.email}</div>
```

Component IR Generated:

```js
import { kv } from "#kv";

function Home() {
  const user = kv.get("user:12345");

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",
      attributes: [
        {
          key: "lay",
          value: "av:[t:c2.s1]",
        },
      ],
      child: [
        {
          type: NodeType.Text,
          value: `user data: ${user.name} - ${user.email}`,
        },
      ],
    });
  };

  return {
    get s1() {
      return `user data: ${user.name} - ${user.email}`;
    },
  };
}
```

Browser Gets:

```html
<div lay="av:[t:c2.s1]">user data: John Doe - john@mail.com</div>
```

---

### Dynamic Attributes

User Writes:

```html
<script server>
  const title = "User Profile";
  const elementId = "profile";
  const isHidden = false;
</script>

<div id="{elementId}" title="{title}" hidden="{isHidden}">Profile</div>
```

Component IR Generated:

```js
function Home() {
  const title = "User Profile";
  const elementId = "profile";
  const isHidden = false;

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",

      attributes: [
        { key: "id", value: elementId },
        { key: "title", value: title },
        { key: "hidden", value: isHidden },
        { key: "lay", value: "av:[a.id:c2.s1 a.title:c2.s2 a.hidden:c2.s3]" },
      ],
      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });
  };
  return {
    get s1() {
      return elementId;
    },
    get s2() {
      return title;
    },
    get s3() {
      return isHidden;
    },
  };
}
```

Browser Gets:

```html
<div
  lay="av:[a.id:c2.s1 a.title:c2.s2 a.hidden:c2.s3]"
  id="profile"
  title="User Profile"
>
  Profile
</div>
```

---

### Single Attribute With a Single Dynamic Segment

User Writes:

```html
<script server>
  const name = "John";
</script>

<div title="Hello {name}">Profile</div>
```

Component IR Generated:

```js
function Home() {
  const name = "John";

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.PairTag,
      name: "div",

      attributes: [
        {
          key: "title",
          value: `Hello ${name}`,
        },
        {
          key: "lay",
          value: "av:[a.title:c2.s1]",
        },
      ],

      child: [
        {
          type: NodeType.Text,
          value: "Profile",
        },
      ],
    });
  };

  return {
    get s1() {
      return `Hello ${name}`;
    },
  };
}
```

Browser Gets:

```html
<div lay="av:[a.title:c2.s1]" title="Hello John">Profile</div>
```

---

### Single Event With No Arguments

User Writes:

```html
<script server>
  function save() {
    //...
  }
</script>
<button onClick="{save}">Save</button>
```

Component IR Generated:

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
          key: "lay",
          value: "av:[e.click:c2.a0]",
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
  };

  return {
    a0: save,
  };
}
```

Browser Gets:

```html
<button lay="av:[e.click:c2.a0]">Save</button>
```

---

### Event With Multiple Lexical State Dependencies

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
<button onClick="{update}">Save</button>
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
        { key: "lay", value: "av:[a.value:c2.s0]" },
      ],
    });

    $.push({
      type: NodeType.EmptyTag,
      name: "input",
      attributes: [
        { key: "aria-label", value: email },
        { key: "lay", value: "av:[a.aria-label:c2.s1]" },
      ],
    });

    $.push({
      type: NodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: "lay",
          value: "av:[e.click:c2.a0 c2.a0:c2.s0 c2.a0:c2.s1]",
        },
      ],
      child: [{ type: NodeType.Text, value: "Save" }],
    });
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
<input lay="av:[a.value:c2.s0]" value="" />
<input lay="av:[a.aria-label:c2.s1]" aria-label="" />

<button lay="av:[e.click:c2.a0 c2.a0:c2.s0 c2.a0:c2.s1]">Save</button>
```

### Event With Multiple Explicit Parameters

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
          key: "lay",
          value:
            "av:[e.click:c2.a0 c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile]",
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
  };

  return {
    a0: select,
  };
}
```

Browser Gets:

```html
<button lay="av:[e.click:c2.a0 c2.a0:p.12345 c2.a0:p.edit c2.a0:p.profile]">
  Edit
</button>
```
