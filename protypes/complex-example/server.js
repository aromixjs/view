import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { randomUUID } from 'crypto';

// ==========================================
// 1. HELPER: Hyperscript for cleaner views
// ==========================================
function h(tag, attrs = {}, ...children) {
  const flatChildren = children.flat(Infinity).map(c => {
    if (typeof c === 'string' || typeof c === 'number') return String(c);
    return c;
  });
  return { tag, ...attrs, children: flatChildren };
}

// ==========================================
// 2. COMPONENTS (3-Level Deep Tree)
// ==========================================

class IssueCard {
  constructor(props) {
    this.issueId = props.issueId;
    this.title = props.title;
    this.onComplete = props.onComplete; // Calls KanbanBoard
    this.isProcessing = false; // Local state
  }

  static __meta = {
    actions: {
      complete: {
        reads: ['isProcessing', 'issueId', 'title'],
        calls: { prop: 'onComplete', args: ['issueId', 'title'] }
      }
    }
  };

  complete() {
    this.isProcessing = true;
    if (this.onComplete) this.onComplete(this.issueId, this.title);
  }

  render() {
    return h('div', { 
      style: 'border:1px solid #333; padding:8px; margin:4px;' 
    }, 
      h('h4', {}, this.title),
      h('p', { bind: 'isProcessing' }, `Status: ${this.isProcessing ? 'Processing...' : 'Open'}`),
      h('button', { onClick: 'complete', style: 'cursor:pointer' }, 'Complete Issue')
    );
  }
}

class KanbanBoard {
  constructor(props) {
    this.boardName = props.boardName;
    this.onAdminLog = props.onAdminLog; // Calls AdminPanel
    this.completedCount = 0; // Local state
    this.issues = [
      { id: 101, title: 'Fix RPC Bug' },
      { id: 102, title: 'Update Docs' }
    ];
  }

  static __meta = {
    actions: {
      markCompleted: {
        reads: ['completedCount', 'boardName'],
        calls: { prop: 'onAdminLog', args: ['boardName'] }
      }
    }
  };

  markCompleted(issueId, issueTitle) {
    this.completedCount++;
    console.log(`Server: KanbanBoard marked issue ${issueId} (${issueTitle}) complete.`);
    if (this.onAdminLog) this.onAdminLog(this.boardName);
  }

  render() {
    return h('div', { style: 'margin-top:20px; border-top:2px dashed gray; padding:10px;' },
      h('h3', {}, `${this.boardName} Board`),
      h('p', {}, `Completed Issues: `, h('span', { bind: 'completedCount', style: 'font-weight:bold;' }, `${this.completedCount}`)),
      ...this.issues.map(issue => h(IssueCard, {
        props: { 
          issueId: issue.id, 
          title: issue.title, 
          onComplete: this.markCompleted 
        }
      }))
    );
  }
}

class AdminPanel {
  constructor() {
    this.adminActions = 0; // Local state
    this.lastAction = "None";
  }

  static __meta = {
    actions: {
      logAction: {
        reads: ['adminActions', 'lastAction']
      }
    }
  };

  logAction(source) {
    this.adminActions++;
    this.lastAction = `${source} completed an issue`;
  }

  render() {
    return h('div', {},
      h('h1', {}, 'Admin Dashboard'),
      h('div', { style: 'background:#eee; padding:10px;' },
        h('p', {}, `Total Admin Actions: `, h('span', { bind: 'adminActions', style: 'color:blue' }, `${this.adminActions}`)),
        h('p', {}, `Last Action: `, h('span', { bind: 'lastAction' }, this.lastAction))
      ),
      // Render Child
      h(KanbanBoard, { props: { boardName: 'Engineering', onAdminLog: this.logAction } })
    );
  }
}

const registry = { AdminPanel, KanbanBoard, IssueCard };
const clientMeta = {
  AdminPanel: { actions: AdminPanel.__meta.actions },
  KanbanBoard: { actions: KanbanBoard.__meta.actions },
  IssueCard: { actions: IssueCard.__meta.actions }
};

// ==========================================
// 3. GENERIC SERVER-SIDE RENDERER
// ==========================================

function renderHtml(instance, parentContext = null) {
  const ref = randomUUID();
  const compName = instance.constructor.name;
  
  // Capture state
  const state = {};
  for (let k of Object.keys(instance)) {
    if (typeof instance[k] !== 'function' && k !== 'issues') state[k] = instance[k];
  }

  // 2-Step Prop Injection
  const propsMeta = {};
  for (let k of Object.keys(instance)) {
    if (typeof instance[k] === 'function') {
      const actionName = instance[k].name;
      if (parentContext) {
        propsMeta[k] = {
          component: parentContext.component,
          action: actionName,
          ref: parentContext.ref
        };
      }
    }
  }

  const tree = instance.render();
  let attrs = `data-ref="${ref}" data-component="${compName}"`;
  attrs += ` data-state='${JSON.stringify(state)}'`;
  if (Object.keys(propsMeta).length > 0) {
    attrs += ` data-props='${JSON.stringify(propsMeta)}'`;
  }

  let html = `<${tree.tag} ${attrs}`;
  if (tree.style) html += ` style="${tree.style}"`;
  html += `>`;

  for (let child of tree.children) {
    if (typeof child === 'string') {
      html += child;
    } else if (typeof child.tag === 'function') {
      // Pass current context down to child
      html += renderHtml(new child.tag(child.props || {}), { component: compName, ref: ref });
    } else {
      let cAttrs = '';
      if (child.onClick) cAttrs += ` data-action="${child.onClick}"`;
      if (child.bind) cAttrs += ` data-bind="${child.bind}"`;
      if (child.style) cAttrs += ` style="${child.style}"`;
      
      // Recursive text binding for children containing variables
      let textContent = child.children ? child.children.join('') : '';
      html += `<${child.tag}${cAttrs}>${textContent}</${child.tag}>`;
    }
  }

  return html + `</${tree.tag}>`;
}

