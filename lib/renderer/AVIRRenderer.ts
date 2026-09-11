import serializeJavascript from "serialize-javascript";
import { AVIR, AVTagNode } from "./IR.types";

export interface AVActionMeta {
   mutates: string[];
   reads: string[];
   params: string[];
   calls: string[];
}

export interface AVIRRendererConfig {
   IR: Array<AVIR>;
   uuid: string;
   actions: Record<string, AVActionMeta & { ref: Function }>;
}

export interface AVIRRenderResult {
   html: string;
   script: string;
}


export class AVIRRenderer {
   private config: AVIRRendererConfig;
   private meta: Record<string, unknown> = {};
   private events = new Set<string>();

   constructor(config: AVIRRendererConfig) {
      this.config = config;
   }

   public render() {
      this.meta = {};
      this.events = new Set();

      let html = "";
      for (const node of this.config.IR) {
         html += this.renderNode(node, true);
      }

      const payload = JSON.stringify({
         [this.config.uuid]: this.meta,
         events: [...this.events],
      }).replace(/</g, "\\u003c");

      const script = `<script type="application/json" id="av-${this.config.uuid}">${payload}</script>`;

      return { html, script };
   }

   private escapeHtml(value: string) {
      return value
         .replace(/&/g, "&amp;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");
   }


private resolveBindValue(bind:string,value:unknown) {
        if (typeof value === "function") {
         const action = this.config.actions[bind];
         if (!action) return undefined;
         const { ref, ...actionMeta } = action;
         return actionMeta;
      }
return value;
}

   private renderNode(node: AVIR, isRoot = false): string {
      if (node.type === "text") {
         if (node.bind) this.meta[node.bind] = this.resolveBindValue(node.bind, node.value);
         return this.escapeHtml(node.value);
      }
      return this.renderTag(node, isRoot);
   }

   private renderTag(node: AVTagNode, isRoot: boolean): string {
      let html = `<${node.name}`;
      if (isRoot) html += ` data-av="${this.escapeHtml(this.config.uuid)}"`;

      for (const attr of node.attributes) {
         if (attr.bind) {
            this.meta[attr.bind] = this.resolveBindValue(attr.bind, attr.value);
            if (attr.key.startsWith("on")) this.events.add(attr.key.slice(2));
            html += ` data-bind="${this.escapeHtml(attr.bind)}"`;
            continue;
         }
         html += ` ${attr.key}="${this.escapeHtml(String(attr.value))}"`;
      }

      html += ">";
      for (const child of node.children) {
         html += this.renderNode(child);
      }
      html += `</${node.name}>`;
      return html;
   }


}
