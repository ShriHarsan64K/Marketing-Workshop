"use strict";
const C = window.SITE;
const MENU = [["Home", "index.html"], ["Calendar", "calendar.html"], ["Past Events", "past.html"],
  ["Membership", "membership.html"], ["About Us", "about.html"], ["Contact", "contact.html"]];

/* ---------- helpers (all text goes through textContent, so sheet data can't inject HTML) ---------- */
function h(tag, attrs, ...kids) {
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
const safeUrl = u => /^https?:\/\//i.test((u || "").trim()) ? u.trim() : "";
const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: C.timezone }).format(new Date());
const pretty = iso => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
const monthName = iso => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayMon = iso => { const d = new Date(iso + "T00:00:00Z"); return [String(d.getUTCDate()).padStart(2, "0"), d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase()]; };
const imgSrc = n => !n ? "" : /^https?:\/\//i.test(n) ? n : "images/events/" + n;
const slug = e => (e.date + "-" + e.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseCSV(t) {
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
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);   // 29/11/2026
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : "";
}

let eventsCache;
async function loadEvents() {
  if (eventsCache) return eventsCache;
  if (!C.eventsCsv) throw new Error("not-configured");
  const res = await fetch(C.eventsCsv);
  if (!res.ok) throw new Error("fetch");
  const [head, ...rows] = parseCSV(await res.text());
  const keys = head.map(k => k.trim().toLowerCase());
  eventsCache = rows.filter(r => r.some(x => x.trim())).map(r => {
    const o = {}; keys.forEach((k, i) => o[k] = (r[i] || "").trim());
    o.date = normDate(o.date); o.photoList = (o.photos || "").split(",").map(x => x.trim()).filter(Boolean);
    o.id = slug(o); return o;
  }).filter(e => e.title && e.date && /^(true|yes|1)$/i.test(e.published));
  return eventsCache;
}
const upcoming = evs => evs.filter(e => e.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date));
const past = evs => evs.filter(e => e.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date));

async function withEvents(into, render) {
  try { render(await loadEvents()); }
  catch (e) {
    into.append(h("p", { class: "ok mt", role: "status" }, e.message === "not-configured"
      ? "Events are not connected yet."
      : "We couldn't load events right now. Please refresh in a moment."));
  }
}

/* ---------- layout ---------- */
function layout() {
  const here = location.pathname.split("/").pop() || "index.html";
  $("#hdr").replaceWith(
    h("header", { class: "bar" },
      h("button", { id: "mb", "aria-label": "Open menu", "aria-expanded": "false", "aria-controls": "dr" }, svgMenu()),
      h("a", { class: "brand", href: "index.html" }, C.name),
      h("span", { style: "width:42px", "aria-hidden": "true" })),
  );
  const nav = h("nav", { class: "drawer", id: "dr", "aria-label": "Main menu" },
    MENU.map(([l, u]) => h("a", { href: u, "aria-current": u === here ? "page" : null }, l)));
  const veil = h("div", { class: "veil", id: "vl" });
  document.querySelector(".bar").after(nav, veil);
  $("#ftr").replaceWith(h("footer", null, h("div", { class: "in" },
    h("div", null, h("div", { style: "font-size:28px" }, C.name), h("div", { class: "muted", style: "max-width:300px" }, C.tagline)),
    h("div", null, MENU.map(([l, u]) => h("a", { href: u }, l))),
    h("div", null, h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram"), h("a", { href: "contact.html" }, "Contact us")))));

  const mb = $("#mb"), dr = $("#dr"), vl = $("#vl");
  const tog = open => {
    dr.classList.toggle("open", open); vl.classList.toggle("open", open); mb.setAttribute("aria-expanded", open);
    if (open) dr.querySelector("a").focus(); else if (dr.contains(document.activeElement)) mb.focus();
  };
  mb.onclick = () => tog(!dr.classList.contains("open"));
  vl.onclick = () => tog(false);
  document.addEventListener("keydown", e => e.key === "Escape" && tog(false));
  dr.querySelectorAll("a").forEach(a => a.addEventListener("click", () => tog(false)));
}
function svgMenu() {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", 26); s.setAttribute("height", 26); s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.8"); s.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", "M3 6h18M3 12h18M3 18h18"); s.append(p); return s;
}
const $ = (s, r = document) => r.querySelector(s);

/* ---------- pieces ---------- */
function eventCard(e) {
  const [d, m] = dayMon(e.date);
  return h("article", { class: "card" },
    h("div", { class: "date" }, h("b", null, d), h("span", null, m)),
    e.image ? h("img", { src: imgSrc(e.image), alt: e.title, loading: "lazy" }) : h("div", { class: "noimg" }, C.name),
    h("div", { class: "in" }, h("h3", null, e.title),
      h("div", { class: "meta" }, "🗓 " + pretty(e.date) + (e.time ? " · " + e.time : "")),
      e.venue && h("div", { class: "meta" }, "📍 " + e.venue),
      e.price && h("span", { class: "price" }, e.price),
      h("p", { style: "margin:4px 0;font-size:15px" }, e.description),
      h("div", { style: "margin-top:auto" }, h("a", { class: "btn", href: "event.html?e=" + encodeURIComponent(e.id) }, "Register now"))));
}

function carousel() {
  const hero = h("section", { class: "hero", id: "hero", "aria-roledescription": "carousel", "aria-label": "Highlights" },
    C.slides.map((s, i) => h("div", { class: "sl" + (i ? "" : " on"), role: "group", "aria-roledescription": "slide", "aria-label": `${i + 1} of ${C.slides.length}` },
      h("div", { class: "bg", style: `background-image:url('${s.image}')` }),
      h("img", { src: s.image, alt: "", loading: i ? "lazy" : null }),
      h("div", { class: "cap" }, h("h2", null, s.heading), h("p", null, s.caption), h("a", { class: "btn alt", style: "margin-top:16px", href: "#main" }, "See what's on")))),
    h("button", { class: "ar", style: "left:8px", id: "pv", "aria-label": "Previous slide" }, "‹"),
    h("button", { class: "ar", style: "right:8px", id: "nx", "aria-label": "Next slide" }, "›"),
    h("div", { class: "dots" }, C.slides.map((_, i) => h("button", { "data-i": i, "aria-label": "Slide " + (i + 1), class: i ? null : "on" })),
      h("button", { class: "pp", id: "pp", type: "button" }, "Pause")));
  return hero;
}
function runCarousel(hero) {
  const slides = [...hero.querySelectorAll(".sl")], dots = [...hero.querySelectorAll(".dots [data-i]")], pp = $("#pp", hero);
  let i = 0, timer = null, paused = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const show = n => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle("on", k === i)); dots.forEach((d, k) => { d.classList.toggle("on", k === i); d.setAttribute("aria-current", k === i); }); };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
  $("#pv", hero).onclick = () => show(i - 1); $("#nx", hero).onclick = () => show(i + 1);
  dots.forEach(d => d.onclick = () => show(+d.dataset.i));
  pp.textContent = paused ? "Play" : "Pause";
  pp.onclick = () => { paused = !paused; pp.textContent = paused ? "Play" : "Pause"; paused ? stop() : start(); };
  hero.addEventListener("mouseenter", stop); hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop); hero.addEventListener("focusout", start);
  start();
}

