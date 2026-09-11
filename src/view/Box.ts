import { AVComponentFactory, AVNode, AVNodeType } from "../../lib"

export const Box: AVComponentFactory = () => {
  const content = 'Content From Server'

  const template = () => {
    const $: AVNode[] = []
    $.push({
      type: AVNodeType.PairTag,
      name: 'div',
      attributes: [],
      children: [
        {
          type: AVNodeType.Text,
          value: content,
          bind: 'content',
          children: []
        }
      ]
    })
    return $
  }


  return {
    state: {
      get content() {
        return content
      }
    },
    template,
    props: {},
    actions: {}
  }

}
Box.uuid = '45ers'