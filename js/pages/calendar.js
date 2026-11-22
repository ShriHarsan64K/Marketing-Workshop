import { h } from "../lib/dom.js?v=20261122173409";
import { withEvents, upcoming, monthName, eventRow } from "../lib/events.js?v=20261122173409";
import { head } from "../components/pagehead.js?v=20261122173409";

export default async function calendar(main) {
  main.append(head("Calendar", "Upcoming events", "Pick a date, register in a minute, and we'll confirm your spot."));
  await withEvents(main, evs => {
    const up = upcoming(evs);
    if (!up.length) main.append(h("p", { class: "note" }, "No upcoming events yet. Check back soon, or join free to hear first."));
    let last = "";
    for (const e of up) { const m = monthName(e.date); if (m !== last) { main.append(h("div", { class: "month" }, m)); last = m; } main.append(eventRow(e)); }
  });
}
