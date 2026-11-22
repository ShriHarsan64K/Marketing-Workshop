"""Organiser dashboard: events, slideshow, site text, registrations, sign-ups (+ CSV export)."""
import csv
import io
import secrets
import time
from datetime import date

from flask import Blueprint, Response, abort, current_app, flash, redirect, render_template, request, session, url_for

from ..db import get_db
from ..media import delete_image, save_image
from ..settings import DEFAULTS, FIELDS
from ..util import safe_url

bp = Blueprint("admin", __name__, url_prefix="/admin")

# ponytail: in-memory per-process counter; use a shared store (Redis/DB) if you ever run many workers.
_fails = {}
MAX_FAILS, WINDOW = 5, 600


@bp.before_request
def require_login():
    if request.endpoint != "admin.login" and not session.get("admin"):
        return redirect(url_for("admin.login"))


def _back():
    return redirect(url_for("admin.dashboard"))


@bp.route("/login", methods=["GET", "POST"])
def login():
    if session.get("admin"):
        return _back()
    err = ""
    if request.method == "POST":
        ip, now = request.remote_addr, time.time()
        recent = [t for t in _fails.get(ip, []) if now - t < WINDOW]
        _fails[ip] = recent
        if len(recent) >= MAX_FAILS:
            abort(429)
        pw = current_app.config.get("ADMIN_PASSWORD")
        if pw and secrets.compare_digest(request.form.get("password", "").encode(), pw.encode()):
            session.clear()
            session["admin"] = True
            _fails.pop(ip, None)
            return _back()
        recent.append(now)
        err = "Wrong password." if pw else "Admin login is not set up yet: set the ADMIN_PASSWORD environment variable."
    return render_template("admin/login.html", err=err), (401 if err else 200)


@bp.post("/logout")
def logout():
    session.clear()
    return redirect(url_for("public.home"))


@bp.route("/")
def dashboard():
    db = get_db()
    return render_template(
        "admin/dashboard.html",
        evs=db.execute("SELECT e.*, (SELECT COUNT(*) FROM registrations WHERE event_id=e.id) AS regs FROM events e ORDER BY event_date DESC").fetchall(),
        rows=db.execute("SELECT * FROM signups ORDER BY id DESC").fetchall(),
        slides=db.execute("SELECT * FROM slides ORDER BY sort, id").fetchall(),
        regs=db.execute("SELECT r.*, e.title, e.event_date FROM registrations r JOIN events e ON e.id=r.event_id ORDER BY e.event_date DESC, r.id").fetchall(),
    )


# ---------- events ----------
@bp.route("/event/new", methods=["GET", "POST"])
@bp.route("/event/<int:eid>/edit", methods=["GET", "POST"])
def event_form(eid=None):
    db = get_db()
    ev = db.execute("SELECT * FROM events WHERE id=?", (eid,)).fetchone() if eid else None
    if eid and not ev:
        abort(404)
    photos = db.execute("SELECT * FROM event_photos WHERE event_id=?", (eid,)).fetchall() if eid else []
    err = ""
    if request.method == "POST":
        f = request.form
        title, d = f.get("title", "").strip()[:150], f.get("event_date", "")
        try:
            date.fromisoformat(d)
        except ValueError:
            d = ""
        if not title or not d:
            err = "Title and a valid date are required."
        else:
            try:
                poster = save_image(request.files.get("image"))
                gallery = [n for n in (save_image(p) for p in request.files.getlist("photos")) if n]
            except ValueError as e:
                return render_template("admin/event_form.html", ev=ev, err=str(e), photos=photos)
            if poster and ev:
                delete_image(ev["image"])
            vals = (title, d, f.get("event_time", "").strip()[:60], f.get("venue", "").strip()[:200],
                    f.get("description", "").strip()[:1500], f.get("price", "").strip()[:40], safe_url(f.get("link", "")),
                    poster or (ev["image"] if ev else None), 1 if f.get("published") else 0)
            with db:
                if ev:
                    db.execute("UPDATE events SET title=?,event_date=?,event_time=?,venue=?,description=?,price=?,link=?,image=?,published=? WHERE id=?", vals + (eid,))
                else:
                    eid = db.execute("INSERT INTO events (title,event_date,event_time,venue,description,price,link,image,published) VALUES (?,?,?,?,?,?,?,?,?)", vals).lastrowid
                db.executemany("INSERT INTO event_photos (event_id, image) VALUES (?,?)", [(eid, n) for n in gallery])
            flash("Event saved.")
            return _back()
    return render_template("admin/event_form.html", ev=ev, err=err, photos=photos)


