import { join } from 'path';
import { view } from './../lib';
import { TextAndBtn } from './view/TextAndBtn';

view({
   route: [
      {
         path: '/',
         tag: TextAndBtn
      }
   ],
   port: 3000,
   rootPath: join(import.meta.dirname, "./index.html")
})