import { h } from "../lib/dom.js?v=20261122175707";
import { upcoming, monthName, eventRow } from "../lib/events.js?v=20261122175707";
import { liveEvents } from "../lib/events-live.js?v=20261122175707";
import { head } from "../components/pagehead.js?v=20261122175707";

export default async function calendar(main) {
  const list = h("div");
  main.append(head(["Upcoming ", h("em", null, "events")], "Pick a date and register. We confirm your spot by message."), list);
  await liveEvents(list, evs => {
    const up = upcoming(evs);
    if (!up.length) return h("p", { class: "note" }, "No dates yet. Join free and we'll tell you first.");
    const out = []; let last = "";
    for (const e of up) { const m = monthName(e.date); if (m !== last) { out.push(h("h2", { class: "month" }, m)); last = m; } out.push(eventRow(e)); }
    return out;
  });
}
