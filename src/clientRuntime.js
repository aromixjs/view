const events = window.AVM.events;
console.log(events);

events.forEach((event) => {
  document.addEventListener(event, async (e) => {
    const target = e.target.closest(`[data-${event}]`);

    if (!target) return;

    const action = target.getAttribute(`data-${event}`);

    if (!action) return;

    const component = target.closest("[data-av]");

    if (!component) return;

    const componentId = component.getAttribute("data-av");
    const runtime = window.AVM[componentId];

    if (!runtime) return;

    const meta = runtime.actions?.[action];

    if (!meta) return;

    const state = {};

    for (const key of meta.writes || []) {
      state[key] = runtime.state[key];
    }

    const payload = {
      componentId,
      action,
      state,
    };

    console.log("RPC:", payload);

    const response = await fetch("/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log("Result:", result);

    if (result.errors?.length) {
      return;
    }

    const updatedState = result.data?.state;
    if (!updatedState) return;

    for (const [key, value] of Object.entries(updatedState)) {
      runtime.state[key] = value;

      // Update DOM
      document.querySelectorAll(`[data-av="${componentId}"][data-bind="${key}"]`).forEach((el) => {
        el.textContent = value;
      });
    }




  });
});
