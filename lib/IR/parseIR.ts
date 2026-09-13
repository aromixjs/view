import { ComponentIR } from "./componentIR";
import { TemplateIR } from "./templateIR";


export namespace ParseIR {
   export interface ToCallbackConfig {
      node: TemplateIR.Node;
      onStaticText(node: TemplateIR.StaticTextNode): void
      onDynamicText(node: TemplateIR.DynamicTextNode): void
      onComment(node: TemplateIR.CommentNode): void
      onPairTag(node: TemplateIR.PairTagNode): void
      onEmptyTag(node: TemplateIR.EmptyTagNode): void
      onComponent(node: TemplateIR.ComponentNode): void
   }

   export function ToCallback(config: ToCallbackConfig) {
      const {
         node,
         onComment,
         onStaticText,
         onDynamicText,
         onPairTag,
         onEmptyTag,
         onComponent
      } = config

      switch (node.type) {
         case TemplateIR.NodeType.Comment:
            onComment(node)
            break;
         case TemplateIR.NodeType.StaticText:
            onStaticText(node)
            break;
         case TemplateIR.NodeType.DynamicText:
            onDynamicText(node)
            break;
         case TemplateIR.NodeType.PairTag:
            onPairTag(node)
            break;
         case TemplateIR.NodeType.EmptyTag:
            onEmptyTag(node)
            break;
         case TemplateIR.NodeType.Component:
            onComponent(node)
            break;
      }
   }
}

// ---------------------------------------------------------------
// HTML tokens
// ---------------------------------------------------------------

export const HtmlTokenMap = {
  CommentStart: "<!--",
  CommentEnd: "-->",
  TagOpenStart: "<",
  TagOpenEnd: ">",
  TagSelfCloseEnd: "/>",
  TagClose: (name: string) => `</${name}>`,
  Attr: (key: string, value: string) => ` ${key}="${value}"`,
  TextContent: (content: string) => content,
};

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

// which component owns this reactive field — this is what makes a
// dep resolvable later ("componentId c2 changed field message" ->
// look up every binding whose dep matches that pair)
export type DepRef = { componentId: string; field: string };

export type Binding = {
  kind: "text" | "attr" | "event";
  name?: string;
  deps: DepRef[];
};

// path + every binding for ONE dom node, together — no id repeated
// across separate structures, the map key IS the node's id
export type NodeMeta = { path: number[]; bindings: Binding[] };
export type Meta = Record<string, NodeMeta>;

export type RenderInput = {
  factory: ComponentIR.Factory;
  registry: Map<string, ComponentIR.Factory>;
};

// ---------------------------------------------------------------
// RenderState
// ---------------------------------------------------------------

class RenderState {
  readonly html: string[] = [];
  readonly meta: Meta = {};
  private uid = 0;

  constructor(private readonly idPrefix: string, readonly registry: Map<string, ComponentIR.Factory>) {}

  nextId(): string {
    return `${this.idPrefix}${this.uid++}`;
  }

  push(...tokens: string[]) {
    this.html.push(...tokens);
  }

  // one entry per dom node; created once, bindings appended onto it —
  // this is what removes the repeated id between paths/bindings
  track(id: string, path: number[]): NodeMeta {
    return (this.meta[id] ??= { path, bindings: [] });
  }
}

const depsOf = (componentId: string, bind: Array<{ to: string }>): DepRef[] =>
  bind.map(b => ({ componentId, field: b.to }));

// ---------------------------------------------------------------
// Rendering
// `ownerId` = the component id whose reactive fields the current
// node's deps belong to. It changes only when we inline a Component
// node; it's separate from node-id generation (`state.nextId()`),
// which stays globally unique across the whole compiled template.
// ---------------------------------------------------------------

function renderNode(state: RenderState, node: TemplateIR.Node, path: number[], ownerId: string) {
  ParseIR.ToCallback({
    node,

    onStaticText(node) {
      state.push(HtmlTokenMap.TextContent(node.value));
    },

    onDynamicText(node) {
      const id = state.nextId();
      state.track(id, path).bindings.push({
        kind: "text",
        deps: depsOf(ownerId, node.bind),
      });
      state.push(HtmlTokenMap.TextContent(node.value));
    },

    onComment(node) {
      state.push(HtmlTokenMap.CommentStart, node.value, HtmlTokenMap.CommentEnd);
    },

    onPairTag(node) {
      state.push(HtmlTokenMap.TagOpenStart, node.name);
      writeAttrsAndEvents(state, node, path, ownerId);
      state.push(HtmlTokenMap.TagOpenEnd);

      renderChildren(state, node.children, path, ownerId);

      state.push(HtmlTokenMap.TagClose(node.name));
    },

    onEmptyTag(node) {
      state.push(HtmlTokenMap.TagOpenStart, node.name);
      writeAttrsAndEvents(state, node, path, ownerId);
      state.push(HtmlTokenMap.TagSelfCloseEnd);
    },

    onComponent() {
      // unreachable — renderChildren inlines Component nodes before renderNode runs
    },
  });
}

function writeAttrsAndEvents(
  state: RenderState,
  node: TemplateIR.PairTagNode | TemplateIR.EmptyTagNode,
  path: number[],
  ownerId: string,
) {
  const hasDynamic = node.dynamicAttributes.length > 0 || node.events.length > 0;
  const entry = hasDynamic ? state.track(state.nextId(), path) : null;

  for (const attr of node.dynamicAttributes) {
    state.push(HtmlTokenMap.Attr(attr.key, attr.value));
    entry!.bindings.push({ kind: "attr", name: attr.key, deps: depsOf(ownerId, attr.bind) });
  }
  for (const attr of node.staticAttributes) {
    state.push(HtmlTokenMap.Attr(attr.key, attr.value));
  }
  for (const ev of node.events) {
    entry!.bindings.push({ kind: "event", name: ev.key, deps: depsOf(ownerId, [{ to: ev.bind }]) });
  }
}

function renderChildren(
  state: RenderState,
  nodes: TemplateIR.Node[],
  path: number[],
  ownerId: string,
  cursor = { i: 0 },
) {
  for (const node of nodes) {
    if (node.type === TemplateIR.NodeType.Component) {
      state.registry.set(node.ref.id, node.ref);
      // ownerId switches to the child component's own id — its deps
      // belong to ITS fields, not the parent's — while `cursor` still
      // shares the parent's sibling slots (no path level added)
      renderChildren(state, node.instance.template(), path, node.ref.id, cursor);
      continue;
    }
    renderNode(state, node, [...path, cursor.i], ownerId);
    cursor.i++;
  }
}

// ---------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------

export function ToHtml({ factory, registry }: RenderInput): { html: string; meta: Meta } {
  registry.set(factory.id, factory);
  const state = new RenderState(factory.id, registry);

  renderChildren(state, factory().template(), [], factory.id);

  return { html: state.html.join(""), meta: state.meta };
}