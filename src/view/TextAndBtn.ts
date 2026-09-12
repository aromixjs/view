import { AVComponentFactory, AVNode, AVNodeType } from "../../lib";
import Box from "./Box";

const TextAndBtn: AVComponentFactory = () => {
  let message = "Test";

  const show = () => {
    console.log(message);
  };

  const template = () => {
    const $: AVNode[] = [];

    $.push({
      type: AVNodeType.PairTag,
      name: "div",
      attributes: [],
      events: [],
      children: [
        {
          type: AVNodeType.Text,
          value: message,
          bind: "message",
        },
      ],
    });

    $.push({
      type: AVNodeType.PairTag,
      name: "button",
      attributes: [
        {
          key: 'style',
          value: 'background: red;',
          bind: null
        }
      ],
      events: [
        {
          key: "onclick",
          value: show,
          bind: "show",
        },
      ],
      children: [
        {
          type: AVNodeType.Text,
          value: "Click ME",
          bind: null,
        },
      ],
    });

    $.push({
      type: AVNodeType.Component,
      instance: Box(),
      ref: Box,
    });

    return $;
  };

  return {
    state: {
      get message() {
        return message;
      },
      set message(value) {
        message = value;
      },
    },

    props: {},
    actions: {
      show: {
        writes: ["message"],
        reads: ["message"],
        parameters: [],
        triggers: [],
        ref: show,
      },
    },
    template,
  };
};
TextAndBtn.uuid = "12sdf";

export default TextAndBtn;
