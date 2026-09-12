import { serve } from "@hono/node-server";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { AVComponentFactory } from "./compiler/componentTypes";
import { AvToHtml } from "./render/AvToHtml";
import { AVPageMeta } from "./render/AvPageMeta";
export interface ViewConfig {
  route: Array<{
    path: string;
    load: Promise<{ default: AVComponentFactory }>;
  }>;
  port: number;
  base: string;
}

export async function view(config: ViewConfig) {
  const app = new Hono();
  const componentRegistry = new Map<string, AVComponentFactory>();
  const baseHtml = await readFile(config.base, { encoding: "utf-8" });

  for (const route of config.route) {
    const { path, load } = route;
    const { default: componentFactory } = await load;

    app.get(path, (c) => {
      const output = AvToHtml({
        meta: new AVPageMeta(componentRegistry),
        base: baseHtml,
        factory: componentFactory,
      });

      return c.html(output, 200);
    });
  }

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (info) => {
      console.log(info);
    },
  );
}
