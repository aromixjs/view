import { serve } from "@hono/node-server";
import { readFile } from "fs/promises";
import { Hono } from "hono";
import { ComponentIR } from "./IR/componentIR";
import { ParseIR } from "./IR/parseIR";
import { readFileSync } from "fs";
import { join } from "path";
import * as esbuild from 'esbuild'
import { cors } from "hono/cors";
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
  app.use('*', cors())
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


  app.get('/parser.js', async (c) => {
    const result = await esbuild.build({
      entryPoints: [join(import.meta.dirname, 'lay', 'parser.ts')],
      bundle: true,
      write: false,
      format: 'esm',
      target: 'es2020',
      minify: true,
    })
    const bundledJs = result.outputFiles[0].text
    return c.body(bundledJs, 200, {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    })
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
