import { Box } from "./Box";
export function TextAndBtn() {
  let message = "Test";

  const show = () => {
    console.log(message);
  }

  const template = () => {
    const $ = [];

    $.push({
      type: "tag" as const,
      name: "div",
      attributes: [],
      children: [
        {
          type: "text" as const,
          value: message,
          bind: 'message'
        },
      ],
    });

    $.push({
      type: "tag" as const,
      name: "button",
      attributes: [
        {
          key: 'onclick',
          value: show,
          bind: 'show'
        }
      ],
      children: [
        {
          type: "text" as const,
          value: "Click ME",
        },
      ],
    });



    $.push({
      type: 'avt' as const,
      instance: Box(),
      uuid: Box.uuid,
      ref: Box
    })

    return $;
  };


  return {
    state: {
      get message() {
        return message;
      },
      set message(value) {
        message = value
      }
    },

    props: {},
    actions: {
      show: {
        mutates: ['message'],
        reads: ['message'],
        params: [],
        calls: [],
        ref: show
      },
    },
    template,
  };
}
TextAndBtn.uuid = '12sdf'