import { AvHtmlIR } from "./render";

export function Toast() {
  let message = "Test";

  function show(text: string) {
    message = text;
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
      message,
    },
    props: {},
    actions: {
      show: {
        reads: [],
        params: ["text"],
        calls: [],
      },
    },
  };

  const ReadOnlyState: any = {
    message,
  };

  return {
    uuid: "12485t",
    extract: (key: string) => {
      return ReadOnlyState[key];
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
