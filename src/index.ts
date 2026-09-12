import { join } from "path";
import { view } from "../lib/view";


view({
  route: [
    {
      path: "/",
      load: import("./view/TextAndBtn"),
    },
  ],
  port: 3000,
  base: join(import.meta.dirname, "./index.html"),
});
