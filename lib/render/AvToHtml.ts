import { AVComponentFactory } from "../compiler/componentTypes";
import { AVPageMeta } from "./AvPageMeta";
import { renderNode } from "./renderNode";
export interface AvToHtmlConfig {
  base: string;
  meta: AVPageMeta
  factory: AVComponentFactory;
}

export function AvToHtml(config: AvToHtmlConfig) {
  const { factory, meta, base } = config;
  meta.registerComponent(factory)

  const avIr = factory().template();
  const html: string[] = [];


  for (const node of avIr) {
    renderNode({
      node,
      root: true,
      uuid: factory.uuid,
      onHtml(chunk) {
        html.push(chunk);
      },
      meta
    });
  }


  return base
    .replace("<!--root-->", html.join(""))

}
