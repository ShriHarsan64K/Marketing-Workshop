/* Home hero: a full-bleed photo slideshow with the words on top of a wine veil. */
import C from "../config.js";
import { h } from "../lib/dom.js";
import { icon } from "../lib/icons.js";

const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
const pad = n => String(n).padStart(2, "0");

export function hero() {
  const S = C.slides;
  const imgs = S.map((s, i) => h("img", { src: s.image, alt: i ? "" : "Women at a code:iconic event", class: i ? null : "on", width: 1200, height: 800, loading: i ? "lazy" : null, fetchpriority: i ? null : "high", decoding: "async" }));
  const count = h("span", null, `${pad(1)} / ${pad(S.length)}`);
  const swap = playing => { pp.replaceChildren(icon(playing ? "pause" : "play", 18)); pp.setAttribute("aria-label", playing ? "Pause slideshow" : "Play slideshow"); };
  const pp = h("button", { type: "button" }), prev = h("button", { type: "button", "aria-label": "Previous photo" }, icon("left", 18)), next = h("button", { type: "button", "aria-label": "Next photo" }, icon("right", 18));
  const el = h("section", { class: "hero-full", "aria-label": "Welcome" },
    h("div", { class: "slides" }, imgs),
    h("div", { class: "wrap hero-in" },
      h("p", { class: "eyebrow" }, "Women's social club · Chennai"),
      h("h1", null, "Finally, a space that's ", h("em", null, "yours.")),
      h("p", { class: "lead" }, C.lede),
      h("div", { class: "cta" }, h("a", { class: "btn", href: "membership.html" }, "Join free"), h("a", { class: "btn ghost", href: "#events" }, "See what's on"))),
    h("div", { class: "wrap hero-ctrl" }, count, h("div", null, prev, next, pp)));
  let i = 0, timer = null, paused = reduced;
  const show = n => { i = (n + S.length) % S.length; imgs.forEach((im, k) => im.classList.toggle("on", k === i)); count.textContent = `${pad(i + 1)} / ${pad(S.length)}`; };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
  prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
  pp.onclick = () => { paused = !paused; swap(!paused); paused ? stop() : start(); };
  swap(!paused); start();
  return el;
}
