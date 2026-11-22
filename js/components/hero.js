/* Home hero: headline on the left, photo slideshow on the right. */
import C from "../config.js";
import { h } from "../lib/dom.js";

const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
const pad = n => String(n).padStart(2, "0");

export function hero() {
  const S = C.slides;
  const imgs = S.map((s, i) => h("img", { src: s.image, alt: i ? "" : "Women at a code:iconic event", class: i ? null : "on", width: 800, height: 1000, loading: i ? "lazy" : null, fetchpriority: i ? null : "high", decoding: "async" }));
  const cap = h("p", { class: "photo-cap" }, S[0].heading);
  const count = h("span", null, `${pad(1)} / ${pad(S.length)}`);
  const pp = h("button", { type: "button" }, reduced ? "Play" : "Pause");
  const prev = h("button", { type: "button", "aria-label": "Previous photo" }, "←"), next = h("button", { type: "button", "aria-label": "Next photo" }, "→");
  const el = h("section", { class: "home-hero wrap", "aria-label": "Welcome" }, h("div", { class: "grid" },
    h("div", null,
      h("p", { class: "eyebrow" }, "Women's social club · Chennai"),
      h("h1", null, "Finally, a space that's ", h("em", null, "yours.")),
      h("p", { class: "lead" }, C.lede),
      h("div", { class: "cta" }, h("a", { class: "btn", href: "membership.html" }, "Join free"), h("a", { class: "btn ghost", href: "#events" }, "See what's on"))),
    h("div", null, h("div", { class: "photo" }, imgs, cap), h("div", { class: "photo-ctrl" }, count, h("div", null, prev, next, pp)))));
  let i = 0, timer = null, paused = reduced;
  const show = n => { i = (n + S.length) % S.length; imgs.forEach((im, k) => im.classList.toggle("on", k === i)); cap.textContent = S[i].heading; count.textContent = `${pad(i + 1)} / ${pad(S.length)}`; };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
  prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
  pp.onclick = () => { paused = !paused; pp.textContent = paused ? "Play" : "Pause"; paused ? stop() : start(); };
  el.addEventListener("focusin", stop); el.addEventListener("focusout", start);
  start();
  return el;
}
