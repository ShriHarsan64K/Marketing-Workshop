"""Visitor-facing pages."""
import sqlite3
from datetime import date

from flask import Blueprint, abort, current_app, redirect, render_template, request, send_from_directory, url_for

from ..db import get_db
from ..util import clean_contact, day_month, pretty, today

bp = Blueprint("public", __name__)
bp.add_app_template_filter(pretty, "pretty")
bp.add_app_template_global(day_month, "day_month")


def list_events(upcoming=True):
    op, order = (">=", "ASC") if upcoming else ("<", "DESC")
    return get_db().execute(
        f"SELECT * FROM events WHERE published=1 AND event_date {op} ? ORDER BY event_date {order}",
        (today().isoformat(),),
    ).fetchall()


@bp.route("/")
def home():
    slides = get_db().execute("SELECT * FROM slides ORDER BY sort, id").fetchall()
    return render_template("public/home.html", slides=slides, events=list_events())


@bp.route("/calendar")
def calendar():
    months = {}
    for e in list_events():
        months.setdefault(date.fromisoformat(e["event_date"]).strftime("%B %Y"), []).append(e)
    return render_template("public/calendar.html", months=months)


@bp.route("/past-events")
def past_events():
    photos = {}
    for p in get_db().execute("SELECT * FROM event_photos ORDER BY id"):
        photos.setdefault(p["event_id"], []).append(p["image"])
    return render_template("public/past.html", events=list_events(False), photos=photos)


@bp.route("/membership", methods=["GET", "POST"])
def membership():
    msg = err = ""
    if request.method == "POST":
        if request.form.get("website"):  # honeypot: real people never fill this hidden field
            return redirect(url_for("public.home"))
        contact, err = clean_contact(request.form)
        if contact:
            note = request.form.get("message", "").strip()[:500]
            try:
                with get_db() as db:
                    db.execute("INSERT INTO signups (name, email, phone, message) VALUES (?,?,?,?)", contact + (note,))
                msg = "Thank you! We'll be in touch."
            except sqlite3.IntegrityError:
                err = "That email is already on the list."
    return render_template("public/membership.html", msg=msg, err=err)


@bp.route("/events/<int:eid>/register", methods=["GET", "POST"])
def event_register(eid):
    ev = get_db().execute("SELECT * FROM events WHERE id=? AND published=1", (eid,)).fetchone()
    if not ev:
        abort(404)
    closed = ev["event_date"] < today().isoformat()
    msg = err = ""
    if request.method == "POST" and not closed:
        if request.form.get("website"):
            return redirect(url_for("public.home"))
        contact, err = clean_contact(request.form)
        if contact:
            try:
                with get_db() as db:
                    db.execute("INSERT INTO registrations (event_id, name, email, phone) VALUES (?,?,?,?)", (eid,) + contact)
                msg = "Thank you! We've received your registration. It will be confirmed by the organiser soon."
            except sqlite3.IntegrityError:
                msg = "You're already registered for this event. The organiser will confirm soon."
    return render_template("public/event_register.html", ev=ev, msg=msg, err=err, closed=closed)


@bp.route("/about")
def about():
    return render_template("public/about.html")


@bp.route("/contact")
def contact():
    return render_template("public/contact.html")


@bp.route("/uploads/<path:name>")
def uploads(name):
    return send_from_directory(current_app.config["UPLOAD_DIR"], name, max_age=60 * 60 * 24 * 30)
