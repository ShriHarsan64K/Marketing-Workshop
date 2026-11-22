/* Home: full-photo hero, what we do, upcoming events, a small tile section, membership band. Events refresh themselves. */
import C from "../config.js?v=20261122175707";
import { h, arch } from "../lib/dom.js?v=20261122175707";
import { loadEvents, peekEvents, upcoming, nextEvent, eventRow } from "../lib/events.js?v=20261122175707";
import { hero } from "../components/hero.js?v=20261122175707";
import * as T from "../components/tiles.js?v=20261122175707";

const section = (...kids) => h("section", { class: "wrap section" }, ...kids);

export default async function home(main) {
  let events = [], failed = false;
  try { events = await loadEvents(); } catch { failed = true; }
  main.className = "";

  hero();
  const list = h("div"), live = T.liveTiles();
  const paint = () => {
    const up = upcoming(events).slice(0, 5);
    list.replaceChildren(...up.map(eventRow));
    if (!up.length) list.append(h("p", { class: "note" }, failed ? "We couldn't load events right now. Please refresh in a moment." : "New events are being planned. Follow us on Instagram to hear first."));
    live.update(nextEvent(events));
  };
  paint();

  main.append(
    section(h("div", { class: "section-head" }, h("h2", null, "What we ", h("em", null, "do"))),
      h("ul", { class: "pillars" }, C.pillars.map(([t, line, photo]) => h("li", null, h("img", { src: photo, alt: t, loading: "lazy", width: 600, height: 450 }), h("h3", null, t), h("p", null, line))))),
    section(h("div", { class: "section-head", id: "events" }, h("h2", null, "Upcoming ", h("em", null, "events"))), list),
    h("section", { class: "wrap section tiles" }, h("div", { class: "section-head" }, h("h2", null, "Inside ", h("em", null, "code:iconic"))),
      h("div", { class: "bento" }, T.heroCard(), T.orb(), T.archiveCard(), live.count, T.locCard(), live.cart, live.ticket, T.instaCard())),
    h("div", { class: "wrap" }, h("section", { class: "band" },
      h("div", null, h("h2", null, "Free to join. ", h("em", null, "Always.")), h("p", { class: "lead" }, C.membershipText),
        h("dl", { class: "perks" }, C.perks.flatMap(p => [h("dt", null, p[0]), h("dd", null, p[1])])), h("a", { class: "btn", href: "membership.html" }, "Join the community")),
      h("div", { class: "duo", "aria-hidden": "true" }, [["trio.webp", "New friends"], ["table-2.webp", "Making together"]].map(([f, t]) => h("figure", { class: "polaroid" }, h("img", { src: arch(f), alt: "", loading: "lazy", width: 400, height: 500 }), h("figcaption", null, t)))))));

  // Keep the page current: re-read the sheet every 5 minutes (and when the tab returns), and re-check the clock every 30 seconds.
  const refresh = async () => { try { events = await loadEvents(true); failed = false; paint(); } catch { /* keep what we have */ } };
  setInterval(refresh, 5 * 60e3); setInterval(paint, 30e3);
  addEventListener("events-updated", () => { events = peekEvents(); paint(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
}
