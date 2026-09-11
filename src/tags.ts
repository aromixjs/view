import { AvHtmlIR } from "./render";

export function Toast() {
  let message = "Test";

  function show() {
    message = crypto.randomUUID();
  }

  const html = () => {
    const _: AvHtmlIR[] = [];

    _.push({
      type: "tag",
      name: "div",
      attributes: {
        "data-bind": "message",
      },
      children: [
        {
          type: "text",
          value: message,
        },
      ],
    });

    _.push({
      type: "tag",
      name: "button",
      attributes: {
        // onclick: show,
        "data-click": "show",
      },
      children: [
        {
          type: "text",
          value: "Click ME",
        },
      ],
    });

    return _;
  };

  const meta = {
    state: {
      get message() {
        return message;
      },
    },
    props: {},
    actions: {
      show: {
        reads: ['message'],
        params: [],
        calls: [],
      },
    },
  };



  return {
    extract: (key: string) => {
      return key === "message" ? message : undefined;
    },

    update(key: string, value: any) {
      if (key === "message") {
        message = value;
      }
    },

    actions: {
      show,
    },
    html,
    meta,
  };
}


Toast.uuid = '12sdf'