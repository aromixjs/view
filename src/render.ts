export interface AVTagNode {
   type: 'tag',
   name: string,
   attributes: Record<string, string>
   children: AvHtmlIR[]
}

export interface AVTextNode {
   type: 'text',
   value: string
}

export type AvHtmlIR = AVTagNode | AVTextNode

export function escapeHtml(value: string) {
   return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
}



export function AVIRToHtml(htmlIR: Array<AvHtmlIR>) {
   let html = ''

   for (const node of htmlIR) {
      switch (node.type) {
         case 'tag': {
            html += `<${node.name}`

            for (const [key, value] of Object.entries(node.attributes)) {
               html += ` ${key}="${escapeHtml(value)}"`
            }

            html += '>'
            html += AVIRToHtml(node.children)
            html += `</${node.name}>`

            break;
         }

         case "text": {
            html += escapeHtml(node.value)
            break;
         }
      }
   }

   return html;
}