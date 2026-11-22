"""SQLite access. Schema is created once at startup; first-run slides are seeded once, never again."""
import sqlite3
from pathlib import Path

from flask import current_app, g

FIRST_SLIDES = [
    ("images/slide1.jpg", "Good company, great afternoons", "Workshops on a sunny terrace"),
    ("images/slide2.jpg", "Women who show up for each other", "Meet your people in Chennai"),
    ("images/slide3.jpg", "Make something that's yours", "Creative, cosy, unhurried"),
    ("images/slide4.jpg", "Laughter is part of the plan", "Every gathering, every week"),
    ("images/slide5.jpg", "Cut. Paste. Dream.", "Mood boards, journals and more"),
    ("images/slide6.jpg", "Proud of what we made", "Come create with us"),
]


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def _close(_exc=None):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def init_db(app):
    conn = sqlite3.connect(app.config["DATABASE"])
    conn.executescript((Path(__file__).parent / "schema.sql").read_text())
    if not conn.execute("SELECT 1 FROM settings WHERE key='seeded'").fetchone():
        conn.executemany(
            "INSERT INTO slides (image, heading, caption, sort) VALUES (?,?,?,?)",
            [(i, h, c, n) for n, (i, h, c) in enumerate(FIRST_SLIDES, 1)],
        )
        conn.execute("INSERT INTO settings (key, value) VALUES ('seeded', '1')")
    conn.commit()
    conn.close()


def init_app(app):
    app.teardown_appcontext(_close)
    init_db(app)
