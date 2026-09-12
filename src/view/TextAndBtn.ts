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
          trackId: 'c2t1',
          bind: [
            {
              to: "message",
              startOffset: 0,
              endOffset: 0
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
          trackId: 'c2t2',
          bind: [
            {
              to: 'data',
              startOffset: 0,
              endOffset: 0
            }
          ]
        },
      ],
      staticAttributes: [],
      events: [
        {
          key: "onclick",
          value: show,
          trackId: 'c2t3',
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
