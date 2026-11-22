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
  const link = ([l, u]) => h("a", { href: u, "aria-current": u === here ? "page" : null }, l);
  $("#hdr").replaceWith(h("header", { class: "bar" }, h("div", { class: "wrap" },
    h("a", { class: "brand", href: "index.html", "aria-label": C.name + " home" }, mark()),
    h("nav", { class: "nav", "aria-label": "Main" }, MENU.map(link), h("a", { class: "btn", href: "membership.html" }, "Join free")),
    h("button", { class: "menu-btn", popovertarget: "menu", "aria-label": "Open menu" }, svgMenu()))));
  // native Popover API: opens/closes, traps Escape and returns focus with no JavaScript
  $(".bar").after(h("nav", { id: "menu", popover: "auto", "aria-label": "Menu" },
    h("button", { class: "close", popovertarget: "menu", popovertargetaction: "hide" }, "Close"), ALL_MENU.map(link)));
  $("#ftr").replaceWith(h("footer", null, h("div", { class: "wrap" },
    h("div", { class: "cols" },
      h("div", null, h("a", { class: "brand", href: "index.html", style: "display:inline" }, mark()), h("p", { class: "tag" }, C.headline)),
      h("div", null, ALL_MENU.map(([l, u]) => h("a", { href: u }, l))),
      h("div", null, h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "Instagram"), C.email && h("a", { href: "mailto:" + C.email }, C.email))),
    h("p", { class: "tiny" }, `© ${new Date().getFullYear()} ${C.name}. Made in Chennai.`))));
}
function svgMenu() {
  const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
  for (const [k, v] of Object.entries({ width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "aria-hidden": "true" })) s.setAttribute(k, v);
  const p = document.createElementNS(ns, "path"); p.setAttribute("d", "M4 8h16M4 16h16"); s.append(p); return s;
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
  const S = C.slides, pad = n => String(n).padStart(2, "0");
  const imgs = S.map((s, i) => h("img", { src: s.image, alt: i ? "" : "Women at a code:iconic event", class: i ? null : "on", width: 800, height: 1000, loading: i ? "lazy" : null, fetchpriority: i ? null : "high", decoding: "async" }));
  const count = h("span", null, `${pad(1)} / ${pad(S.length)}`);
  const pp = h("button", { type: "button" }, "Pause");
  const prev = h("button", { type: "button", "aria-label": "Previous photo" }, "←"), next = h("button", { type: "button", "aria-label": "Next photo" }, "→");
  const el = h("section", { class: "hero", "aria-label": "Welcome" }, h("div", { class: "wrap hero-grid" },
    h("div", null,
      h("p", { class: "eyebrow" }, "Women's social club · Chennai"),
      h("h1", null, C.headline),
      h("p", { class: "lead" }, C.lede),
      h("div", { class: "cta" }, h("a", { class: "btn", href: "membership.html" }, "Join free"), h("a", { class: "btn ghost", href: "#events" }, "See what's on"))),
    h("div", null, h("div", { class: "hero-photo" }, imgs), h("div", { class: "hero-ctrl" }, count, h("div", null, prev, next, pp)))));
  let i = 0, timer = null, paused = reduced;
  const show = n => { i = (n + S.length) % S.length; imgs.forEach((im, k) => im.classList.toggle("on", k === i)); count.textContent = `${pad(i + 1)} / ${pad(S.length)}`; };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!paused && !timer) timer = setInterval(() => show(i + 1), 5500); };
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
const head = (eyebrow, title, lead) => h("div", { class: "page-head" }, h("p", { class: "eyebrow" }, eyebrow), h("h1", null, title), lead && h("p", { class: "lead" }, lead));

