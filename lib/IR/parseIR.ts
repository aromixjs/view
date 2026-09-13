import { ComponentIR } from "./componentIR";
import { TemplateIR } from "./templateIR";


export namespace ParseIR {
  export interface ToCallbackConfig {
    node: TemplateIR.Node;
    onText(node: TemplateIR.TextNode): void
    onComment(node: TemplateIR.CommentNode): void
    onPairTag(node: TemplateIR.PairTagNode): void
    onEmptyTag(node: TemplateIR.EmptyTagNode): void
    onComponent(node: TemplateIR.ComponentNode): void
  }

  export function ToCallback(config: ToCallbackConfig) {
    const {
      node,
      onComment,
      onText,
      onPairTag,
      onEmptyTag,
      onComponent
    } = config

    switch (node.type) {
      case TemplateIR.NodeType.Comment:
        onComment(node)
        break;
      case TemplateIR.NodeType.Text:
        onText(node)
        break;
      case TemplateIR.NodeType.PairTag:
        onPairTag(node)
        break;
      case TemplateIR.NodeType.EmptyTag:
        onEmptyTag(node)
        break;
      case TemplateIR.NodeType.Component:
        onComponent(node)
        break;
    }
  }

  export interface ToHtmlConfig {
    factory: ComponentIR.Factory
    registry: Map<string, ComponentIR.Factory>

  }

  export function ToHtml({
    factory,
    registry
  }: ToHtmlConfig) {

    const instance = factory()
    registry.set(factory.id, factory);
    const html: string[] = [];

    const render = (node: TemplateIR.Node) => {
      ToCallback({
        node,
        onText(node) {
          html.push(node.value)
        },
        onComment(node) {
          html.push('<!--', node.value, '-->')
        },
        onPairTag(node) {
          html.push('<', node.name)
          for (const attr of node.attributes) {
            html.push(' ', attr.key, '="', attr.value, '"')
          }

          html.push('>')

          for (const child of node.children) {
            render(child);
          }
          html.push("</", node.name, ">");
        },
        onEmptyTag(node) {
          html.push("<", node.name);

          for (const attr of node.attributes) {
            html.push(' ', attr.key, '="', attr.value, '"')
          }

          html.push('/>')
        },
        onComponent(node) {
          registry.set(node.ref.id, node.ref);
          for (const child of node.instance.template()) {
            render(child);
          }
        }
      })
    }

    for (const node of instance.template()) {
      render(node);
    }

    return html.join('')
  }



}
