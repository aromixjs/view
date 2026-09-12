import { AVComponentFactory } from "../compiler/componentTypes"

export class AVPageMeta {
   private eventRegistry = new Set<string>()
   private componentRegistry: Map<string, AVComponentFactory>

   constructor(componentRegistry: Map<string, AVComponentFactory>) {
      this.componentRegistry = componentRegistry
   }

   registerEvent(name: string) {
      this.eventRegistry.add(name)
   }


   registerComponent(factory: AVComponentFactory) {
      this.componentRegistry.set(factory.uuid, factory)
   }


}