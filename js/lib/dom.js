/* Tiny DOM helpers. All text goes through text nodes, so sheet data can never inject HTML. */
export const $ = (s, r = document) => r.querySelector(s);

export function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k);
  return e;
}

const NS = "http://www.w3.org/2000/svg";
export function svg(tag, attrs, ...kids) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
  for (const k of kids.flat()) if (k != null) e.append(k);
  return e;
}

export const safeUrl = u => /^https?:\/\//i.test((u || "").trim()) ? u.trim() : "";
export const logoMark = (light = false) => h("img", { src: `images/logo/${light ? "logo-light" : "logo"}.png`, alt: "code:iconic", width: 640, height: 440 });
export const arch = n => "images/archive/" + n;


/* Contact helpers: India numbers are stored as written; links add +91. */
export const phoneDigits = p => "91" + String(p).replace(/\D/g, "").slice(-10);
export const whatsapp = (p, text = "Hi code:iconic") => `https://wa.me/${phoneDigits(p)}?text=${encodeURIComponent(text)}`;
export const telHref = p => "tel:+" + phoneDigits(p);
