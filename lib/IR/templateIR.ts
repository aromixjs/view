import { ComponentIR } from "./componentIR";

export namespace TemplateIR {
  export enum NodeType {
    PairTag = "PairTag",
    EmptyTag = "EmptyTag",
    StaticText = "StaticText",
    DynamicText = "DynamicText",
    Component = "Component",
    Comment = "Comment",
  }

  export interface StaticAttributeSubNode {
    key: string;
    value: string;
  }

  export interface DynamicAttributeSubNode {
    key: string;
    value: string;
    bind: Array<{
      to: string;
      startOffset: number;
      endOffset: number;
    }>
  }

  export interface EventSubNode {
    key: string;
    value: Function;
    bind: string;
  }

  export interface PairTagNode {
    type: NodeType.PairTag;
    name: string;
    staticAttributes: Array<StaticAttributeSubNode>;
    dynamicAttributes: Array<DynamicAttributeSubNode>;
    events: Array<EventSubNode>;
    children: Array<Node>;
  }

  export interface EmptyTagNode {
    type: NodeType.EmptyTag;
    name: string;
    staticAttributes: Array<StaticAttributeSubNode>;
    dynamicAttributes: Array<DynamicAttributeSubNode>;
    events: Array<EventSubNode>;
  }

  export interface StaticTextNode {
    type: NodeType.StaticText;
    value: string;
  }

  export interface DynamicTextNode {
    type: NodeType.DynamicText;
    value: string;
    bind: Array<{
      to: string;
      startOffset: number;
      endOffset: number;
    }>
  }

  export interface ComponentNode {
    type: NodeType.Component;
    instance: ComponentIR.Instance;
    ref: ComponentIR.Factory;
  }

  export interface CommentNode {
    type: NodeType.Comment;
    value: string;
  }

  export type Node =
    | PairTagNode
    | EmptyTagNode
    | StaticTextNode
    | DynamicTextNode
    | ComponentNode
    | CommentNode;
}
