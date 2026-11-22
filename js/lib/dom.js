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
export const logoMark = (w = 28) => h("img", { src: "images/logo/mark.svg", alt: "", width: w, height: Math.round(w * 0.7) });
export const arch = n => "images/archive/" + n;

/* Small line icons (24px grid) */
const icon = (paths, extra) => svg("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", ...extra }, paths.map(d => svg("path", { d })));
export const icons = {
  menu: () => icon(["M4 8h16", "M4 16h16"]),
  instagram: () => svg("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "aria-hidden": "true" },
    svg("rect", { x: 3.5, y: 3.5, width: 17, height: 17, rx: 5 }), svg("circle", { cx: 12, cy: 12, r: 4 }), svg("circle", { cx: 17.2, cy: 6.8, r: 1, fill: "currentColor", stroke: "none" })),
  mail: () => icon(["M4 6h16v12H4z", "m4 7 8 6 8-6"]),
  access: () => svg("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.7, "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
    svg("circle", { cx: 12, cy: 12, r: 9 }), svg("circle", { cx: 12, cy: 7.8, r: 1, fill: "currentColor" }), svg("path", { d: "M7.5 10.5c3 .9 6 .9 9 0M12 11v3.5m0 0-2.2 3.5m2.2-3.5 2.2 3.5" })),
  chat: () => svg("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
    svg("circle", { cx: 7, cy: 12, r: 1.600 }), svg("circle", { cx: 12, cy: 12, r: 1.600 }), svg("circle", { cx: 17, cy: 12, r: 1.600 }))
};
