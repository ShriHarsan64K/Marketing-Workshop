#!/usr/bin/env python3
"""Build step for GitHub Pages. Run before every push:   python3 tools/build.py

 1. Stamps every local JS import with ?v=<time> (GitHub Pages caches for 10 minutes, so a deploy never serves a mix).
 2. Bundles css/*.css into one minified css/site.css.
 3. Writes every page: a static header, footer and (on Home) hero, so the page paints before any JavaScript runs,
    plus preloads for the first photo, the scripts the page needs, and the events sheet.
 4. Stamps sw.js so the previous cache is retired.
Contact details, nav and copy come from js/config.js; icons from js/lib/icons.js."""
import glob, json, os, re, subprocess, time
VER = time.strftime("%Y%m%d%H%M%S")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)

def node(js):
    return json.loads(subprocess.run(["node", "--input-type=module", "-e", js], capture_output=True, text=True, check=True).stdout)
C = node("import C from './js/config.js'; console.log(JSON.stringify(C))")
ICONS = node("import {PATHS} from './js/lib/icons.js'; console.log(JSON.stringify(PATHS))")
def icon(name, size=20):
    return f'<svg viewBox="0 0 32 32" width="{size}" height="{size}" fill="currentColor" aria-hidden="true" focusable="false">{ICONS[name]}</svg>'

# ---- 1. JS stamping + import graph ----
def stamp_js(s):
    s = re.sub(r'(from\s+["\'])(\.{1,2}/[^"\'?]+?\.js)(\?v=\d+)?(["\'])', rf'\1\2?v={VER}\4', s)
    return re.sub(r'(import\(`[^`]*?\.js)(\?v=\d+)?(`)', rf'\1?v={VER}\3', s)
for f in glob.glob("js/**/*.js", recursive=True):
    s = open(f).read(); n = stamp_js(s)
    if n != s: open(f, "w").write(n)
def graph(entry, seen=None):
    seen = seen if seen is not None else []
    if entry in seen: return seen
    seen.append(entry)
    for m in re.finditer(r'from\s+["\'](\.{1,2}/[^"\'?]+\.js)', open(entry).read()):
        graph(os.path.normpath(os.path.join(os.path.dirname(entry), m.group(1))), seen)
    return seen

