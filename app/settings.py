"""Editable site text (About, Contact, links...). Defaults here; admin overrides are stored in the DB."""
from flask import g, session

from .db import get_db

DEFAULTS = {
    "name": "code: iconic",
    "tagline": "The energy. The dress. The life. Finally, a space that's yours.",
    "instagram": "https://instagram.com/code.iconic",
    "email": "",
    "phone": "",
    "about_who": "Tell your story here: who you are, why you started, and what you stand for.",
    "about_what": "Brunches, themed nights out, creative workshops, picnics and trips.",
    "membership_text": "Join our community of women in Chennai. Leave your details and we'll be in touch.",
    "contact_note": "We'd love to hear from you.",
}
# (key, label, multiline)
FIELDS = [
    ("name", "Website name", False), ("tagline", "Tagline", False),
    ("instagram", "Instagram link (https://...)", False), ("email", "Contact email", False),
    ("phone", "Contact phone (optional)", False), ("about_who", "About Us: who we are", True),
    ("about_what", "About Us: what we do", True), ("membership_text", "Membership page text", True),
    ("contact_note", "Contact page note", True),
]
MENU = [("Home", "public.home"), ("Calendar", "public.calendar"), ("Past Events", "public.past_events"),
        ("Membership", "public.membership"), ("About Us", "public.about"), ("Contact", "public.contact")]


def load():
    if "site" not in g:
        g.site = dict(DEFAULTS)
        g.site.update({r["key"]: r["value"] for r in get_db().execute("SELECT key, value FROM settings") if r["key"] in DEFAULTS})
    return g.site


def init_app(app):
    app.context_processor(lambda: dict(site=load(), menu=MENU, is_admin=bool(session.get("admin"))))
