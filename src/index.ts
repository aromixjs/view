import { join } from "path";
import { view } from "../lib/view";
import { Hono } from "hono";

// view({
//   route: [
//     {
//       path: "/",
//       load: import("./view/TextAndBtn"),
//     },
//   ],
//   port: 3000,
//   base: join(import.meta.dirname, "./index.html"),
// });


// function test() {

//   const log = (param: string) => {
//     console.log(param);

//   }
//   return {
//     get a0() {
//       return log
//     }
//   }


// }



// test().a0('test')


const app = new Hono()


app.get('/',(c)=>{

    return c.body(`
    {
    user: string("data")
    
    }
    
    
    `, 200, {
      'Content-Type': 'application/ted',
    })

})
