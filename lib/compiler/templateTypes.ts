import { AVComponentFactory, AVComponentInstance } from "./componentTypes";

// Sub Nodes
export interface AVAttributeSubNode {
  key: string;
  value: string;
  bind: string | null;
};
export interface AVEventSubNode {
  key: string;
  value: Function;
  bind: string;
}

export enum AVNodeType {
  PairTag = "PairTag",
  EmptyTag = "EmptyTag",
  Text = "Text",
  Component = "Component",
  Comment = "Comment",
}


// Main Nodes
export interface AVPairTagNode {
  type: AVNodeType.PairTag;
  name: string;
  attributes: Array<AVAttributeSubNode>;
  events: Array<AVEventSubNode>
  children: Array<AVNode>;
}
export interface AVEmptyTagNode {
  type: AVNodeType.EmptyTag;
  name: string;
  events: Array<AVEventSubNode>
  attributes: Array<AVAttributeSubNode>;
}
export interface AVTextNode {
  type: AVNodeType.Text;
  value: string;
  bind: string | null;
}

export interface AvComponentNode {
  type: AVNodeType.Component;
  instance: AVComponentInstance;
  ref: AVComponentFactory;
}

export interface AvCommentNode {
  type: AVNodeType.Comment;
  value: string;
}

export type AVNode = AVPairTagNode | AVEmptyTagNode | AVTextNode | AvComponentNode | AvCommentNode;
