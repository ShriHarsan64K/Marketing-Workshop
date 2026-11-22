import C from "../config.js";
import { h, $, icons, logoMark, safeUrl } from "../lib/dom.js";

export function renderFooter() {
  const form = h("form", { class: "signup-form", action: "membership.html", method: "get" },
    h("input", { type: "email", name: "email", required: true, placeholder: "Enter your email address", "aria-label": "Email address", autocomplete: "email" }),
    h("button", null, "Join"));
  const col = (title, ...links) => h("div", null, h("h3", null, title), links);
  $("#ftr").replaceWith(h("footer", { class: "site-footer" }, h("div", { class: "wrap" },
    h("div", { class: "signup" },
      h("div", null, h("h2", null, "Stay ", h("br"), "ahead"), h("p", null, "Join our community list for early dates, previews & more."), form),
      h("div", { class: "art", "aria-hidden": "true" })),
    h("div", { class: "cols" },
      col("Explore", h("a", { href: "calendar.html" }, "Events"), h("a", { href: "past.html" }, "Archive"), h("a", { href: "membership.html" }, "Membership")),
      col("About us", h("a", { href: "about.html" }, "Jaisu's story"), h("a", { href: "contact.html" }, "Contact"), h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram")),
      col("Community", h("div", { class: "social" }, h("a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Instagram" }, icons.instagram()), C.email && h("a", { href: "mailto:" + C.email, "aria-label": "Email" }, icons.mail())))),
    h("div", { class: "legal" },
      h("span", null, logoMark(20), `${C.city} / India`),
      h("span", null, `©${C.name} ${new Date().getFullYear()}`),
      h("span", null, "Free to join")))));
}
