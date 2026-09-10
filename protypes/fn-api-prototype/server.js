// server.js — run: node server.js → http://localhost:3000
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";
import { registry } from "./tags.js";
import { runWithContext, buildPropClosure, diffAndRun } from "./runtime.js";

const {
  App,
  Header,
  Sidebar,
  SearchBar,
  CartBadge,
  WishlistPanel,
  Toast,
  ProductGrid,
  ProductCategory,
  ProductCard,
} = registry;

const app = new Hono();
const template = readFileSync(new URL("./index.html", import.meta.url), "utf-8");

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function wrap(Factory, instance, innerHtml, ref, extraAttrs = "") {
  let state = {};
  for (let key of instance.meta.state) state[key] = instance.extract(key);
  state.__v = 1;
  let asAttr = Factory.as ? ` data-as="${Factory.as}"` : "";
  return `<div data-ref="${ref}" data-component="${Factory.name}"${asAttr}
               data-state="${escapeAttr(JSON.stringify(state))}"${extraAttrs}>${innerHtml}</div>`;
}

// Stands in for a real backing store's version column — in-memory only,
// scoped to validating the conflict-check mechanics themselves, not full
// state persistence (state values stay client-authoritative, as designed).
const versionStore = {};
function checkVersion(ref, incomingV) {
  let current = versionStore[ref] ?? 1;
  return incomingV === current ? null : current;
}
function bumpVersion(ref) {
  versionStore[ref] = (versionStore[ref] ?? 1) + 1;
  return versionStore[ref];
}

app.get("/", (c) => {
  let toast = Toast({});
  let toastHtml = wrap(Toast, toast, toast.html(), "toast-1");

  let cart = CartBadge({});
  let cartHtml = wrap(CartBadge, cart, cart.html(), "cart-badge-1");

  let search = SearchBar();
  let searchHtml = wrap(SearchBar, search, search.html(), "search-1");

  let headerInst = Header(cartHtml, searchHtml);
  let headerHtml = wrap(Header, headerInst, headerInst.html(), "header-1");

  let wishlist = WishlistPanel({});
  let wishlistHtml = wrap(WishlistPanel, wishlist, wishlist.html(), "wishlist-1");
  let sidebarInst = Sidebar(wishlistHtml);
  let sidebarHtml = wrap(Sidebar, sidebarInst, sidebarInst.html(), "sidebar-1");

  let CATALOG = {
    Shoes: [
      { productId: 1, name: "Runner", price: 80, stock: 2 },
      { productId: 2, name: "Sandal", price: 40, stock: 10 },
    ],
    Bags: [
      { productId: 3, name: "Backpack", price: 60, stock: 5 },
      { productId: 4, name: "Tote", price: 35, stock: 5 },
    ],
  };

  let categoriesHtml = Object.entries(CATALOG)
    .map(([categoryName, products], ci) => {
      let categoryRef = `category-${ci}`;
      let cardsHtml = products
        .map((p) => {
          // The onAdd callback prop is baked HERE, at render time, to THIS
          // category's own ref — the direct-callback-prop mechanism,
          // distinct from trigger()'s singleton lookup.
          let onAddProvenance = {
            component: "ProductCategory",
            ref: categoryRef,
            action: "recordAdd",
            reads: { addCount: 0, __v: 1 },
          };
          let card = ProductCard({ ...p, qty: 1, onAdd: () => {} }); // real fn unused at SSR time, render doesn't call actions
          let dataProps = {
            productId: { value: p.productId },
            name: { value: p.name },
            price: { value: p.price },
            stock: { value: p.stock },
            onAdd: onAddProvenance,
          };
          return wrap(
            ProductCard,
            card,
            card.html(),
            `card-${p.productId}`,
            ` data-props="${escapeAttr(JSON.stringify(dataProps))}"`,
          );
        })
        .join("");
      let category = ProductCategory({ categoryName, addCount: 0 }, cardsHtml);
      return wrap(ProductCategory, category, category.html(), categoryRef);
    })
    .join("");

  let grid = ProductGrid({}, categoriesHtml);
  let gridHtml = wrap(ProductGrid, grid, grid.html(), "grid-1");

  let rootInst = App(headerHtml, gridHtml, sidebarHtml, toastHtml);
  let rootHtml = wrap(App, rootInst, rootInst.html(), "app-1");

  let meta = Object.fromEntries(
    Object.entries(registry).map(([name, Factory]) => [name, Factory({}, "").meta]),
  );
  let metaScript = `<script>window.__META__ = ${JSON.stringify(meta)}</script>`;

  let page = template.replace("<!--META-->", metaScript).replace("<!--APP-->", rootHtml);
  return c.html(page);
});

app.post("/action", async (c) => {
  let body = await c.req.json();
  let Factory = registry[body.component];
  if (!Factory)
    return c.json({ error: { code: "UNKNOWN_COMPONENT", message: body.component } }, 404);
  if (typeof Factory({})?.actions?.[body.action] !== "function") {
    return c.json({ error: { code: "UNKNOWN_ACTION", message: body.action } }, 404);
  }

  let conflictVersion = checkVersion(body.ref, body.reads.__v);
  if (conflictVersion !== null) {
    return c.json({
      conflict: { ref: body.ref, current: { __v: conflictVersion } },
    });
  }

  let ctx = {
    calls: body.calls || {},
    session: { isVIP: !!c.req.header("x-vip") },
    writes: {},
    errors: {},
  };

  let result = null;
  runWithContext(ctx, () => {
    let ctorArgs = { ...body.reads };
    // Function-typed props resolve to real closures built from baked
    // render-time provenance — not from `body.calls` (that's trigger()'s
    // channel), from `body.props` instead.
    for (let [propName, entry] of Object.entries(body.props || {})) {
      let TargetFactory = registry[entry.component];
      ctorArgs[propName] = buildPropClosure(TargetFactory, entry);
    }
    let instance = Factory(ctorArgs);
    result = diffAndRun(instance, body.action, body.params || []);
  });

  if (result.error) return c.json({ error: result.error });
  if (Object.keys(ctx.errors).length) return c.json({ error: Object.values(ctx.errors)[0] });

  if (Object.keys(result.changed).length) {
    result.changed.__v = bumpVersion(body.ref);
    ctx.writes[body.ref] = {
      ...(ctx.writes[body.ref] || {}),
      ...result.changed,
    };
  }

  return c.json({ writes: ctx.writes });
});

serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000) }, (info) => {
  console.log(`http://localhost:${info.port}`);
});
