import serializeJavascript from "serialize-javascript";

export function toInjectableScript(metaObj: object) {
  const script = ["<script>", "window.AVM", "=", serializeJavascript(metaObj), "</script>"];

  return script.join("");
}

export function wrap(factory: Function) {
  let state: Record<string, any> = {};
  const instance = factory();

  for (const key of instance.meta.state) {
    state[key] = instance.extract(key);
  }

  return [
    {
      type: "tag",
      name: "div",
      attributes: {
        "data-ref": Math.random().toString(36).slice(2, 8),
        "data-tag": factory.name,
        "data-state": JSON.stringify(state),
      },
      children: instance.html(),
    },
  ];
}
