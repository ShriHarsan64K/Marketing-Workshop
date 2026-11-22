"use strict";
const C = window.SITE;
const $ = (s, r = document) => r.querySelector(s);
const MENU = [["Events", "calendar.html"], ["Past events", "past.html"], ["About", "about.html"], ["Contact", "contact.html"]];
const ALL_MENU = [["Home", "index.html"], ...MENU, ["Join free", "membership.html"]];

/* ---------- helpers: all text goes through textContent, so sheet data can't inject HTML ---------- */
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
const mark = cls => h("span", { class: cls || null }, "code", h("span", { class: "colon" }, ":"), h("span", { class: "it" }, "iconic"));
const safeUrl = u => /^https?:\/\//i.test((u || "").trim()) ? u.trim() : "";
const todayISO = () => new Intl.DateTimeFormat("en-CA", { timeZone: C.timezone }).format(new Date());
const fmt = (iso, o) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
const pretty = iso => fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const monthName = iso => fmt(iso, { month: "long", year: "numeric" });
const dayMon = iso => [fmt(iso, { day: "2-digit" }), fmt(iso, { month: "short" })];
const imgSrc = n => !n ? "" : /^https?:\/\//i.test(n) ? n : "images/events/" + n;
const slug = e => (e.date + "-" + e.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;

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
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);   // 29/11/2026 (day first)
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
    into.append(h("p", { class: "note", role: "status" }, e.message === "not-configured"
      ? "Events are not connected yet." : "We couldn't load events right now. Please refresh in a moment."));
  }
}

