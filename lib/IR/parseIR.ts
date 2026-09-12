import { ComponentIR } from "./componentIR";
import { TemplateIR } from "./templateIR";


export namespace ParseIR {

   export interface ToCallbackConfig {
      node: TemplateIR.Node;
      onStaticText(node: TemplateIR.StaticTextNode): void
      onDynamicText(node: TemplateIR.DynamicTextNode): void
      onComment(node: TemplateIR.CommentNode): void
      onPairTag(node: TemplateIR.PairTagNode): void
      onEmptyTag(node: TemplateIR.EmptyTagNode): void
      onComponent(node: TemplateIR.ComponentNode): void
   }

   export function ToCallback(config: ToCallbackConfig) {
      const {
         node,
         onComment,
         onStaticText,
         onDynamicText,
         onPairTag,
         onEmptyTag,
         onComponent
      } = config

      switch (node.type) {
         case TemplateIR.NodeType.Comment:
            onComment(node)
            break;
         case TemplateIR.NodeType.StaticText:
            onStaticText(node)
            break;
         case TemplateIR.NodeType.DynamicText:
            onDynamicText(node)
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




   export function ToHtml(
      registry: Map<string, ComponentIR.Factory>,
      factory: ComponentIR.Factory,
   ) {

      const instance = factory()
      registry.set(factory.id, factory);
      const html: string[] = [];
      const meta: Record<string, any> = {}

      const render = (node: TemplateIR.Node) => {
         ToCallback({
            node,
            onStaticText(node) {
               html.push(node.value)
            },
            onDynamicText(node) {
               html.push(node.value)
               meta[node.trackId] = node.bind
            },
            onComment(node) {
               html.push('<!--', node.value, '-->')
            },
            onPairTag(node) {
               html.push('<', node.name)
               for (const attr of node.dynamicAttributes) {
                  html.push(' ', attr.key, '="', attr.value, '"')
                  meta[attr.trackId] = attr.bind
               }

               for (const attr of node.staticAttributes) {
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

               for (const attr of node.dynamicAttributes) {
                  html.push(' ', attr.key, '="', attr.value, '"')
                  meta[attr.trackId] = attr.bind
               }

               for (const attr of node.staticAttributes) {
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

      return { html: html.join(''), meta }
   }







}
