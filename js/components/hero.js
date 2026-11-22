/* Home hero: the markup is in the page already (so it paints before any JavaScript); this wires the slideshow. */
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
const pad = n => String(n).padStart(2, "0");

export function hero() {
  const root = document.querySelector(".hero-full");
  if (!root) return;
  const imgs = [...root.querySelectorAll(".slides img")], count = root.querySelector("#hero-count");
  const prev = root.querySelector("#hero-prev"), next = root.querySelector("#hero-next"), pp = root.querySelector("#hero-pp");
  const icons = { pause: pp.querySelector("svg").cloneNode(true), play: pp.querySelector("template").content.firstElementChild };
  let i = 0, timer = null, paused = reduced;
  const show = n => { i = (n + imgs.length) % imgs.length; imgs.forEach((im, k) => im.classList.toggle("on", k === i)); count.textContent = `${pad(i + 1)} / ${pad(imgs.length)}`; };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
  const label = () => { pp.querySelector("svg").replaceWith((paused ? icons.play : icons.pause).cloneNode(true)); pp.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow"); };
  prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
  pp.onclick = () => { paused = !paused; label(); paused ? stop() : start(); };
  if (paused) label();
  start();
}
