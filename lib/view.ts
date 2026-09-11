import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { AVIRRenderer } from "./renderer/AVIRRenderer";
export interface ViewConfig {
   route: Array<{
      path: string,
      tag: AVTagFn
   }>
   port: number,
   rootPath: string
}

export function view(config: ViewConfig) {
   const app = new Hono()
   const RPCRegistry = new Map<string, Function>()
   const rootHtml = readFileSync(config.rootPath).toString()


   for (const route of config.route) {
      const { path, tag } = route;
      const uuid = tag.uuid;
      RPCRegistry.set(uuid, tag);


      app.get(path, (c) => {
         const instance = tag();

         const renderer = new AVIRRenderer({
            uuid: tag.uuid,
            IR: instance.template(),
            actions: instance.actions
         })

         const { html, script } = renderer.render()

         const finalHtml = rootHtml.replace("<!--root-->", html).replace("<!--meta-->", script)
         return c.html(finalHtml, 200);
      });
   }


   serve({
      fetch: app.fetch,
      port: config.port,
   }, (info) => {
      console.log(info);
   })
}