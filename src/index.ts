import { join } from 'path';
import { view } from './../lib';
import { Toast } from './view/tags';

view({
   route: [
      {
         path: '/',
         render: Toast
      }
   ],
   port: 3000,
   rootPath: join(import.meta.dirname, "./root.html")
})