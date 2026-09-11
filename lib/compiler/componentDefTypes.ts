import { AVNode } from "./templateIRTypes"

export interface AVActionMeta {
   writes: Array<string>,
   reads: Array<string>,
   parameters: Array<string>,
   triggers: Array<string>,
   ref: Function
}

export interface AVComponentInstance {
   state: Record<string, any>
   template: () => Array<AVNode>,
   props: Record<string, any>
   actions: Record<string, AVActionMeta>
}


export interface AVComponentFactory {
   (): AVComponentInstance,
   uuid: string
}