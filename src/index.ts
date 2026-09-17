import { join } from "path";
import { view } from "../lib/view";

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



let s = ['a', 'a', 's', '0']

console.log(`data: ${s.join('s: ')}`);
