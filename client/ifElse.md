### Control Flow

User Writes:

```html
<script server>
  let isLoggedIn = false;
  function login() {
    isLoggedIn = true;
  }
  function logout() {
    isLoggedIn = false;
  }
</script>

<div .if="{isLoggedIn}">
  <button onClick="{logout}">Welcome Back!</button>
</div>
<div .else>
  <button onClick="{login}">Please Login</button>
</div>
```

Component IR Generated:

```js
function Home() {
  let isLoggedIn = false;
  function login() {
    isLoggedIn = true;
  }
  function logout() {
    isLoggedIn = false;
  }

  const b0 = () => {
    const $ = [];

    if (isLoggedIn) {
      $.push({
        type: NodeType.PairTag,
        name: "div",
        attributes: [
          {
            key: "liz",
            value: "b:c1b0",
          },
        ],
        child: [
          {
            type: NodeType.PairTag,
            name: "button",
            attributes: [
              {
                key: "liz",
                value: "e:[on:click rpc:c1a0 s:c1s0]",
              },
            ],
            events: [
              {
                key: "onclick",
                value: logout,
              },
            ],
            child: [
              {
                type: NodeType.Text,
                value: "Welcome Back!",
              },
            ],
          },
        ],
      });
    } else {
      $.push({
        type: NodeType.PairTag,
        name: "div",
        attributes: [
          {
            key: "liz",
            value: "b:c1b0",
          },
        ],
        child: [
          {
            type: NodeType.PairTag,
            name: "button",
            attributes: [
              {
                key: "liz",
                value: "e:[on:click rpc:c1a1 s:c1s0]",
              },
            ],
            events: [
              {
                key: "onclick",
                value: login,
              },
            ],
            child: [
              {
                type: NodeType.Text,
                value: "Please Login",
              },
            ],
          },
        ],
      });
    }

    return $;
  };

  const template = () => {
    const $ = [];

    $.push({
      type: NodeType.Block,
      value: b0(),
    });
    return $;
  };

  return {
    a0: logout,
    a1: login,
    b0,
    template,
  };
}
```

Browser Gets:

```html
<div liz="b:c1b0">
  <button liz="e:[on:click rpc:c1a1 s:c1s0]">Please Login</button>
</div>
```
