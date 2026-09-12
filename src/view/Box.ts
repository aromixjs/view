import { ComponentIR } from "../../lib/IR/componentIR";
import { TemplateIR } from "../../lib/IR/templateIR";


const Box: ComponentIR.Factory = () => {
  const content = "Content From Server";

  const template = () => {
    const $: TemplateIR.Node[] = [];
    $.push({
      type: TemplateIR.NodeType.PairTag,
      name: "div",
      events: [],
      staticAttributes: [],
      dynamicAttributes: [],
      children: [
        {
          type: TemplateIR.NodeType.DynamicText,
          value: content,
          bind: "content",
          startOffset: 0,
          endOffset: 0
        },
      ],
    });
    return $;
  };

  return {
    state: {
      get content() {
        return content;
      },
    },
    template,
    props: {},
    actions: {},
  };
};
Box.uuid = "45ers";

export default Box;
