#!/usr/bin/env python3
"""Cache-busting for GitHub Pages (which caches files for 10 minutes).
Run before every push:  python3 tools/stamp.py
It appends ?v=<timestamp> to every local JS import, script and stylesheet so browsers fetch a matching set of files."""
import glob, re, time
VER = time.strftime("%Y%m%d%H%M%S")
def stamp_js(s):
    s = re.sub(r'(from\s+["\'])(\.{1,2}/[^"\'?]+?\.js)(\?v=\d+)?(["\'])', rf'\1\2?v={VER}\4', s)
    return re.sub(r'(import\(`[^`]*?\.js)(\?v=\d+)?(`)', rf'\1?v={VER}\3', s)
def stamp_html(s):
    return re.sub(r'((?:src|href)="(?:js|css)/[^"?]+?\.(?:js|css))(\?v=\d+)?(")', rf'\1?v={VER}\3', s)
for f in glob.glob("js/**/*.js", recursive=True):
    s = open(f).read(); n = stamp_js(s)
    if n != s: open(f, "w").write(n)
for f in glob.glob("*.html"):
    s = open(f).read(); n = stamp_html(s)
    if n != s: open(f, "w").write(n)
print("stamped", VER)
