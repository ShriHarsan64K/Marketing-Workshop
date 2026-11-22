import re
from datetime import date, datetime
from zoneinfo import ZoneInfo

from flask import current_app

PHONE = re.compile(r"^\+?[0-9][0-9 \-]{8,17}[0-9]$")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def today():
    """Today's date in the site's timezone (not the server's)."""
    return datetime.now(ZoneInfo(current_app.config["TIMEZONE"])).date()


def clean_contact(form):
    """Return ((name, email, phone), error). Used by both public forms."""
    name = form.get("name", "").strip()[:100]
    email = form.get("email", "").strip().lower()[:200]
    phone = form.get("phone", "").strip()[:20]
    if len(name) < 2 or not EMAIL.match(email) or not PHONE.match(phone):
        return None, "Please enter your name, a valid email and a phone number."
    return (name, email, phone), ""


def safe_url(value):
    """Only http(s) links are allowed (blocks javascript: URLs)."""
    value = value.strip()[:300]
    return value if value.lower().startswith(("http://", "https://")) else ""


def pretty(iso):
    return date.fromisoformat(iso).strftime("%A, %d %B %Y")


def day_month(iso):
    d = date.fromisoformat(iso)
    return d.strftime("%d"), d.strftime("%b").upper()
