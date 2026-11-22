import C from "../config.js?v=20261122173409";
import { h, $, logoMark, safeUrl, whatsapp, telHref } from "../lib/dom.js?v=20261122173409";
import { icon } from "../lib/icons.js?v=20261122173409";

export function renderFooter() {
  const col = (title, ...links) => h("div", null, h("h3", null, title), links);
  $("#ftr").replaceWith(h("footer", { class: "site-footer", "data-theme": "pink" }, h("div", { class: "wrap" },
    h("div", { class: "top" },
      h("a", { class: "foot-logo", href: "index.html", "aria-label": C.name + " home" }, logoMark()),
      h("p", { class: "tag" }, C.tagline)),
    h("div", { class: "cols" },
      col("Explore", h("a", { href: "calendar.html" }, "Events"), h("a", { href: "past.html" }, "Archive"), h("a", { href: "membership.html" }, "Membership")),
      col("About us", h("a", { href: "about.html" }, "Jaisu's story"), h("a", { href: "contact.html" }, "Contact"), h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram")),
      col("Get in touch", h("a", { href: "mailto:" + C.email }, C.email), h("a", { href: telHref(C.phone) }, "+91 " + C.phone), h("div", { class: "social" },
        h("a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Instagram" }, icon("instagram", 20)), h("a", { href: whatsapp(C.phone), rel: "noopener", "aria-label": "WhatsApp" }, icon("chat", 20)), h("a", { href: "mailto:" + C.email, "aria-label": "Email" }, icon("mail", 20))))),
    h("div", { class: "legal" }, h("span", null, `${C.city} / India`), h("span", null, `©${C.name} ${new Date().getFullYear()}`), h("span", null, "Free to join")))));
}
