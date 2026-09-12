import { AVComponentFactory, AVComponentInstance } from "./componentTypes"
export interface AVAttribute {
  key: string,
  value: string | Function
  bind: string | undefined
}


export enum AVNodeType {
  PairTag = 'PairTag',
  EmptyTag = 'EmptyTag',
  Text = 'Text',
  Component = 'Component',
  Comment = 'Comment'
}

export interface AVPairTagNode {
  type: AVNodeType.PairTag,
  name: string,
  attributes: Array<AVAttribute>
  children: Array<AVNode>
}
export interface AVEmptyTagNode {
  type: AVNodeType.EmptyTag,
  name: string,
  attributes: Array<AVAttribute>
}
export interface AVTextNode {
  type: AVNodeType.Text,
  value: string,
  bind: string | undefined
}

export interface AvComponentNode {
  type: AVNodeType.Component,
  instance: AVComponentInstance,
  ref: AVComponentFactory,
}

export interface AvCommentNode {
  type: AVNodeType.Comment,
  value: string,
}

export type AVNode = AVPairTagNode | AVEmptyTagNode | AVTextNode | AvComponentNode | AvCommentNode;