import { serve } from "@hono/node-server";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { ComponentIR } from "./IR/componentIR";
import { ParseIR, ToHtml } from "./IR/parseIR";
export interface ViewConfig {
  route: Array<{
    path: string;
    load: Promise<{ default: ComponentIR.Factory }>;
  }>;
  port: number;
  base: string;
}

export async function view(config: ViewConfig) {
  const app = new Hono();
  const registry = new Map<string, ComponentIR.Factory>();
  const baseHtml = await readFile(config.base, { encoding: "utf-8" });

  for (const route of config.route) {
    const { path, load } = route;
    const { default: factory } = await load;

    app.get(path, (c) => {
      const { html, meta } = ToHtml({
        registry,
        factory
      });
      // const finalHtml = baseHtml.replace('<!--root-->', html).replace('<!--meta-->', `<script type="application/json">${JSON.stringify(meta)}</script>`)

      return c.json(meta, 200);
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