# ---- 2. CSS bundle ----
ORDER = ["tokens", "base", "layout", "components", "home", "about", "contact"]
def mini(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    return re.sub(r"\s*([{};,>])\s*", r"\1", css).replace(": ", ":").strip()
open("css/site.css", "w").write("\n".join(mini(open(f"css/{n}.css").read()) for n in ORDER))

# ---- 3. pages ----
NAV = [("Events", "calendar.html"), ("Archive", "past.html"), ("About", "about.html"), ("Contact", "contact.html")]
MENU = [("Home", "index.html")] + NAV + [("Join free", "membership.html")]
digits = re.sub(r"\D", "", C["phone"])[-10:]
tel, wa = "tel:+91" + digits, f"https://wa.me/91{digits}?text=Hi%20code%3Aiconic"
PARENT = {"event.html": "calendar.html"}   # inner pages keep their parent button highlighted
def link(label, href, page):
    page = PARENT.get(page, page)
    cur = ' aria-current="page"' if href == page else ""
    return f'<a href="{href}"{cur}>{label}</a>'
def header(page):
    menu_btn = lambda cls: f'<button class="{cls}" popovertarget="menu" aria-label="Open menu">{icon("menu", 22)}</button>'
    nav = "".join(link(l, h, page) for l, h in NAV)
    cta_cur = ' aria-current="page"' if page == "membership.html" else ""
    return (f'<header class="site-header"><a class="logo-btn" href="index.html" aria-label="{C["name"]} home"><img src="images/logo/logo.webp" alt="{C["name"]}" width="480" height="330"></a>'
            f'<div class="header-right"><nav class="pill-nav" aria-label="Main">{nav}</nav><a class="cta-pill" href="membership.html"{cta_cur}>Join free</a>{menu_btn("round-btn menu")}</div></header>')
def menu(page):
    return (f'<nav id="menu" popover="auto" aria-label="Menu"><button class="close" popovertarget="menu" popovertargetaction="hide" aria-label="Close menu">{icon("close", 26)}</button>'
            + "".join(link(l, h, page) for l, h in MENU) + "</nav>")
def footer():
    col = lambda t, *a: f'<div><h3>{t}</h3>{"".join(a)}</div>'
    return (f'<footer class="site-footer" data-theme="pink"><div class="wrap"><div class="top"><a class="foot-logo" href="index.html" aria-label="{C["name"]} home"><img src="images/logo/logo.webp" alt="{C["name"]}" width="480" height="330" loading="lazy"></a><p class="tag">{C["tagline"]}</p></div>'
            '<div class="cols">'
            + col("Explore", '<a href="calendar.html">Events</a>', '<a href="past.html">Archive</a>', '<a href="membership.html">Membership</a>')
            + col("About us", '<a href="about.html">Jaisu\'s story</a>', '<a href="contact.html">Contact</a>', f'<a href="{C["instagram"]}" rel="noopener">Instagram</a>')
            + col("Get in touch",
                  f'<div class="social"><a href="{C["instagram"]}" rel="noopener" aria-label="Instagram">{icon("instagram")}</a><a href="{wa}" rel="noopener" aria-label="WhatsApp">{icon("chat")}</a><a href="mailto:{C["email"]}" aria-label="Email">{icon("mail")}</a></div>')
            + f'</div><div class="legal"><span>{C["city"]} / India</span><span>©{C["name"]} {time.strftime("%Y")}</span><span>Free to join</span></div></div></footer>')
def hero():
    slides = "".join(f'<img src="{s["image"]}" alt="{"Women at a code:iconic event" if i == 0 else ""}"' + (' class="on" fetchpriority="high" decoding="async"' if i == 0 else ' loading="lazy" decoding="async"') + ">" for i, s in enumerate(C["slides"]))
    n = len(C["slides"])
    return ('<section class="hero-full" aria-label="Welcome"><div class="slides">' + slides + '</div>'
            f'<div class="wrap hero-in"><p class="club">code<b>:</b>iconic</p><p class="eyebrow">Women\'s social club · Chennai</p><h1>Finally, a space that\'s <em>yours.</em></h1><p class="lead">{C["lede"]}</p>'
            '<div class="cta"><a class="btn" href="membership.html">Join free</a><a class="btn ghost" href="#events">See what\'s on</a></div></div>'
            f'<div class="wrap hero-ctrl"><span id="hero-count">01 / {n:02d}</span><div><button id="hero-prev" type="button" aria-label="Previous photo">{icon("left", 18)}</button><button id="hero-next" type="button" aria-label="Next photo">{icon("right", 18)}</button>'
            f'<button id="hero-pp" type="button" aria-label="Pause slideshow">{icon("pause", 18)}<template>{icon("play", 18)}</template></button></div></div></section>')

PAGES = {  # file: (data-page, title, description, uses events sheet)
    "index.html": ("home", "code:iconic · Women's social club in Chennai", "A free-to-join women's social club in Chennai. Crochet, journaling, picnics, brunch, vision boards, Galentine's and book club.", True),
    "calendar.html": ("calendar", "Events · code:iconic", "Upcoming code:iconic events in Chennai. Pick a date and register.", True),
    "past.html": ("past", "Archive · code:iconic", "Photos from past code:iconic events.", True),
    "event.html": ("event", "Register · code:iconic", "Register for a code:iconic event in Chennai.", True),
    "membership.html": ("membership", "Join free · code:iconic", "Join code:iconic for free and hear about every event first.", False),
    "about.html": ("about", "Jaisu's story · code:iconic", "The story of code:iconic's founder.", False),
    "contact.html": ("contact", "Contact · code:iconic", "Get in touch with code:iconic.", False),
    "404.html": ("notfound", "Not found · code:iconic", "Page not found.", False),
}
for fname, (page, title, desc, uses_events) in PAGES.items():
    theme = "wine"
    mods = [m for m in graph("js/main.js") + graph(f"js/pages/{page}.js") if m != "js/main.js"]
    seen, pre = set(), []
    for m in ["js/main.js"] + mods:
        if m not in seen: seen.add(m); pre.append(f'<link rel="modulepreload" href="{m}?v={VER}">')
    extra = ""
    if page == "home": extra += '<link rel="preload" as="image" href="images/slide1.webp" fetchpriority="high">'
    if uses_events: extra += f'<link rel="preconnect" href="https://docs.google.com"><link rel="preload" as="fetch" href="{C["eventsCsv"]}" crossorigin>'
    main_cls = "" if page == "home" else ' class="wrap"'
    html = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website"><meta property="og:image" content="images/logo/logo-og.png">
<meta name="theme-color" content="{"#4A0B0C"}">
<link rel="icon" href="favicon.png" type="image/png">
<link rel="stylesheet" href="css/site.css?v={VER}">
{extra}{"".join(pre)}
</head><body data-page="{page}" data-theme="{theme}">
<a class="skip" href="#main">Skip to content</a>
{header(fname)}{menu(fname)}
{hero() if page == "home" else ""}<main id="main"{main_cls}></main>
{footer()}
<noscript><p style="padding:20px">Please turn on JavaScript to see this page.</p></noscript>
<script type="module" src="js/main.js?v={VER}"></script>
</body></html>
'''
    open(fname, "w").write(html)

# ---- 4. service worker ----
s = open("sw.js").read(); open("sw.js", "w").write(re.sub(r'const VER = "[^"]*";', f'const VER = "{VER}";', s))
print("built", VER, "·", len(PAGES), "pages · css", os.path.getsize("css/site.css") // 1024, "KB")
