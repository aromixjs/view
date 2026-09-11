export interface AVAttributeNode {
  key: string,
  value: any,
  bind?: string
}

export interface AVTagNode {
  type: "tag";
  name: string;
  attributes: AVAttributeNode[];
  children: AVIR[];
}

export interface AVTextNode {
  type: "text";
  value: string;
  bind?: string
}

export type AVIR = AVTagNode | AVTextNode;