/* Home: hero, what we do, upcoming events, a small leborrel.nl-style tile section, membership band, moments. */
import C from "../config.js";
import { h, arch } from "../lib/dom.js";
import { loadEvents, upcoming, eventRow } from "../lib/events.js";
import { hero } from "../components/hero.js";
import * as T from "../components/tiles.js";

const section = (...kids) => h("section", { class: "wrap section" }, ...kids);

export default async function home(main) {
  let events = [], failed = false;
  try { events = upcoming(await loadEvents()); } catch { failed = true; }
  const next = events[0] || null;
  main.className = "";

  const list = h("div", null, events.slice(0, 5).map(eventRow));
  if (!events.length) list.append(h("p", { class: "note" }, failed ? "We couldn't load events right now. Please refresh in a moment." : "New events are being planned. Follow us on Instagram to hear first."));

  main.append(
    hero(),
    section(h("p", { class: "eyebrow" }, "What we do"), h("h2", null, C.whatTitle),
      h("ul", { class: "pillars" }, C.pillars.map(p => h("li", null, h("h3", null, p[0]), h("p", null, p[1]))))),
    section(h("div", { class: "section-head", id: "events" }, h("div", null, h("p", { class: "eyebrow" }, "Upcoming"), h("h2", null, "Come sit with us.")),
      h("a", { class: "btn ghost", href: "calendar.html" }, "Full calendar")), list),
    section(h("div", { class: "bento-intro" }, h("p", { class: "eyebrow" }, "Inside code:iconic"), h("h2", null, "Stories, dates and where to find us.")),
      h("div", { class: "bento" }, T.heroCard(), T.orb(), T.archiveCard(), T.countCard(next), T.instaCard(), T.locCard(), T.cartCard(next), T.ticketCard(next), T.sinceCard(), T.mapCard())),
    h("div", { class: "wrap" }, h("section", { class: "band" },
      h("div", null, h("p", { class: "eyebrow", style: "color:inherit;opacity:.7" }, "Membership"), h("h2", null, "Free to join. ", h("em", null, "Always.")), h("p", { class: "lead" }, C.membershipText)),
      h("div", null, h("ul", { class: "perks" }, C.perks.map(p => h("li", null, h("div", null, h("b", null, p[0]), p[1])))), h("a", { class: "btn", href: "membership.html" }, "Join the community")))),
    section(h("p", { class: "eyebrow" }, "Moments"), h("h2", null, "Good company, ", h("em", null, "caught on camera.")),
      h("div", { class: "moments", style: "margin-top:32px" }, C.archive.slice(0, 6).map(([f, t]) => h("figure", null, h("img", { src: arch(f), alt: t, loading: "lazy", width: 800, height: 1000 }), h("figcaption", null, t))))));
}
