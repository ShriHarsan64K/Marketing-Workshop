/* The small tile section on the home page, modelled on leborrel.nl. Nothing here is a link except the Instagram strip. */
import C from "../config.js?v=20261122181820";
import { h, arch, logoMark, safeUrl } from "../lib/dom.js?v=20261122181820";
import { icon } from "../lib/icons.js?v=20261122181820";
import { startOf, imgSrc, pretty } from "../lib/events.js?v=20261122181820";

const polaroid = (src, caption, small) => h("figure", { class: "polaroid" }, h("img", { src, alt: caption, loading: "lazy", width: 400, height: 500 }), h("figcaption", null, caption, small && h("small", null, small)));
const card = (cls, ...kids) => h("section", { class: "card " + cls }, ...kids);

export const heroCard = () => card("hero-card",
  h("h1", null, C.headline),
  h("div", { class: "tilt" }, [["group-1.webp", "The gathering."], ["crochet.webp", "Together."], ["circle-2.webp", "Made by us."]].map(([f, t]) => polaroid(arch(f), t, C.city))));

export const orb = () => h("div", { class: "orb", "aria-hidden": "true" }, logoMark(true));

export const archiveCard = () => card("archive",
  h("div", { class: "fan", "aria-hidden": "true" }, [["table-2.webp", "Together"], ["hug.webp", "Hellos"], ["circle-1.webp", "Mood boards"]].map(([f, t]) => polaroid(arch(f), t))),
  h("h3", null, "The archive"));

export const locCard = () => card("loc",
  h("p", { class: "eyebrow" }, "Find us"), h("div", null, h("h3", null, C.city), h("p", { class: "muted" }, C.cityLine)));

/* The only interactive tile: logo and handle, a row of real photos, and the follow button. */
export const instaCard = () => h("a", { class: "card insta", href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Follow us on Instagram " + C.instagramHandle },
  h("div", { class: "who" }, h("div", { class: "avatar" }, logoMark()), h("h3", null, C.instagramHandle)),
  h("div", { class: "thumbs", "aria-hidden": "true" }, ["table-1.webp", "mugs.webp", "hug.webp", "circle-2.webp"].map(f => h("img", { src: arch(f), alt: "", loading: "lazy", width: 80, height: 80 }))),
  h("span", { class: "btn" }, icon("instagram", 16), "Follow us"));

/* Countdown, event cartridge and ticket: they re-draw themselves whenever update(next) is called. */
export function liveTiles() {
  const count = card("count"), cart = card("cart"), ticket = card("ticket-card");
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
    if (!next) clearInterval(timer);
    count.replaceChildren(h("p", { class: "eyebrow" }, "Next gathering"), next ? countdown(next) : h("p", { class: "muted" }, "New dates coming soon."));
    cart.replaceChildren(
      h("div", { class: "cartridge", "aria-hidden": "true" }, h("div", { class: "win" }, h("img", { src: next && next.image ? imgSrc(next.image) : arch("mugs.webp"), alt: "", loading: "lazy" }))),
      h("div", null, h("p", { class: "eyebrow" }, next ? "Next event" : "Events"), h("h3", null, next ? next.title : "Dates soon")));
    ticket.replaceChildren(h("div", { class: "ticket", "aria-hidden": "true" },
      h("div", null, h("small", null, "code:iconic presents"), h("h3", null, next ? next.title : "Next gathering"),
        h("p", null, next ? pretty(next.date) + (next.time ? " · " + next.time.split("-")[0].trim() : "") : "Dates are on the way.")),
      h("div", { class: "stub" }, h("span", null, "ADMIT ONE"))));
  }
  update(null);
  return { count, cart, ticket, update };
}
