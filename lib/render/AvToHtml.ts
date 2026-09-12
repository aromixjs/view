import { AVComponentFactory } from "../compiler/componentTypes";
import { renderNode } from "./renderNode";

export interface AvToHtmlConfig {
  base: string;
  rpcRegistry: Map<string, AVComponentFactory>;
  factory: AVComponentFactory;
}

export function AvToHtml(config: AvToHtmlConfig) {
  const { factory, rpcRegistry, base } = config;

  const uuid = factory.uuid;
  rpcRegistry.set(uuid, factory);

  const instance = factory();
  const htmlIR = instance.template();

  const html: string[] = [];
  const events = new Set<string>();

  for (const node of htmlIR) {
    renderNode({
      node,
      root: true,
      uuid,
      onHtml(chunk) {
        html.push(chunk);
      },
      onEvent(e) {
        events.add(e);
      },
      rpcRegistry,
    });
  }

  const eventArray = [...events];
  return base
    .replace("<!--root-->", html.join(""))
    .replace(
      "<!--meta-->",
      `<script type="application/json">${JSON.stringify(eventArray)}</script>`,
    );
}
