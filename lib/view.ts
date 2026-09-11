import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { AVIRRenderer } from "./renderer/AVIRRenderer";
import { AVComponentFactory } from "./compiler/componentDefTypes";
export interface ViewConfig {
   route: Array<{
      path: string,
      load: Promise<{ default: AVComponentFactory }>
   }>
   port: number,
   base: string
}

export async function view(config: ViewConfig) {
   const app = new Hono()
   const RPCRegistry = new Map<string, Function>()
   const rootHtml = readFileSync(config.base).toString()


   for (const route of config.route) {
      const { path, load } = route;
      const {default:componentFactory} = await load

      const uuid = componentFactory.uuid;
      RPCRegistry.set(uuid, componentFactory);


      app.get(path, (c) => {
         const instance = componentFactory();

         const renderer = new AVIRRenderer({
            uuid: componentFactory.uuid,
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