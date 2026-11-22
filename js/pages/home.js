/* Home: full-photo hero, what we do, upcoming events, a small tile section, membership band. Events refresh themselves. */
import C from "../config.js";
import { h } from "../lib/dom.js";
import { loadEvents, upcoming, nextEvent, eventRow } from "../lib/events.js";
import { hero } from "../components/hero.js";
import * as T from "../components/tiles.js";

const section = (...kids) => h("section", { class: "wrap section" }, ...kids);

export default async function home(main) {
  let events = [], failed = false;
  try { events = await loadEvents(); } catch { failed = true; }
  main.className = "";

  const list = h("div"), live = T.liveTiles();
  const paint = () => {
    const up = upcoming(events).slice(0, 5);
    list.replaceChildren(...up.map(eventRow));
    if (!up.length) list.append(h("p", { class: "note" }, failed ? "We couldn't load events right now. Please refresh in a moment." : "New events are being planned. Follow us on Instagram to hear first."));
    live.update(nextEvent(events));
  };
  paint();

  main.append(
    hero(),
    section(h("p", { class: "eyebrow" }, "What we do"), h("h2", null, C.whatTitle),
      h("ul", { class: "pillars" }, C.pillars.map(p => h("li", null, h("h3", null, p[0]), h("p", null, p[1]))))),
    section(h("div", { class: "section-head", id: "events" }, h("div", null, h("p", { class: "eyebrow" }, "Upcoming"), h("h2", null, "Come sit with us."))), list),
    section(h("div", { class: "bento-intro" }, h("p", { class: "eyebrow" }, "Inside code:iconic"), h("h2", null, "Stories, dates and where to find us.")),
      h("div", { class: "bento" }, T.heroCard(), T.orb(), T.archiveCard(), live.count, T.instaCard(), T.locCard(), live.cart, live.ticket, T.freeCard(), T.mapCard())),
    h("div", { class: "wrap" }, h("section", { class: "band" },
      h("div", null, h("p", { class: "eyebrow" }, "Membership"), h("h2", null, "Free to join. ", h("em", null, "Always.")), h("p", { class: "lead" }, C.membershipText)),
      h("div", null, h("ul", { class: "perks" }, C.perks.map(p => h("li", null, h("div", null, h("b", null, p[0]), p[1])))), h("a", { class: "btn", href: "membership.html" }, "Join the community")))));

  // Keep the page current: re-read the sheet every 5 minutes (and when the tab returns), and re-check the clock every 30 seconds.
  const refresh = async () => { try { events = await loadEvents(true); failed = false; paint(); } catch { /* keep what we have */ } };
  setInterval(refresh, 5 * 60e3); setInterval(paint, 30e3);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
}