@bp.post("/event/<int:eid>/delete")
def event_delete(eid):
    db = get_db()
    files = [r["image"] for r in db.execute("SELECT image FROM event_photos WHERE event_id=?", (eid,))]
    ev = db.execute("SELECT image FROM events WHERE id=?", (eid,)).fetchone()
    if ev:
        files.append(ev["image"])
    with db:
        db.execute("DELETE FROM events WHERE id=?", (eid,))  # photos + registrations cascade
    for n in files:
        delete_image(n)
    flash("Event deleted.")
    return _back()


@bp.post("/event/<int:eid>/toggle")
def event_toggle(eid):
    with get_db() as db:
        db.execute("UPDATE events SET published=1-published WHERE id=?", (eid,))
    return _back()


@bp.post("/photo/<int:pid>/delete")
def photo_delete(pid):
    db = get_db()
    r = db.execute("SELECT * FROM event_photos WHERE id=?", (pid,)).fetchone()
    if not r:
        return _back()
    with db:
        db.execute("DELETE FROM event_photos WHERE id=?", (pid,))
    delete_image(r["image"])
    return redirect(url_for("admin.event_form", eid=r["event_id"]))


# ---------- site text ----------
@bp.route("/content", methods=["GET", "POST"])
def content():
    db = get_db()
    cur = dict(DEFAULTS)
    cur.update({r["key"]: r["value"] for r in db.execute("SELECT key, value FROM settings") if r["key"] in DEFAULTS})
    if request.method == "POST":
        with db:
            for key, _, _ in FIELDS:
                v = request.form.get(key, "").strip()[:2000]
                if key == "instagram" and v:
                    v = safe_url(v) or DEFAULTS["instagram"]
                db.execute("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (key, v))
        flash("Website text saved.")
        return _back()
    return render_template("admin/content_form.html", fields=FIELDS, cur=cur)


# ---------- slideshow ----------
@bp.post("/slide/new")
def slide_new():
    try:
        name = save_image(request.files.get("image"))
    except ValueError as e:
        flash(str(e))
        return _back()
    if name:
        with get_db() as db:
            top = db.execute("SELECT COALESCE(MAX(sort),0) FROM slides").fetchone()[0]
            db.execute("INSERT INTO slides (image,heading,caption,sort) VALUES (?,?,?,?)",
                       (name, request.form.get("heading", "").strip()[:120], request.form.get("caption", "").strip()[:200], top + 1))
    return _back()


@bp.post("/slide/<int:sid>/save")
def slide_save(sid):
    f = request.form
    order = int(f["sort"]) if f.get("sort", "").lstrip("-").isdigit() else 0
    with get_db() as db:
        db.execute("UPDATE slides SET heading=?,caption=?,sort=? WHERE id=?", (f.get("heading", "").strip()[:120], f.get("caption", "").strip()[:200], order, sid))
    return _back()


@bp.post("/slide/<int:sid>/delete")
def slide_delete(sid):
    db = get_db()
    r = db.execute("SELECT image FROM slides WHERE id=?", (sid,)).fetchone()
    with db:
        db.execute("DELETE FROM slides WHERE id=?", (sid,))
    if r:
        delete_image(r["image"])
    return _back()


# ---------- registrations & sign-ups ----------
@bp.post("/reg/<int:rid>/status")
def reg_status(rid):
    st = request.form.get("status")
    if st in ("pending", "confirmed", "rejected"):
        with get_db() as db:
            db.execute("UPDATE registrations SET status=? WHERE id=?", (st, rid))
    return _back()


@bp.post("/reg/<int:rid>/delete")
def reg_delete(rid):
    with get_db() as db:
        db.execute("DELETE FROM registrations WHERE id=?", (rid,))
    return _back()


@bp.post("/signup/<int:rid>/delete")
def signup_delete(rid):
    with get_db() as db:
        db.execute("DELETE FROM signups WHERE id=?", (rid,))
    return _back()


def _csv(filename, header, rows):
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(header)
    for r in rows:
        # prefix cells starting with = + - @ so Excel never runs them as formulas
        w.writerow([("'" + str(v)) if isinstance(v, str) and v[:1] in "=+-@" else v for v in r])
    return Response(out.getvalue(), mimetype="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})


@bp.route("/export/registrations.csv")
def export_regs():
    rows = get_db().execute("SELECT e.title, e.event_date, r.name, r.email, r.phone, r.status, r.created_at FROM registrations r JOIN events e ON e.id=r.event_id ORDER BY e.event_date DESC, r.id")
    return _csv("registrations.csv", ["Event", "Event date", "Name", "Email", "Phone", "Status", "Registered at"], [tuple(r) for r in rows])


@bp.route("/export/signups.csv")
def export_signups():
    rows = get_db().execute("SELECT name, email, phone, message, created_at FROM signups ORDER BY id DESC")
    return _csv("signups.csv", ["Name", "Email", "Phone", "Message", "Signed up at"], [tuple(r) for r in rows])
