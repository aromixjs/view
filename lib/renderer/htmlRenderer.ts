import serializeJavascript from "serialize-javascript";
import { AVIR, AVTagNode } from "./IR.types";


export interface HtmlRendererConfig {
   IR: Array<AVIR>;
   uuid: string;
}

export class HtmlRenderer {
   private config: HtmlRendererConfig;
   constructor(config: HtmlRendererConfig) {
      this.config = config;
   }

   public serialize() {
      let html = "";
      for (const node of this.config.IR) {
         html += this.renderRoot(node);
      }
      return html;
   }

   private escapeHtml(value: string) {
      return value
         .replace(/&/g, "&amp;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");
   }

   private renderRoot(node: AVIR) {
      switch (node.type) {
         case "text":
            return this.escapeHtml(node.value);

         case "tag":
            return this.renderRootTag(node);
      }
   }

   private renderRootTag(node: AVTagNode) {
      let html = `<${node.name} data-av="${this.escapeHtml(this.config.uuid)}"`;

      for (const [key, value] of Object.entries(node.attributes)) {
         html += ` ${key}="${this.escapeHtml(value)}"`;
      }

      html += ">";
      for (const child of node.children) {
         html += this.renderNode(child);
      }

      html += `</${node.name}>`;
      return html;
   }

   private renderNode(node: AVIR): string {
      switch (node.type) {
         case "text":
            return this.escapeHtml(node.value);
         case "tag":
            return this.renderTag(node);
      }
   }

   private renderTag(node: AVTagNode): string {
      let html = `<${node.name}`;
      for (const [key, value] of Object.entries(node.attributes)) {
         html += ` ${key}="${this.escapeHtml(value)}"`;
      }
      html += ">";
      for (const child of node.children) {
         html += this.renderNode(child);
      }
      html += `</${node.name}>`;
      return html;
   }

   toInjectableScript(metaObj: object) {
      const script = ["<script>", "window.AVM", "=", serializeJavascript(metaObj), "</script>"];

      return script.join("");
   }

}
