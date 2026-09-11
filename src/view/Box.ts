export function Box() {
  const content = 'Content From Server'

  const template = () => {
    const $ = []
    $.push({
      type: 'tag' as const,
      name: 'div',
      attributes: [],
      children: [
        {
          type: 'text' as const,
          value: content,
          bind: 'content'
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
    props: {}
  }

}
Box.uuid='45ers'