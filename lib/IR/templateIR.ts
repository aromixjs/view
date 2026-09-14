import { ComponentIR } from "./componentIR";
export namespace TemplateIR {
  export enum NodeType {
    PairTag = "PairTag",
    EmptyTag = "EmptyTag",
    Text = "Text",
    Component = "Component",
    Comment = "Comment",
  }

  export interface AttributeSubNode {
    key: string;
    value: string;
  }

  export interface EventSubNode {
    key: string;
    value: Function;
    bind: string;
  }

  export interface PairTagNode {
    type: NodeType.PairTag;
    name: string;
    attributes: Array<AttributeSubNode>;
    events: Array<EventSubNode>;
    children: Array<Node>;
  }

  export interface EmptyTagNode {
    type: NodeType.EmptyTag;
    name: string;
    attributes: Array<AttributeSubNode>;
    events: Array<EventSubNode>;
  }

  export interface TextNode {
    type: NodeType.Text;
    value: string;
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

  export type Node = PairTagNode | EmptyTagNode | TextNode | ComponentNode | CommentNode;
}
