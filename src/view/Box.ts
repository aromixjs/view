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
      attributes: [],

      children: [
        {
          type: TemplateIR.NodeType.Text,
          value: content,
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
Box.id = "c1";

export default Box;
