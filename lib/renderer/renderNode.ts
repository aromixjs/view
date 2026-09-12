import { AVComponentFactory } from "../compiler/componentDefTypes"
import { AVNode, AVNodeType } from "../compiler/templateIRTypes"

export interface RenderNodeConfig {
   node: AVNode
   root: boolean,
   uuid: string,
   rpcRegistry: Map<string, AVComponentFactory>
   onHtml(...chunk: Array<string>): void
   onEvent(event: string): void

}

export function renderNode(config: RenderNodeConfig) {
   const { node, root, uuid, onHtml, onEvent, rpcRegistry } = config

   switch (node.type) {
      case AVNodeType.PairTag: {
         onHtml('<', node.name)
         if (root) {
            onHtml(" ", "data-av=\"", uuid, "\"")
         }

         onHtml(">");
         for (const child of node.children) {
            renderNode({
               node: child,
               root: false,
               onHtml,
               onEvent,
               uuid,
               rpcRegistry
            })
         }
         onHtml("</", node.name, ">");
         break;
      }
      case AVNodeType.EmptyTag: {
         onHtml('<', node.name)
         if (root) {
            onHtml(" ", "data-av=\"", uuid, "\"")
         }

         onHtml('/>')
         break;
      }
      case AVNodeType.Text: {
         onHtml(node.value)
         break;
      }
      case AVNodeType.Component: {
         break;
      }
   }
}
