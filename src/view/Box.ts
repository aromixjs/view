import { AVComponentFactory, AVNode, AVNodeType } from "../../lib";

const Box: AVComponentFactory = () => {
  const content = "Content From Server";

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
          value: content,
          bind: "content",
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
