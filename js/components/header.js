import C from "../config.js";
import { h, $, icons, logoMark, safeUrl } from "../lib/dom.js";

const NAV = [["Events", "calendar.html"], ["Archive", "past.html"], ["About", "about.html"], ["Contact", "contact.html"]];
const MENU = [["Home", "index.html"], ...NAV, ["Join free", "membership.html"]];
const here = () => location.pathname.split("/").pop() || "index.html";
const link = ([l, u]) => h("a", { href: u, "aria-current": u === here() ? "page" : null }, l);

function a11yToggle() {
  const on = (() => { try { return localStorage.getItem("a11y") === "1"; } catch { return false; } })();
  document.documentElement.classList.toggle("a11y", on);
  return h("button", { class: "round-btn a11y-btn", type: "button", "aria-label": "Larger text and underlined links", "aria-pressed": String(on),
    onclick(e) {
      const next = !document.documentElement.classList.contains("a11y");
      document.documentElement.classList.toggle("a11y", next); e.currentTarget.setAttribute("aria-pressed", String(next));
      try { localStorage.setItem("a11y", next ? "1" : "0"); } catch {}
    } }, icons.access());
}

export function renderHeader(variant) {
  const menuBtn = (cls) => h("button", { class: cls, popovertarget: "menu", "aria-label": "Open menu" }, icons.menu());
  const header = variant === "bio"
    ? h("header", { class: "site-header bio" },
        h("a", { class: "wordmark", href: "index.html", "aria-label": C.name + " home" }, "code", h("b", null, ":"), "iconic"),
        h("div", { class: "icons" }, h("a", { href: safeUrl(C.instagram), rel: "noopener", "aria-label": "Instagram" }, icons.instagram()), menuBtn("")))
    : h("header", { class: "site-header" },
        h("a", { class: "logo-btn", href: "index.html", "aria-label": C.name + " home" }, logoMark()),
        h("nav", { class: "pill-nav", "aria-label": "Main" }, NAV.map(link)),
        h("div", { class: "header-end" }, a11yToggle(), h("a", { class: "cta-pill", href: "membership.html" }, "Join free"), menuBtn("round-btn menu")));
  const menu = h("nav", { id: "menu", popover: "auto", "aria-label": "Menu", "data-theme": "wine" },
    h("button", { class: "close", popovertarget: "menu", popovertargetaction: "hide" }, "Close"), MENU.map(link));
  $("#hdr").replaceWith(header);
  header.after(menu);
}
