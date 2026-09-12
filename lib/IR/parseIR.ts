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
      const { onComment, onStaticText, onDynamicText, node, onPairTag, onEmptyTag, onComponent } = config
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


   export interface ToHtmlConfig {
      factory: ComponentIR.Factory;
      registry: Map<string, ComponentIR.Factory>;
   }

   export function ToHtml(config: ToHtmlConfig) {
      const { factory, registry } = config;

      registry.set(factory.uuid, factory);

      const instance = factory();
      const html: string[] = [];

      for (const node of instance.template()) {
         ParseIR.ToCallback({
            node,
            onStaticText(node) {
            },
            onDynamicText(node) {
            },
            onComment(node) {
            },
            onPairTag(node) {
            },
            onEmptyTag(node) {
            },
            onComponent(node) {
            }
         })
      }
   }





}
