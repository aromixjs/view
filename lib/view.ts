import { serve } from "@hono/node-server";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { ComponentIR } from "./IR/componentIR";
import { ParseIR } from "./IR/parseIR";
import { readFileSync } from "fs";
import { join } from "path";

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
      const html = ParseIR.ToHtml({
        registry,
        factory,
      });
      const finalHtml = baseHtml.replace("<!--root-->", html);

      return c.html(finalHtml, 200);
    });
  }



  app.get('/layos', (c) => {

    const lay = readFileSync(join(import.meta.dirname, 'layos.js')).toString()
    c.header('Content-Type', 'application/javascript')
    c.header('Cache-Control', 'public, max-age=3600')
    return c.text(lay)
  })


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
