import C from "../config.js";
import { h, $, logoMark, safeUrl } from "../lib/dom.js";
import { icon } from "../lib/icons.js";

export function renderFooter() {
  const col = (title, ...links) => h("div", null, h("h3", null, title), links);
  $("#ftr").replaceWith(h("footer", { class: "site-footer", "data-theme": "wine" }, h("div", { class: "wrap" },
    h("div", { class: "top" },
      h("a", { class: "foot-logo", href: "index.html", "aria-label": C.name + " home" }, logoMark(true)),
      h("p", { class: "tag" }, C.tagline)),
    h("div", { class: "cols" },
      col("Explore", h("a", { href: "calendar.html" }, "Events"), h("a", { href: "past.html" }, "Archive"), h("a", { href: "membership.html" }, "Membership")),
      col("About us", h("a", { href: "about.html" }, "Jaisu's story"), h("a", { href: "contact.html" }, "Contact"), h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram")),
      col("Community", h("div", { class: "social" }, h("a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Instagram" }, icon("instagram", 20)), C.email && h("a", { href: "mailto:" + C.email, "aria-label": "Email" }, icon("mail", 20))))),
    h("div", { class: "legal" }, h("span", null, `${C.city} / India`), h("span", null, `©${C.name} ${new Date().getFullYear()}`), h("span", null, "Free to join")))));
}
