import { AVComponentFactory } from "../compiler/componentTypes";
import { AVNode, AVNodeType } from "../compiler/templateTypes";
import { AvToHtml } from "./AvToHtml";
export interface RenderNodeConfig {
   node: AVNode;
   root: boolean;
   uuid: string;
   rpcRegistry: Map<string, AVComponentFactory>;
   onHtml(chunk: string): void;
   onEvent(event: string): void;
}

export function renderNode(config: RenderNodeConfig) {
   const { node, root, uuid, onHtml, onEvent, rpcRegistry } = config;

   // Handle Comments
   if (node.type === AVNodeType.Comment) {
      onHtml(`<!--${node.value}-->`);
   }

   // Handle Texts 
   if (node.type === AVNodeType.Text) {
      onHtml(node.value);
   }

   // Handle Pair Tag
   if (node.type === AVNodeType.PairTag) {
      onHtml(`<${node.name}`);
      if (root) {
         onHtml(` av${uuid}`);
      }

      for (const attr of node.attributes) {
         onHtml(` ${attr.key}="${attr.value}"`);
      }


      onHtml(">");
      for (const child of node.children) {
         renderNode({
            node: child,
            root: false,
            onHtml,
            onEvent,
            uuid,
            rpcRegistry,
         });
      }
      onHtml(`</${node.name}>`);
   }


   // Handle Empty Tag
   if (node.type === AVNodeType.EmptyTag) {
      onHtml(`<${node.name}`);
      if (root) {
         onHtml(` av${uuid}`);
      }

      for (const attr of node.attributes) {
         onHtml(` ${attr.key}="${attr.value}"`);
      }

      onHtml("/>");
   }

   // Handle Component
   if (node.type === AVNodeType.Component) {
      for (const ir of node.instance.template()) {
         renderNode({
            root: true,
            node: ir,
            onHtml,
            onEvent,
            uuid: node.ref.uuid,
            rpcRegistry,
         });
      }

   }
}
