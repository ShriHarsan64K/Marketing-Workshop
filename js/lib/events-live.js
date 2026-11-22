/* Draws event lists into a container and redraws them when the sheet is refreshed in the background. */
import { h } from "./dom.js?v=20261122182123";
import { loadEvents, peekEvents } from "./events.js?v=20261122182123";

export async function liveEvents(container, build) {
  const draw = evs => container.replaceChildren(...[].concat(build(evs)).filter(Boolean));
  try { draw(await loadEvents()); }
  catch (e) { container.replaceChildren(h("p", { class: "note", role: "status" }, e.message === "not-configured" ? "Events are not connected yet." : "We couldn't load events right now. Please refresh in a moment.")); return; }
  addEventListener("events-updated", () => draw(peekEvents()));
}
