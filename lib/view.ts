import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { Hono } from "hono";
import { AVIRRenderer } from "./renderer/AVIRRenderer";

export interface AVTagFn {
   (): any
   uuid: string
}

// app.get("/", (c) => {
//    const tag = Toast();
//    RPCRegistry.set(Toast.uuid, Toast)
//    const renderer = new AVIRRenderer({
//       uuid: Toast.uuid,
//       htmlIR: tag.html(),
//    });

//    const html = renderer.toHtml()
//    const rootHtmlPath = join(import.meta.dirname, "./root.html");
//    const rootHtml = readFileSync(rootHtmlPath, {
//       encoding: "utf-8",
//    });

//    const finalHtml = rootHtml.replace("<!--root-->", html).replace(
//       "<!--meta-->",
//       toInjectableScript({
//          [Toast.uuid]: tag.meta,
//          events: ['click']
//       }),
//    );

//    return c.html(finalHtml, 200);
// });


// interface RpcBody {
//    componentId: string,
//    action: string,
//    state: Record<string, string>
// }

// app.post('/rpc', async (c) => {
//    const body: RpcBody = await c.req.json()
//    const cInstance = RPCRegistry.get(body.componentId)
//    if (!cInstance) {
//       return c.json({
//          data: null,
//          errors: ['Component not found'],
//       })
//    }

//    const meta = cInstance()
//    for (const [key, value] of Object.entries(body.state)) {
//       meta.update(key, value)
//    }

//    const action = meta.actions[body.action]
//    if (!action) {
//       return c.json({
//          data: null,
//          errors: ['Action not found'],
//       })
//    }

//    const actionMeta = meta.meta.actions[body.action];

//    if (!actionMeta) {
//       return c.json({
//          data: null,
//          errors: ['Action metadata not found'],
//       });
//    }



//    action()


//    const state: Record<string, unknown> = {};

//    for (const key of actionMeta.writes ?? []) {
//       state[key] = meta.meta.state[key];
//    }

//    return c.json({
//       data: {
//          componentId: body.componentId,
//          action: body.action,
//          state,
//       },
//       errors: [],
//    })
// })



// app.get('/client.js', (c) => {
//    const fp = join(import.meta.dirname, 'clientRuntime.js')
//    const content = readFileSync(fp).toString()
//    return c.text(content, 200)
// })


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