const PHONE = /^\+?[0-9][0-9 \-]{8,17}[0-9]$/, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
function field(label, name, attrs) {
  const input = attrs.rows ? h("textarea", { name, ...attrs }) : h("input", { name, ...attrs });
  return h("label", null, label, input);
}
/* Posts to a Google Form's formResponse URL. The browser can't read the reply (no-cors), so we trust a resolved request. */
async function postToForm(cfg, values) {
  if (!cfg.action) throw new Error("not-configured");
  const fd = new FormData();
  for (const [k, entry] of Object.entries(cfg.fields)) if (entry && k in values) fd.append(entry, values[k]);
  await fetch(cfg.action, { method: "POST", mode: "no-cors", body: fd });
}
function contactForm({ cfg, extra, button, success, extraValues }) {
  const err = h("p", { class: "bad", role: "alert", hidden: true });
  const form = h("form", { novalidate: true },
    field("Full name", "name", { required: true, maxlength: 100, autocomplete: "name" }),
    field("Email", "email", { type: "email", required: true, maxlength: 200, autocomplete: "email" }),
    field("Phone number", "phone", { type: "tel", required: true, maxlength: 20, placeholder: "+91 98765 43210", autocomplete: "tel" }),
    extra, h("input", { class: "hp", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
    h("button", { class: "btn", style: "margin-top:18px" }, button));
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (f.website) return success(form, true);                       // honeypot: pretend success
    const v = { name: f.name.trim().slice(0, 100), email: f.email.trim().toLowerCase().slice(0, 200), phone: f.phone.trim().slice(0, 20), message: (f.message || "").trim().slice(0, 500) };
    err.hidden = true;
    if (v.name.length < 2 || !EMAIL.test(v.email) || !PHONE.test(v.phone)) { err.textContent = "Please enter your name, a valid email and a phone number."; err.hidden = false; return; }
    const btn = $("button", form); btn.disabled = true;
    try { await postToForm(cfg, { ...v, ...extraValues }); success(form); }
    catch (e) { err.textContent = e.message === "not-configured" ? "Sign-ups are not connected yet." : "Something went wrong. Please try again."; err.hidden = false; btn.disabled = false; }
  });
  return h("div", null, err, form);
}

