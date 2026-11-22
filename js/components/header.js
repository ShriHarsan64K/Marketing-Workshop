import C from "../config.js?v=20261122173409";
import { h, $, logoMark, safeUrl } from "../lib/dom.js?v=20261122173409";
import { icon } from "../lib/icons.js?v=20261122173409";

const NAV = [["Events", "calendar.html"], ["Archive", "past.html"], ["About", "about.html"], ["Contact", "contact.html"]];
const MENU = [["Home", "index.html"], ...NAV, ["Join free", "membership.html"]];
const here = () => location.pathname.split("/").pop() || "index.html";
const link = ([l, u]) => h("a", { href: u, "aria-current": u === here() ? "page" : null }, l);

export function renderHeader(variant) {
  const menuBtn = cls => h("button", { class: cls, popovertarget: "menu", "aria-label": "Open menu" }, icon("menu", 22));
  const header = variant === "bio"
    ? h("header", { class: "site-header bio" },
        h("a", { class: "wordmark", href: "index.html", "aria-label": C.name + " home" }, "code", h("b", null, ":"), "iconic"),
        h("div", { class: "icons" }, h("a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Instagram" }, icon("instagram", 22)), menuBtn("")))
    : h("header", { class: "site-header" },
        h("a", { class: "logo-btn", href: "index.html", "aria-label": C.name + " home" }, logoMark()),
        h("div", { class: "header-right" },
          h("nav", { class: "pill-nav", "aria-label": "Main" }, NAV.map(link)),
          h("a", { class: "cta-pill", href: "membership.html" }, "Join free"), menuBtn("round-btn menu")));
  const menu = h("nav", { id: "menu", popover: "auto", "aria-label": "Menu" },
    h("button", { class: "close", popovertarget: "menu", popovertargetaction: "hide", "aria-label": "Close menu" }, icon("close", 26)), MENU.map(link));
  $("#hdr").replaceWith(header);
  header.after(menu);
}
