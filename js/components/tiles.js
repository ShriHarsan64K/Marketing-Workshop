/* The bento cards on the home page, modelled on leborrel.nl. */
import C from "../config.js";
import { h, svg, arch, logoMark, safeUrl } from "../lib/dom.js";
import { dayMon, startOf, icsLink, imgSrc } from "../lib/events.js";

const polaroid = (src, caption, small) => h("figure", { class: "polaroid" }, h("img", { src, alt: caption, loading: "lazy", width: 400, height: 500 }), h("figcaption", null, caption, small && h("small", null, small)));
const card = (cls, tag, attrs, ...kids) => h(tag, { class: "card " + cls, ...attrs }, ...kids);

export const heroCard = () => {
  const P = [["group-1.jpg", "The gathering."], ["crochet.jpg", "Together."], ["circle-2.jpg", "Made by us."]];
  return card("hero-card", "section", { "aria-label": "Welcome" },
    h("h1", null, C.headline),
    h("div", { class: "tilt" }, P.map(([f, t]) => polaroid(arch(f), t, C.city))));
};

export function orb() {
  const R = 170, ring = (id, d, text, off) => [svg("path", { id, d, fill: "none" }), svg("text", null, svg("textPath", { href: "#" + id, startOffset: off, "text-anchor": "middle" }, text))];
  return h("div", { class: "orb", "aria-hidden": "true" },
    svg("svg", { viewBox: "0 0 400 400" },
      svg("circle", { cx: 200, cy: 200, r: 195 }), svg("circle", { cx: 200, cy: 200, r: 150 }),
      ring("ringTop", `M ${200 - R},200 A ${R},${R} 0 0 1 ${200 + R},200`, C.ringTop, "50%"),
      ring("ringBottom", `M ${200 - R - 12},200 A ${R + 12},${R + 12} 0 0 0 ${200 + R + 12},200`, C.ringBottom, "50%")),
    h("div", { class: "ball" }, logoMark()));
}

export const archiveCard = () => card("archive", "a", { href: "past.html" },
  h("div", { class: "fan", "aria-hidden": "true" }, [["table-2.jpg", "Together"], ["hug.jpg", "Hellos"], ["circle-1.jpg", "Mood boards"]].map(([f, t]) => polaroid(arch(f), t))),
  h("h3", null, "The archive"));

export function countdown(e) {
  const cells = ["Days", "Hrs", "Min", "Sec"].map(l => [h("b", null, "00"), h("span", null, l)]);
  const tick = () => {
    const s = Math.max(0, Math.floor((startOf(e) - Date.now()) / 1000));
    [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60].forEach((v, i) => cells[i][0].textContent = String(v).padStart(2, "0"));
  };
  tick(); setInterval(tick, 1000);
  return h("div", { class: "cd", role: "timer", "aria-label": "Time until " + e.title }, cells.map(c => h("div", null, c)));
}
export const countCard = next => card("count", "section", {},
  next ? [countdown(next), h("h3", null, "Save the date."), icsLink(next)]
       : [h("h3", null, "New dates coming soon."), h("a", { href: "membership.html" }, "Join free to hear first")]);

export const sinceCard = () => card("since", "a", { href: "membership.html" },
  h("p", { class: "eyebrow" }, "Membership"), h("b", null, "Free"));

export const cartCard = next => card("cart", "a", { href: next ? "event.html?e=" + encodeURIComponent(next.id) : "calendar.html" },
  h("div", { class: "cartridge", "aria-hidden": "true" }, h("div", { class: "win" }, h("img", { src: next && next.image ? imgSrc(next.image) : arch("mugs.jpg"), alt: "", loading: "lazy" }))),
  h("div", null, h("p", { class: "eyebrow" }, next ? "Next event" : "Events"), h("h3", null, next ? next.title : "See what's on")));

export const ticketCard = next => card("ticket-card", "section", {},
  h("div", { class: "ticket", "aria-hidden": "true" },
    h("div", null, h("small", null, "code:iconic presents"), h("h3", null, next ? next.title : "Next gathering"),
      h("p", null, next ? dayMon(next.date).join(" ") + (next.time ? " · " + next.time.split("-")[0].trim() : "") : "Dates are on the way.")),
    h("div", { class: "stub" }, h("span", null, "ADMIT ONE"))),
  h("div", { class: "row" }, h("a", { href: next ? "event.html?e=" + encodeURIComponent(next.id) : "calendar.html" }, next ? "Register" : "Calendar"), h("a", { href: "calendar.html" }, "All events")));

export function instaCard() {
  const S = C.instagramStats;
  return card("insta", "section", {},
    h("div", { class: "who" }, h("div", { class: "avatar" }, logoMark()), h("div", null, h("h3", null, C.instagramHandle), h("p", { class: "muted" }, "Photos, previews and the next date."))),
    S ? h("div", { class: "stats" }, [["posts", "posts"], ["followers", "followers"], ["following", "following"]].map(([k, l]) => h("div", null, h("b", null, S[k]), l)))
      : h("a", { class: "link", href: safeUrl(C.instagram), rel: "noopener" }, "Follow on Instagram"));
}

export const locCard = () => card("loc", "section", {},
  h("div", null, h("p", { class: "eyebrow" }, "Find us"), h("h3", null, C.city), h("p", { class: "muted" }, C.cityLine)),
  h("a", { class: "link", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.city), rel: "noopener" }, "Plan your route"));

export const mapCard = () => card("map", "section", { "aria-label": "Map of " + C.city },
  h("iframe", { title: "Map of " + C.city, loading: "lazy", referrerpolicy: "no-referrer", src: "https://www.openstreetmap.org/export/embed.html?bbox=80.19%2C13.02%2C80.35%2C13.15&layer=mapnik" }),
  h("div", { class: "bubble" }, h("h3", null, C.city), h("p", { class: "muted" }, "Here is the next gathering")),
  h("span", { class: "osm" }, "© OpenStreetMap contributors"));
