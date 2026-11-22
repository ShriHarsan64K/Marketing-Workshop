/* Events come from the published Google Sheet (CSV). */
import C from "../config.js?v=20261122181820";
import { h } from "./dom.js?v=20261122181820";

export function parseCSV(t) {
  const rows = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
    else f += c;
  }
  if (f !== "" || r.length) { r.push(f); rows.push(r); }
  return rows;
}

function normDate(s) {
  s = (s || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);   // 29/11/2026 (day first)
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

export const slug = e => (e.date + "-" + e.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const imgSrc = n => !n ? "" : /^https?:\/\//i.test(n) ? n : "images/events/" + n;
export const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: C.timezone }).format(new Date());
const fmt = (iso, o) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
export const pretty = iso => fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const monthName = iso => fmt(iso, { month: "long", year: "numeric" });
export const dayMon = iso => [fmt(iso, { day: "2-digit" }), fmt(iso, { month: "short" })];

let cache;
export const peekEvents = () => cache;
const KEY = "ci-events-csv";
const parse = text => {
  const [head, ...rows] = parseCSV(text);
  const keys = head.map(k => k.trim().toLowerCase());
  return rows.filter(r => r.some(x => x.trim())).map(r => {
    const o = {}; keys.forEach((k, i) => o[k] = (r[i] || "").trim());
    o.date = normDate(o.date); o.photoList = (o.photos || "").split(",").map(x => x.trim()).filter(Boolean);
    o.id = slug(o); return o;
  }).filter(e => e.title && e.date && /^(true|yes|1)$/i.test(e.published));
};
async function fetchCsv(fresh) {
  const res = await fetch(fresh ? C.eventsCsv + (C.eventsCsv.includes("?") ? "&" : "?") + "_=" + Date.now() : C.eventsCsv);
  if (!res.ok) throw new Error("fetch");
  const text = await res.text();
  try { localStorage.setItem(KEY, text); } catch {}
  return text;
}
/* Stale-while-revalidate: show the last copy instantly, then refresh it in the background (fires "events-updated"). */
export async function loadEvents(fresh = false) {
  if (!C.eventsCsv) throw new Error("not-configured");
  if (cache && !fresh) return cache;
  let saved = null;
  if (!fresh) { try { saved = localStorage.getItem(KEY); } catch {} }
  if (saved) {
    cache = parse(saved);
    fetchCsv(true).then(t => { cache = parse(t); dispatchEvent(new Event("events-updated")); }).catch(() => {});
    return cache;
  }
  cache = parse(await fetchCsv(fresh));
  return cache;
}
export const upcoming = evs => evs.filter(e => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date));
/* The next event that has not started yet (flips to the following one the moment it starts). */
export const nextEvent = evs => evs.filter(e => startOf(e) > Date.now()).sort((a, b) => startOf(a) - startOf(b))[0] || null;
export const past = evs => evs.filter(e => e.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date));

/* "2:30 PM - 4:00 PM" -> Date in the site's timezone (IST, +05:30) */
export function startOf(e) {
  const m = (e.time || "").match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  let hh = 9, mm = 0;
  if (m) { hh = +m[1] % 12 + (/pm/i.test(m[3]) ? 12 : 0); mm = +(m[2] || 0); }
  return new Date(`${e.date}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+05:30`);
}


/* One event row: date chip, photo, details and a real Register button that opens the form. */
export function eventRow(e) {
  const [d, m] = dayMon(e.date);
  return h("article", { class: "ev" },
    h("div", { class: "ev-date" }, h("b", null, d), h("span", null, m)),
    h("img", { class: "ev-photo", src: e.image ? imgSrc(e.image) : "images/archive/" + PHOTOS[e.id.length % PHOTOS.length], alt: "", loading: "lazy", width: 160, height: 160 }),
    h("div", { class: "ev-body" }, h("h3", null, e.title), h("p", { class: "meta" }, [pretty(e.date), e.time, e.venue].filter(Boolean).join(" · ")), e.description && h("p", { class: "desc" }, e.description)),
    h("div", { class: "ev-side" }, e.price && h("span", { class: "price" }, e.price), h("a", { class: "btn", href: "event.html?e=" + encodeURIComponent(e.id) }, "Register")));
}
const PHOTOS = ["table-2.webp", "circle-2.webp", "mugs.webp", "hug.webp", "gather.webp"];
