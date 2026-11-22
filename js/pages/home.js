import C from "../config.js";
import { h } from "../lib/dom.js";
import { loadEvents, upcoming } from "../lib/events.js";
import * as T from "../components/tiles.js";

export default async function home(main) {
  let next = null;
  try { next = upcoming(await loadEvents())[0] || null; } catch { /* tiles show their "coming soon" state */ }
  main.className = "wrap";
  main.append(h("div", { class: "bento" },
    T.heroCard(), T.orb(), T.archiveCard(), T.countCard(next), T.instaCard(), T.locCard(), T.cartCard(next), T.ticketCard(next), T.sinceCard(), T.mapCard()),
    h("section", { class: "band" }, h("div", null, h("h2", null, "Free to join. ", h("em", null, "Always.")), h("p", { class: "lead", style: "color:inherit;margin-top:12px" }, C.membershipText)),
      h("a", { class: "btn", href: "membership.html" }, "Join the community")));
}
