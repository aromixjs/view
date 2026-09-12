import { AVComponentFactory } from "./componentDefTypes"

export enum AVNodeType {
  PairTag = 'PairTag',
  EmptyTag = 'EmptyTag',
  Text = 'Text',
  Component = 'Component'
}

// ## Attribute Is Not A Node
export interface AVAttribute {
  key: string,
  value: any,
  bind: any
}

export interface AVPairTagNode {
  type: AVNodeType.PairTag,
  name: string,
  attributes: Array<AVAttribute>
  children:Array<AVNode>
}
export interface AVEmptyTagNode {
  type: AVNodeType.EmptyTag,
  name: string,
  attributes: Array<AVAttribute>
}
export interface AVTextNode {
  type: AVNodeType.Text,
  value: any,
  bind: any
}

export interface AvComponentNode {
  type: AVNodeType.Component,
  instance: any,
  ref: AVComponentFactory,
}

export type AVNode = AVPairTagNode | AVEmptyTagNode | AVTextNode | AvComponentNode;