/* ---------- pages ---------- */
const pages = {
  async home(main) {
    main.before(carousel()); runCarousel($("#hero"));
    main.append(h("h1", null, "Upcoming events, come join us"));
    const grid = h("div", { class: "evt" }); main.append(grid);
    await withEvents(main, evs => {
      const up = upcoming(evs);
      if (!up.length) main.append(h("p", { class: "ok mt" }, "New events are being planned. Follow ", h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "us on Instagram"), " to hear first."));
      up.forEach(e => grid.append(eventCard(e)));
    });
  },
  async calendar(main) {
    main.append(h("h1", null, "Calendar"));
    await withEvents(main, evs => {
      const up = upcoming(evs);
      if (!up.length) main.append(h("p", { class: "ok mt" }, "No upcoming events yet. Check back soon."));
      let last = "";
      for (const e of up) {
        const m = monthName(e.date);
        if (m !== last) { main.append(h("h2", { class: "mt" }, m)); last = m; }
        const [d, mo] = dayMon(e.date);
        main.append(h("div", { class: "cal" }, h("div", { class: "d" }, h("b", null, d), mo),
          h("div", { style: "flex:1" }, h("b", { style: "font-size:22px" }, e.title), h("div", { class: "muted" }, [e.time, e.venue].filter(Boolean).join(" · "))),
          h("a", { class: "btn", href: "event.html?e=" + encodeURIComponent(e.id) }, "Register")));
      }
    });
  },
  async past(main) {
    main.append(h("h1", null, "Past events"));
    await withEvents(main, evs => {
      const old = past(evs);
      if (!old.length) main.append(h("p", { class: "ok mt" }, "Our first memories are still to be made."));
      for (const e of old) main.append(h("article", { class: "mt" }, h("h2", null, e.title),
        h("div", { class: "muted" }, pretty(e.date) + (e.venue ? " · " + e.venue : "")), h("p", null, e.description),
        e.image && h("img", { src: imgSrc(e.image), alt: e.title, loading: "lazy", style: "max-width:100%;max-height:420px" }),
        h("div", { class: "gal" }, e.photoList.map(p => h("img", { src: imgSrc(p), alt: e.title + " photo", loading: "lazy" })))));
    });
  },
  async event(main) {
    const id = new URLSearchParams(location.search).get("e");
    await withEvents(main, evs => {
      const e = evs.find(x => x.id === id);
      if (!e) { main.append(h("h1", null, "Event not found"), h("p", null, h("a", { class: "btn", href: "index.html" }, "See upcoming events"))); return; }
      document.title = e.title + " · " + C.name;
      main.append(h("h1", null, e.title),
        h("p", null, "🗓 " + pretty(e.date) + (e.time ? " · " + e.time : ""), e.venue && [h("br"), "📍 " + e.venue], e.price && [h("br"), "💸 " + e.price]),
        e.description && h("p", null, e.description));
      if (e.date < todayISO()) { main.append(h("p", { class: "ok" }, "Registration for this event has closed. ", h("a", { href: "index.html" }, "See upcoming events"), ".")); return; }
      const box = h("div");
      main.append(h("h2", { class: "mt" }, "Register for this event"), box);
      box.append(contactForm({
        cfg: C.registerForm, button: "Register", extraValues: { event: `${e.title} (${e.date})` },
        success(form, bot) {
          if (bot) return box.replaceChildren();
          box.replaceChildren(h("p", { class: "ok", role: "status" }, "Thank you! We've received your registration. It will be confirmed by the organiser soon."),
            safeUrl(e.link) && h("p", null, h("a", { class: "btn", href: safeUrl(e.link), rel: "noopener" }, "Payment / more details")));
        }
      }));
    });
  },
  membership(main) {
    main.append(h("h1", null, "Membership"), h("p", { style: "white-space:pre-line" }, C.membershipText));
    const box = h("div"); main.append(box);
    box.append(contactForm({
      cfg: C.memberForm, button: "Send", extraValues: {},
      extra: field("Tell us a little about yourself (optional)", "message", { rows: 4, maxlength: 500 }),
      success: (_f, bot) => box.replaceChildren(!bot && h("p", { class: "ok", role: "status" }, "Thank you! We'll be in touch."))
    }));
  },
  about(main) {
    main.append(h("h1", null, "About us"), h("h2", { class: "mt" }, "Who we are"), h("p", { style: "white-space:pre-line" }, C.aboutWho),
      h("h2", { class: "mt" }, "What we do"), h("p", { style: "white-space:pre-line" }, C.aboutWhat));
  },
  notfound(main) { main.append(h("h1", null, "Page not found"), h("p", null, h("a", { class: "btn", href: "index.html" }, "Back home"))); },
  contact(main) {
    main.append(h("h1", null, "Contact us"), h("p", { style: "white-space:pre-line" }, C.contactNote),
      C.email && h("p", null, "Email: ", h("a", { href: "mailto:" + C.email }, C.email)), C.phone && h("p", null, "Phone: " + C.phone),
      h("p", null, "Instagram: ", h("a", { href: safeUrl(C.instagram), rel: "noopener" }, C.instagram)));
  }
};

layout();
pages[document.body.dataset.page]($("#main"));
