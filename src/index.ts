import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { join } from "path";
import { toInjectableScript } from "./utils";
import { Toast } from "./tags";




// const RPCRegistry = new Map<string, Function>()
// const app = new Hono();

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

// serve(
//    {
//       fetch: app.fetch,
//       port: 3000,
//    },
//    (info) => {
//       console.log(`http://localhost:${info.port}`);
//    },
// );
