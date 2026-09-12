import { TemplateIR } from "./templateIR";


export namespace ComponentIR {

  export interface ActionMeta {
    writes: Array<string>;
    reads: Array<string>;
    parameters: Array<string>;
    triggers: Array<string>;
    ref: Function;
  }

  export interface Instance {
    state: Record<string, any>;
    template: () => Array<TemplateIR.Node>;
    props: Record<string, any>;
    actions: Record<string, ActionMeta>;
  }

  export interface Factory {
    (): Instance;
    uuid: string;
  }





}

