import { Hono } from "hono";
import { serve } from "@hono/node-server";

export interface AVTagFn {
   (): any
   uuid: string
}


export interface ViewConfig {
   routes: Array<{
      path: string,
      render: AVTagFn
   }>
   port: number,
}
export function view(config: ViewConfig) {
   const app = new Hono()
   const RPCRegistry = new Map<string, Function>()
   for (const route of config.routes) {
      const { path, render } = route;
      const uuid = render.uuid;
      RPCRegistry.set(uuid, render);


      app.get(path, (c) => {
         const instance = render();
         const ir = instance.html();
         return c.json(ir);
      });
   }


   serve({
      fetch: app.fetch,
      port: config.port,
   })
}