/* ---------- layout ---------- */
function layout() {
  const here = location.pathname.split("/").pop() || "index.html";
  const bar = h("header", { class: "bar" },
    h("a", { class: "brand", href: "index.html", "aria-label": C.name + " home" }, mark()),
    h("nav", { class: "nav", "aria-label": "Main" }, MENU.map(([l, u]) => h("a", { href: u, "aria-current": u === here ? "page" : null }, l)),
      h("a", { class: "btn", href: "membership.html" }, "Join free")),
    h("button", { id: "mb", "aria-label": "Open menu", "aria-expanded": "false", "aria-controls": "dr" }, svgMenu()));
  $("#hdr").replaceWith(bar);
  const dr = h("nav", { class: "drawer", id: "dr", "aria-label": "Menu" },
    h("button", { class: "x", type: "button" }, "Close"),
    ALL_MENU.map(([l, u]) => h("a", { href: u, "aria-current": u === here ? "page" : null }, l)));
  bar.after(dr);
  $("#ftr").replaceWith(h("footer", null, h("div", { class: "in" },
    h("p", { class: "foot-mark" }, mark()),
    h("div", { class: "foot-cols" },
      h("div", null, h("div", { style: "font:italic 24px var(--serif);max-width:26ch" }, C.tagline)),
      h("div", null, ALL_MENU.map(([l, u]) => h("a", { href: u }, l))),
      h("div", null, h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram"), C.email && h("a", { href: "mailto:" + C.email }, C.email)))),
    h("p", { class: "tiny" }, `© ${new Date().getFullYear()} ${C.name}. Made in Chennai.`)));

  const mb = $("#mb");
  const tog = open => {
    dr.classList.toggle("open", open); mb.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $(".x", dr).focus(); else mb.focus();
  };
  mb.onclick = () => tog(true); $(".x", dr).onclick = () => tog(false);
  document.addEventListener("keydown", e => e.key === "Escape" && dr.classList.contains("open") && tog(false));
  dr.querySelectorAll("a").forEach(a => a.addEventListener("click", () => tog(false)));
  if (document.body.dataset.page === "home") {
    const sync = () => bar.classList.toggle("solid", scrollY > innerHeight * .6);
    addEventListener("scroll", sync, { passive: true }); sync();
  }
}
function svgMenu() {
  const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
  for (const [k, v] of Object.entries({ width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.6, "aria-hidden": "true" })) s.setAttribute(k, v);
  const p = document.createElementNS(ns, "path"); p.setAttribute("d", "M3 8h18M3 16h18"); s.append(p); return s;
}
function reveal(root = document) {
  const els = [...root.querySelectorAll(".rv:not(.in)")];
  if (reduced || !("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("in"));
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}

/* ---------- pieces ---------- */
function eventRow(e) {
  const [d, m] = dayMon(e.date);
  return h("article", { class: "ev rv" }, h("a", { href: "event.html?e=" + encodeURIComponent(e.id) },
    h("div", { class: "ev-date" }, h("b", null, d), h("span", null, m)),
    h("div", null, h("h3", null, e.title),
      h("p", { class: "meta" }, [pretty(e.date), e.time, e.venue].filter(Boolean).join(" · ")),
      e.description && h("p", { class: "desc" }, e.description)),
    h("div", { class: "ev-side" }, e.price && h("span", { class: "price" }, e.price), h("span", { class: "go" }, "Register"))));
}

function hero() {
  const S = C.slides;
  const imgs = S.map((s, i) => h("img", { src: s.image, alt: "", class: i ? null : "on", loading: i ? "lazy" : null, fetchpriority: i ? null : "high" }));
  const cap = h("p", { class: "hero-cap", "aria-live": "off" }, S[0].heading);
  const count = h("span", { "aria-live": "off" }, `01 / ${String(S.length).padStart(2, "0")}`);
  const pp = h("button", { class: "pp", type: "button" }, "Pause");
  const prev = h("button", { type: "button", "aria-label": "Previous photo" }, "‹"), next = h("button", { type: "button", "aria-label": "Next photo" }, "›");
  const el = h("section", { class: "hero", id: "hero", "aria-label": "Welcome" },
    h("div", { class: "hero-media" }, imgs),
    h("div", { class: "hero-in" },
      h("p", { class: "eyebrow", style: "color:var(--blush)" }, "A women's social club · Chennai"),
      h("h1", { class: "mark" }, mark()),
      h("p", { class: "lede" }, C.tagline),
      h("div", { class: "cta" }, h("a", { class: "btn", href: "membership.html" }, "Join free"), h("a", { class: "btn ghost", href: "#events" }, "See what's on"))),
    cap, h("div", { class: "hero-ctrl" }, count, prev, next, pp));
  let i = 0, timer = null, paused = reduced;
  const show = n => {
    i = (n + S.length) % S.length; imgs.forEach((im, k) => im.classList.toggle("on", k === i));
    cap.textContent = S[i].heading; count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(S.length).padStart(2, "0")}`;
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 6000); };
  prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
  pp.textContent = paused ? "Play" : "Pause";
  pp.onclick = () => { paused = !paused; pp.textContent = paused ? "Play" : "Pause"; paused ? stop() : start(); };
  el.addEventListener("focusin", stop); el.addEventListener("focusout", start);
  start();
  return el;
}

const PHONE = /^\+?[0-9][0-9 \-]{8,17}[0-9]$/, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const field = (label, name, attrs) => h("label", null, label, attrs.rows ? h("textarea", { name, ...attrs }) : h("input", { name, ...attrs }));
/* Posts to a Google Form's formResponse URL. The browser can't read the reply (no-cors), so a resolved request counts as sent. */
async function postToForm(cfg, values) {
  if (!cfg.action) throw new Error("not-configured");
  const fd = new FormData();
  for (const [k, entry] of Object.entries(cfg.fields)) if (entry && k in values) fd.append(entry, values[k]);
  await fetch(cfg.action, { method: "POST", mode: "no-cors", body: fd });
}
function contactForm({ cfg, extra, button, success, extraValues }) {
  const err = h("p", { class: "bad", role: "alert", hidden: true });
  const form = h("form", { class: "card-form", novalidate: true },
    field("Full name", "name", { required: true, maxlength: 100, autocomplete: "name" }),
    field("Email", "email", { type: "email", required: true, maxlength: 200, autocomplete: "email" }),
    field("Phone number (WhatsApp preferred)", "phone", { type: "tel", required: true, maxlength: 20, placeholder: "+91 98765 43210", autocomplete: "tel" }),
    extra, h("input", { class: "hp", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
    err, h("button", { class: "btn" }, button));
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (f.website) return success(true);                              // honeypot: pretend success
    const v = { name: f.name.trim().slice(0, 100), email: f.email.trim().toLowerCase().slice(0, 200), phone: f.phone.trim().slice(0, 20), message: (f.message || "").trim().slice(0, 500) };
    err.hidden = true;
    if (v.name.length < 2 || !EMAIL.test(v.email) || !PHONE.test(v.phone) || (extra && v.message.length < 10)) {
      err.textContent = extra ? "Please fill in every field: your name, a valid email, a phone number and a few words about you." : "Please fill in every field: your name, a valid email and a phone number.";
      err.hidden = false; return;
    }
    const btn = $("button", form); btn.disabled = true;
    try { await postToForm(cfg, { ...v, ...extraValues }); success(); }
    catch (e) { err.textContent = e.message === "not-configured" ? "This form is not connected yet." : "Something went wrong. Please try again."; err.hidden = false; btn.disabled = false; }
  });
  return form;
}
const head = (eyebrow, title, lead) => h("div", { class: "page-head" }, h("p", { class: "eyebrow" }, eyebrow), h("h1", null, title), lead && h("p", null, lead));

/* ---------- pages ---------- */
const pages = {
  async home(main) {
    main.before(hero());
    main.before(h("div", { class: "ribbon", "aria-hidden": "true" }, h("div", null, [0, 1].flatMap(() => C.vibes.map(v => h("span", null, v))))));
    main.removeAttribute("class");
    main.append(h("p", { class: "eyebrow" }, "Next up"), h("h2", { id: "events", style: "margin-bottom:40px;scroll-margin-top:90px" }, "Come sit with us."));
    const list = h("div"); main.append(list);
    await withEvents(main, evs => {
      const up = upcoming(evs).slice(0, 5);
      if (!up.length) main.append(h("p", { class: "note" }, "New events are being planned. Follow ", h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "us on Instagram"), " to hear first."));
      up.forEach(e => list.append(eventRow(e)));
      if (up.length) main.append(h("p", { style: "margin-top:36px" }, h("a", { class: "btn ghost", href: "calendar.html" }, "Full calendar")));
      reveal(main);
    });
    // membership band + moments (after the list so they sit below events)
    const band = h("section", { class: "sect band" }, h("div", { class: "in grid" },
      h("div", { class: "rv" }, h("p", { class: "eyebrow", style: "color:var(--rose)" }, "Membership"), h("h2", null, "Free to join. ", h("em", null, "Always.")),
        h("p", { style: "margin-top:24px;max-width:42ch" }, C.membershipText)),
      h("div", { class: "rv" }, h("ul", { class: "perks" }, C.perks.map(p => h("li", null, h("div", null, h("b", null, p[0]), p[1])))),
        h("a", { class: "btn light", href: "membership.html" }, "Join the community"))));
    const mom = h("section", { class: "sect" }, h("div", { class: "in" },
      h("p", { class: "eyebrow" }, "Moments"), h("h2", null, "Good company, ", h("em", null, "caught on camera.")),
      h("div", { class: "moments" }, C.slides.map(s => h("figure", { class: "rv" }, h("img", { src: s.image, alt: s.heading, loading: "lazy" }), h("figcaption", null, s.heading))))));
    main.after(mom); main.after(band); reveal(document);
  },
  async calendar(main) {
    main.append(head("Calendar", "Upcoming events", "Pick a date, register in a minute, and we'll confirm your spot."));
    await withEvents(main, evs => {
      const up = upcoming(evs);
      if (!up.length) main.append(h("p", { class: "note" }, "No upcoming events yet. Check back soon, or join free to hear first."));
      let last = "";
      for (const e of up) { const m = monthName(e.date); if (m !== last) { main.append(h("div", { class: "month" }, m)); last = m; } main.append(eventRow(e)); }
      reveal(main);
    });
  },
  async past(main) {
    main.append(head("Archive", "Past events", "Photos and memories from afternoons gone by."));
    await withEvents(main, evs => {
      const old = past(evs);
      if (!old.length) main.append(h("p", { class: "note" }, "Our first memories are still to be made."));
      for (const e of old) main.append(h("article", { style: "margin-bottom:72px" }, h("p", { class: "eyebrow" }, pretty(e.date) + (e.venue ? " · " + e.venue : "")), h("h2", { style: "font-size:clamp(30px,4vw,52px);margin-bottom:16px" }, e.title),
        h("p", { style: "max-width:60ch" }, e.description),
        e.image && h("img", { src: imgSrc(e.image), alt: e.title, loading: "lazy", style: "max-height:460px;border-radius:8px;margin-top:20px" }),
        e.photoList.length > 0 && h("div", { class: "moments", style: "grid-template-columns:repeat(auto-fill,minmax(200px,1fr))" }, e.photoList.map(p => h("figure", { style: "grid-column:auto!important;grid-row:auto!important" }, h("img", { src: imgSrc(p), alt: e.title + " photo", loading: "lazy" }))))));
    });
  },
  async event(main) {
    const id = new URLSearchParams(location.search).get("e");
    await withEvents(main, evs => {
      const e = evs.find(x => x.id === id);
      if (!e) { main.append(head("Event", "We couldn't find that event."), h("a", { class: "btn", href: "calendar.html" }, "See upcoming events")); return; }
      document.title = e.title + " · " + C.name;
      const info = h("div", null, h("p", { class: "eyebrow" }, "Register"), h("h1", { style: "font-size:clamp(40px,6vw,76px)" }, e.title),
        h("dl", null, h("dt", null, "When"), h("dd", null, pretty(e.date) + (e.time ? ", " + e.time : "")), e.venue && [h("dt", null, "Where"), h("dd", null, e.venue)], e.price && [h("dt", null, "Price"), h("dd", null, e.price)]),
        e.description && h("p", { style: "margin-top:28px;max-width:52ch" }, e.description),
        e.image && h("img", { src: imgSrc(e.image), alt: e.title, style: "margin-top:28px;border-radius:8px;max-height:480px" }));
      const box = h("div");
      if (e.date < todayISO()) box.append(h("p", { class: "note" }, "Registration for this event has closed. ", h("a", { href: "calendar.html" }, "See upcoming events"), "."));
      else box.append(contactForm({
        cfg: C.registerForm, button: "Reserve my spot", extraValues: { event: `${e.title} (${e.date})` },
        success(bot) {
          box.replaceChildren(bot ? "" : h("div", { class: "note", role: "status" }, h("h3", { style: "margin-bottom:10px" }, "You're on the list."), "We've received your registration. We'll confirm your spot soon."),
            !bot && safeUrl(e.link) && h("p", null, h("a", { class: "btn", href: safeUrl(e.link), rel: "noopener" }, "Payment and details")));
        }
      }));
      main.append(h("div", { class: "event-grid" }, info, box));
    });
  },
  membership(main) {
    main.append(head("Membership", "Join code: iconic. It's free.", C.membershipText));
    const box = h("div"); main.append(box);
    box.append(contactForm({
      cfg: C.memberForm, button: "Join for free", extraValues: {},
      extra: field("Tell us a little about yourself", "message", { rows: 4, maxlength: 500, required: true, placeholder: "What do you love doing? What would you like to try with us?" }),
      success: bot => box.replaceChildren(bot ? "" : h("div", { class: "note", role: "status" }, h("h3", { style: "margin-bottom:10px" }, "Welcome in."), "Thanks for joining. We'll be in touch soon."))
    }));
  },
  about(main) {
    main.append(head("About", "Who we are"), h("p", { style: "white-space:pre-line;font-size:20px" }, C.aboutWho),
      h("h2", { style: "margin:64px 0 20px;font-size:clamp(30px,4vw,48px)" }, "What we do"), h("p", { style: "white-space:pre-line;font-size:20px" }, C.aboutWhat),
      h("p", { style: "margin-top:40px" }, h("a", { class: "btn", href: "membership.html" }, "Join free")));
  },
  contact(main) {
    main.append(head("Contact", "Say hello", C.contactNote),
      h("div", { style: "display:grid;gap:14px;font-size:20px" }, C.email && h("a", { href: "mailto:" + C.email }, C.email), C.phone && h("span", null, C.phone),
        h("a", { href: safeUrl(C.instagram), rel: "noopener" }, C.instagram.replace(/^https?:\/\/(www\.)?/, ""))));
  },
  notfound(main) { main.append(head("404", "That page isn't here."), h("a", { class: "btn", href: "index.html" }, "Back home")); }
};

layout();
pages[document.body.dataset.page]($("#main"));
reveal(document);
