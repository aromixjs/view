import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { AVIRToHtml } from "./render";
import { readFile, readFileSync } from "fs";
import { join } from "path";
export function Toast() {
   let message = 'Test';

   function show(text: string) {
      message = text
   }

   const html = () => {
      const _ = []

      _.push({
         type: 'tag',
         name: 'div',
         attributes: {
            class: 'toast',
            'data-bind': 'message'
         },
         children: [
            {
               type: 'text',
               value: message
            }
         ]
      })

      _.push({
         type: 'tag',
         name: 'button',
         attributes: {
            // onclick: show,
            'data-click': 'show'
         },
         children: [
            {
               type: 'text',
               value: 'Click ME'
            }
         ]
      })

      return _
   }

   const meta = {
      state: ['message'],
      props: {},
      actions: {
         show: {
            reads: [],
            params: ['text'],
            calls: []
         }
      }
   }

   const ReadOnlyState: any = {
      message
   }


   return {
      extract: (key: string) => {
         return ReadOnlyState[key]
      },

      update(key: string, value: any) {
         if (key === 'message') {
            message = value
         }
      },

      actions: {
         show
      },
      html,
      meta
   }
}

export function wrap(factory: Function) {
   let state: Record<string, any> = {};
   const instance = factory()

   for (const key of instance.meta.state) {
      state[key] = instance.extract(key)
   }


   return [
      {
         type: 'tag',
         name: 'div',
         attributes: {
            'data-ref': Math.random().toString(36).slice(2, 8),
            'data-tag': factory.name,
            'data-state': JSON.stringify(state),
         },
         children: instance.html()
      }
   ]


}

const app = new Hono();


app.get('/', (c) => {
   const output: any = wrap(Toast)

   const html = AVIRToHtml(output)
   const filePath = join(import.meta.dirname, './root.html')

   const rootHtml = readFileSync(filePath, {
      encoding: 'utf-8',
   })

   const finalHtml = rootHtml.replace('<!--root-->', html)
   return c.html(finalHtml, 200)
})

serve({
   fetch: app.fetch,
   port: 3000,
}, (info) => {
   console.log(`http://localhost:${info.port}`);

})