/* ---------- pages ---------- */
const pages = {
  async home(main) {
    main.before(hero());
    main.before(h("section", { class: "wrap section" }, h("p", { class: "eyebrow" }, "What we do"), h("h2", null, C.whatTitle),
      h("ul", { class: "pillars" }, C.pillars.map(p => h("li", { class: "rv" }, h("h3", null, p[0]), h("p", null, p[1]))))));
    main.id = "events";
    main.append(h("div", { class: "section-head" }, h("div", null, h("p", { class: "eyebrow" }, "Upcoming"), h("h2", null, "Come sit with us.")),
      h("a", { class: "btn ghost", href: "calendar.html" }, "Full calendar")));
    const list = h("div"); main.append(list);
    await withEvents(main, evs => {
      const up = upcoming(evs).slice(0, 5);
      if (!up.length) main.append(h("p", { class: "note" }, "New events are being planned. Follow ", h("a", { href: safeUrl(C.instagram), rel: "noopener" }, "us on Instagram"), " to hear first."));
      up.forEach(e => list.append(eventRow(e)));
    });
    const band = h("section", { class: "section band" }, h("div", { class: "wrap grid" },
      h("div", null, h("p", { class: "eyebrow" }, "Membership"), h("h2", null, "Free to join. ", h("em", null, "Always.")), h("p", { class: "lead", style: "margin-top:16px;color:inherit;opacity:.85" }, C.membershipText)),
      h("div", null, h("ul", { class: "perks" }, C.perks.map(p => h("li", null, h("div", null, h("b", null, p[0]), p[1])))), h("a", { class: "btn light", href: "membership.html" }, "Join the community"))));
    const mom = h("section", { class: "wrap section" }, h("p", { class: "eyebrow" }, "Moments"), h("h2", null, "Good company, ", h("em", null, "caught on camera.")),
      h("div", { class: "moments" }, C.slides.map(s => h("figure", { class: "rv" }, h("img", { src: s.image, alt: s.heading, loading: "lazy", width: 800, height: 1000 }), h("figcaption", null, s.heading)))));
    main.after(mom); main.after(band);
  },
  async calendar(main) {
    main.append(head("Calendar", "Upcoming events", "Pick a date, register in a minute, and we'll confirm your spot."));
    await withEvents(main, evs => {
      const up = upcoming(evs);
      if (!up.length) main.append(h("p", { class: "note" }, "No upcoming events yet. Check back soon, or join free to hear first."));
      let last = "";
      for (const e of up) { const m = monthName(e.date); if (m !== last) { main.append(h("div", { class: "month" }, m)); last = m; } main.append(eventRow(e)); }
    });
  },
  async past(main) {
    main.append(head("Archive", "Past events", "Photos and memories from afternoons gone by."));
    await withEvents(main, evs => {
      const old = past(evs);
      if (!old.length) main.append(h("p", { class: "note" }, "Our first memories are still to be made."));
      for (const e of old) main.append(h("article", { style: "margin-bottom:64px" }, h("p", { class: "eyebrow" }, pretty(e.date) + (e.venue ? " · " + e.venue : "")), h("h2", null, e.title),
        e.description && h("p", { class: "lead", style: "margin-top:12px" }, e.description),
        e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title, loading: "lazy" }),
        e.photoList.length > 0 && h("div", { class: "moments" }, e.photoList.map(p => h("figure", null, h("img", { src: imgSrc(p), alt: e.title + " photo", loading: "lazy" }))))));
    });
  },
  async event(main) {
    const id = new URLSearchParams(location.search).get("e");
    await withEvents(main, evs => {
      const e = evs.find(x => x.id === id);
      if (!e) { main.append(head("Event", "We couldn't find that event."), h("a", { class: "btn", href: "calendar.html" }, "See upcoming events")); return; }
      document.title = e.title + " · " + C.name;
      const info = h("div", null, h("p", { class: "eyebrow" }, "Register"), h("h1", null, e.title),
        h("dl", { class: "facts" }, h("dt", null, "When"), h("dd", null, pretty(e.date) + (e.time ? ", " + e.time : "")), e.venue && [h("dt", null, "Where"), h("dd", null, e.venue)], e.price && [h("dt", null, "Price"), h("dd", null, e.price)]),
        e.description && h("p", { class: "lead" }, e.description),
        e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title }));
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
    main.append(head("About", "Who we are"), h("div", { class: "prose" }, h("p", { style: "white-space:pre-line" }, C.aboutWho), h("h2", null, "What we do"), h("p", { style: "white-space:pre-line" }, C.aboutWhat),
      h("a", { class: "btn", href: "membership.html" }, "Join free")));
  },
  contact(main) {
    main.append(head("Contact", "Say hello", C.contactNote),
      h("div", { class: "links" }, C.email && h("a", { href: "mailto:" + C.email }, C.email), C.phone && h("span", null, C.phone),
        h("a", { href: safeUrl(C.instagram), rel: "noopener" }, C.instagram.replace(/^https?:\/\/(www\.)?/, ""))));
  },
  notfound(main) { main.append(head("404", "That page isn't here."), h("a", { class: "btn", href: "index.html" }, "Back home")); }
};

layout();
pages[document.body.dataset.page]($("#main"));