// ==========================================
// 4. HONO SERVER & GENERIC RPC ENGINE
// ==========================================

const app = new Hono();

app.get('/', (c) => {
  const html = renderHtml(new AdminPanel());
  
  const clientScript = `
    <script>
      window.__COMPONENTS__ = ${JSON.stringify(clientMeta)};
      
      function readState(el) { return JSON.parse(el.getAttribute('data-state')); }
      function writeState(el, newState) { 
        let current = readState(el);
        current = { ...current, ...newState };
        el.setAttribute('data-state', JSON.stringify(current));
        
        el.querySelectorAll('[data-bind]').forEach(bindEl => {
          const key = bindEl.getAttribute('data-bind');
          if (current[key] !== undefined) {
            bindEl.textContent = current[key];
          }
        });
      }

      // RECURSIVE CONTEXT GATHERING
      // Traces the entire call graph in O(1) per hop
      function gatherContext(selfEl, meta) {
        const context = {};
        if (!meta.calls) return context;

        const props = JSON.parse(selfEl.getAttribute('data-props') || '{}');
        for (const propName in meta.calls) {
          const propTarget = props[propName];
          if (!propTarget) continue;
          
          const parentEl = document.querySelector('[data-ref="' + propTarget.ref + '"]');
          if (!parentEl) continue;
          
          const parentMeta = window.__COMPONENTS__[propTarget.component].actions[propTarget.action];
          const parentState = readState(parentEl);
          const parentReads = {};
          parentMeta.reads.forEach(k => parentReads[k] = parentState[k]);
          
          context[propName] = {
            component: propTarget.component,
            ref: propTarget.ref,
            action: propTarget.action,
            reads: parentReads
          };

          // RECURSE: See if parent action ALSO calls a prop (infinite depth!)
          const nestedContext = gatherContext(parentEl, parentMeta);
          Object.assign(context, nestedContext);
        }
        return context;
      }

      document.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const selfEl = btn.closest('[data-ref]');
        const action = btn.getAttribute('data-action');
        const compName = selfEl.getAttribute('data-component');
        const meta = window.__COMPONENTS__[compName].actions[action];
        
        if (!meta) return console.error('No meta for action:', action);
        
        const selfState = readState(selfEl);
        const reads = {};
        meta.reads.forEach(k => reads[k] = selfState[k]);
        
        // Gather self + all nested parent contexts recursively
        const context = gatherContext(selfEl, meta);
        
        const res = await fetch('/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action, 
            self: { ref: selfEl.getAttribute('data-ref'), component: compName },
            reads, 
            context
          })
        });
        
        const { writes } = await res.json();
        for (let ref in writes) {
          const el = document.querySelector('[data-ref="' + ref + '"]');
          if (el) writeState(el, writes[ref]);
        }
      });
    </script>
  `;

  return c.html(`<!DOCTYPE html><html><head><title>Complex Prototype</title></head><body><div id="app">${html}</div>${clientScript}</body></html>`);
});

app.post('/rpc', async (c) => {
  const payload = await c.req.json();
  const { action, self, reads, context } = payload;
  const writes = {};

  // 1. Instantiate ALL components in the call graph (Self + Contexts)
  const instances = {};
  
  // Instantiate Self
  const SelfClass = registry[self.component];
  const selfInst = new SelfClass({});
  Object.assign(selfInst, reads);
  instances[self.ref] = selfInst;

  // Instantiate Contexts (Parents)
  if (context) {
    for (const propName in context) {
      const ctxData = context[propName];
      const CtxClass = registry[ctxData.component];
      const ctxInst = new CtxClass({});
      Object.assign(ctxInst, ctxData.reads);
      instances[ctxData.ref] = ctxInst;
    }
  }

  // 2. Wire up ALL props recursively
  // Self Props
  const selfMeta = SelfClass.__meta.actions[action];
  if (selfMeta.calls) {
    for (const propName in selfMeta.calls) {
      const targetCtx = context[propName];
      if (targetCtx) {
        selfInst[propName] = (...args) => instances[targetCtx.ref][targetCtx.action](...args);
      }
    }
  }

  // Context Props
  if (context) {
    for (const propName in context) {
      const ctxData = context[propName];
      const ctxInst = instances[ctxData.ref];
      const ctxMeta = registry[ctxData.component].__meta.actions[ctxData.action];
      
      if (ctxMeta.calls) {
        for (const nestedProp in ctxMeta.calls) {
          const targetCtx = context[nestedProp];
          if (targetCtx) {
            ctxInst[nestedProp] = (...args) => instances[targetCtx.ref][targetCtx.action](...args);
          }
        }
      }
    }
  }

  // 3. Execute the initial action
  selfInst[action]();

  // 4. Extract writes for ALL components
  const selfWrites = {};
  Object.keys(reads).forEach(k => selfWrites[k] = selfInst[k]);
  writes[self.ref] = selfWrites;

  if (context) {
    for (const propName in context) {
      const ctxData = context[propName];
      const ctxInst = instances[ctxData.ref];
      const ctxWrites = {};
      Object.keys(ctxData.reads).forEach(k => ctxWrites[k] = ctxInst[k]);
      writes[ctxData.ref] = ctxWrites;
    }
  }
  
  return c.json({ writes });
});

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Running at http://localhost:${info.port}`);
});