export interface AVTagNode {
  type: "tag";
  name: string;
  attributes: Record<string, string>;
  children: AVIR[];
}

export interface AVTextNode {
  type: "text";
  value: string;
}

export type AVIR = AVTagNode | AVTextNode;