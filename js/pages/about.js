/* Founder page, modelled on sophiawebster.com/pages/biography */
import C from "../config.js?v=20261122175707";
import { h, whatsapp } from "../lib/dom.js?v=20261122175707";
import { icon } from "../lib/icons.js?v=20261122175707";

export default function about(main) {
  const S = C.story;
  main.className = "";
  main.before(h("section", { class: "bio-banner" }, h("img", { src: S.banner, alt: "", width: 1400, height: 1050, fetchpriority: "high" }),
    h("div", { class: "bio-title" }, h("span", { class: "script" }, S.title), h("span", { class: "caps" }, S.kicker))));
  main.append(h("div", { class: "bio" }, S.paragraphs.map((p, i) => h("p", { class: i ? null : "first" }, p))),
    h("figure", { class: "bio-photo" }, h("img", { src: S.photo[0], alt: S.photo[1], loading: "lazy", width: 1400, height: 1050 })),
    h("blockquote", { class: "bio-quote" }, S.quote),
    h("div", { class: "bio-pair" }, S.pair.map(([src, alt]) => h("img", { src, alt, loading: "lazy", width: 800, height: 1000 }))),
    h("div", { class: "bio-cta" }, h("a", { class: "btn", href: "membership.html" }, "Join free"), h("a", { class: "btn ghost", href: "calendar.html" }, "See events")));
  // floating pill + chat bubble, as on the reference
  const promo = h("div", { class: "promo" }, h("a", { href: "membership.html", style: "text-decoration:none" }, "Free to join | Join now"),
    h("button", { type: "button", "aria-label": "Dismiss", onclick: () => promo.remove() }, icon("close", 16)));
  document.body.append(promo, h("a", { class: "chat", href: whatsapp(C.phone), rel: "noopener", "aria-label": "Message us on WhatsApp" }, icon("chat", 24)));
}
