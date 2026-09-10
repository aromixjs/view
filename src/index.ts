import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { join } from "path";
import { toInjectableScript } from "./utils";
import { Toast } from "./tags";
import { AVIRRenderer } from "./render";

const app = new Hono();

app.get("/", (c) => {
   const tag = Toast();

   const renderer = new AVIRRenderer({
      uuid: tag.uuid,
      htmlIR: tag.html(),
   });


   const html = renderer.toHtml()


   const rootHtmlPath = join(import.meta.dirname, "./root.html");
   const rootHtml = readFileSync(rootHtmlPath, {
      encoding: "utf-8",
   });

   const finalHtml = rootHtml.replace("<!--root-->", html).replace(
      "<!--meta-->",
      toInjectableScript({
         [tag.uuid]: tag.meta
      }),
   );

   return c.html(finalHtml, 200);
});

serve(
   {
      fetch: app.fetch,
      port: 3000,
   },
   (info) => {
      console.log(`http://localhost:${info.port}`);
   },
);
