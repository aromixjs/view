import { ComponentIR } from "../../lib/IR/componentIR";
import { TemplateIR } from "../../lib/IR/templateIR";
import Box from "./Box";

const TextAndBtn: ComponentIR.Factory = () => {
  let message = "Test";
  const data = "background: red;";

  const show = () => {
    console.log(message);
  };

  const template = () => {
    const $: TemplateIR.Node[] = [];

    $.push({
      type: TemplateIR.NodeType.PairTag,
      name: "div",
      staticAttributes: [],
      events: [],
      dynamicAttributes: [],
      children: [
        {
          type: TemplateIR.NodeType.DynamicText,
          value: message,
          bind: [
            {
              to: "message",
              start: 0,
              length: message.length
            }
          ],
        },
      ],
    });

    $.push({
      type: TemplateIR.NodeType.PairTag,
      name: "button",
      dynamicAttributes: [
        {
          key: "style",
          value: data,
          bind: [
            {
              to: 'data',
              start: 0,
              length: data.length
            }
          ]
        },
      ],
      staticAttributes: [],
      events: [
        {
          key: "onclick",
          value: show,
          bind: "show",
        },
      ],
      children: [
        {
          type: TemplateIR.NodeType.StaticText,
          value: "Click ME",
        },
      ],
    });

    $.push({
      type: TemplateIR.NodeType.Component,
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
TextAndBtn.id = "c2";

export default TextAndBtn;
