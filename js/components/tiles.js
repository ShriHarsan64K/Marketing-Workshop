/* The small tile section on the home page, modelled on leborrel.nl. */
import C from "../config.js";
import { h, svg, arch, logoMark, safeUrl } from "../lib/dom.js";
import { icon } from "../lib/icons.js";
import { startOf, imgSrc, pretty } from "../lib/events.js";

const polaroid = (src, caption, small) => h("figure", { class: "polaroid" }, h("img", { src, alt: caption, loading: "lazy", width: 400, height: 500 }), h("figcaption", null, caption, small && h("small", null, small)));
const card = (cls, tag, attrs, ...kids) => h(tag, { class: "card " + cls, ...attrs }, ...kids);
const eventHref = e => e ? "event.html?e=" + encodeURIComponent(e.id) : "calendar.html";

export const heroCard = () => card("hero-card", "section", { "aria-label": "Welcome" },
  h("h1", null, C.headline),
  h("div", { class: "tilt" }, [["group-1.jpg", "The gathering."], ["crochet.jpg", "Together."], ["circle-2.jpg", "Made by us."]].map(([f, t]) => polaroid(arch(f), t, C.city))));

export function orb() {
  const R = 170, ring = (id, d, text) => [svg("path", { id, d, fill: "none" }), svg("text", null, svg("textPath", { href: "#" + id, startOffset: "50%", "text-anchor": "middle" }, text))];
  return h("div", { class: "orb", "aria-hidden": "true" },
    svg("svg", { viewBox: "0 0 400 400" }, svg("circle", { cx: 200, cy: 200, r: 195 }), svg("circle", { cx: 200, cy: 200, r: 150 }),
      ring("ringTop", `M ${200 - R},200 A ${R},${R} 0 0 1 ${200 + R},200`, C.ringTop),
      ring("ringBottom", `M ${200 - R - 12},200 A ${R + 12},${R + 12} 0 0 0 ${200 + R + 12},200`, C.ringBottom)),
    h("div", { class: "ball" }, logoMark()));
}

export const archiveCard = () => card("archive", "a", { href: "past.html" },
  h("div", { class: "fan", "aria-hidden": "true" }, [["table-2.jpg", "Together"], ["hug.jpg", "Hellos"], ["circle-1.jpg", "Mood boards"]].map(([f, t]) => polaroid(arch(f), t))),
  h("h3", null, "The archive"));

export const freeCard = () => card("since", "a", { href: "membership.html" }, h("p", { class: "eyebrow" }, "Membership"), h("b", null, "Free"));

export const instaCard = () => card("insta", "a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Follow us on Instagram " + C.instagramHandle },
  h("div", { class: "avatar" }, logoMark()), h("h3", null, C.instagramHandle), h("span", { class: "follow" }, "Follow us", icon("right", 16)));

export const locCard = () => card("loc", "section", {},
  h("p", { class: "eyebrow" }, "Find us"), h("div", null, h("h3", null, C.city), h("p", { class: "muted" }, C.cityLine)));

// Fixed on Chennai: the embed is cropped so its zoom buttons and footer text are out of view, and it ignores the mouse.
export const mapCard = () => card("map", "section", { "aria-label": "Map of " + C.city },
  h("iframe", { title: "Map of " + C.city, loading: "lazy", referrerpolicy: "no-referrer", tabindex: "-1", src: "https://www.openstreetmap.org/export/embed.html?bbox=80.19%2C13.02%2C80.35%2C13.15&layer=mapnik" }),
  h("div", { class: "bubble" }, h("h3", null, C.city)),
  h("a", { class: "osm", href: "https://www.openstreetmap.org/copyright", rel: "noopener" }, "© OpenStreetMap"));

/* Countdown, event cartridge and ticket: they re-draw themselves whenever update(next) is called. */
export function liveTiles() {
  const count = card("count", "section", {}), cart = card("cart", "a", {}), ticket = card("ticket-card", "a", {});
  let timer = null;
  function countdown(e) {
    const cells = ["Days", "Hrs", "Min", "Sec"].map(l => [h("b", null, "00"), h("span", null, l)]);
    const tick = () => {
      const s = Math.max(0, Math.floor((startOf(e) - Date.now()) / 1000));
      [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60].forEach((v, i) => cells[i][0].textContent = String(v).padStart(2, "0"));
    };
    tick(); clearInterval(timer); timer = setInterval(tick, 1000);
    return h("div", { class: "cd", role: "timer", "aria-label": "Time until " + e.title }, cells.map(c => h("div", null, c)));
  }
  function update(next) {
    const href = eventHref(next);
    cart.href = href; ticket.href = href;
    if (!next) clearInterval(timer);
    count.replaceChildren(h("p", { class: "eyebrow" }, "Next gathering"), next ? countdown(next) : h("p", { class: "muted" }, "New dates coming soon."));
    cart.replaceChildren(
      h("div", { class: "cartridge", "aria-hidden": "true" }, h("div", { class: "win" }, h("img", { src: next && next.image ? imgSrc(next.image) : arch("mugs.jpg"), alt: "", loading: "lazy" }))),
      h("div", null, h("p", { class: "eyebrow" }, next ? "Next event" : "Events"), h("h3", null, next ? next.title : "See what's on")));
    ticket.replaceChildren(h("div", { class: "ticket", "aria-hidden": "true" },
      h("div", null, h("small", null, "code:iconic presents"), h("h3", null, next ? next.title : "Next gathering"),
        h("p", null, next ? pretty(next.date) + (next.time ? " · " + next.time.split("-")[0].trim() : "") : "Dates are on the way.")),
      h("div", { class: "stub" }, h("span", null, "ADMIT ONE"))));
  }
  update(null);
  return { count, cart, ticket, update };
}
