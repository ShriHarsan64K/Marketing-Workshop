import io
from datetime import timedelta

import pytest
from PIL import Image

from app import create_app
from datetime import datetime
from zoneinfo import ZoneInfo


def today():
    return datetime.now(ZoneInfo("Asia/Kolkata")).date()


@pytest.fixture
def app(tmp_path):
    from app.blueprints import admin as admin_bp
    admin_bp._fails.clear()
    return create_app({"TESTING": True, "DATA_DIR": str(tmp_path), "ADMIN_PASSWORD": "pw-123",
                       "WTF_CSRF_ENABLED": False, "SESSION_COOKIE_SECURE": False})


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin(client):
    client.post("/admin/login", data={"password": "pw-123"})
    return client


def png(color="red", size=(3000, 2000)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "PNG")
    buf.seek(0)
    return buf


def new_event(c, days=7, **kw):
    d = (today() + timedelta(days=days)).isoformat()
    data = {"title": "Brunch", "event_date": d, "venue": "Cafe", "published": "on", **kw}
    return c.post("/admin/event/new", data=data, content_type="multipart/form-data", follow_redirects=True)


def test_public_pages_render(client):
    for url in ["/", "/calendar", "/past-events", "/membership", "/about", "/contact"]:
        assert client.get(url).status_code == 200, url
    assert client.get("/nope").status_code == 404


def test_seed_slides_only_once(app, client):
    from app import db as dbm
    assert b"Good company" in client.get("/").data
    with app.app_context():
        c = dbm.sqlite3.connect(app.config["DATABASE"])
        c.execute("DELETE FROM slides"); c.commit(); c.close()
    dbm.init_db(app)  # simulates a restart
    assert b"Good company" not in client.get("/").data


def test_admin_requires_login_and_fails_closed(app, client):
    assert client.get("/admin/", follow_redirects=False).status_code == 302
    assert client.post("/admin/login", data={"password": "wrong"}).status_code == 401
    app.config["ADMIN_PASSWORD"] = None
    assert client.post("/admin/login", data={"password": ""}).status_code == 401


def test_login_rate_limited(client):
    for _ in range(5):
        client.post("/admin/login", data={"password": "bad"})
    assert client.post("/admin/login", data={"password": "pw-123"}).status_code == 429


def test_event_lifecycle_and_registration(admin, client):
    assert b"Brunch" in new_event(admin).data
    assert b"Register now" in client.get("/").data
    r = client.post("/events/1/register", data={"name": "Asha", "email": "A@x.com", "phone": "+91 98765 43210"})
    assert b"received your registration" in r.data
    again = client.post("/events/1/register", data={"name": "Asha", "email": "a@x.com", "phone": "+91 98765 43210"})
    assert b"already registered" in again.data
    bad = client.post("/events/1/register", data={"name": "A", "email": "nope", "phone": "1"})
    assert b"valid email" in bad.data
    assert b"Asha" in admin.get("/admin/").data
    csv = admin.get("/admin/export/registrations.csv")
    assert csv.mimetype == "text/csv" and b"a@x.com" in csv.data


def test_past_event_is_closed_and_listed_as_past(admin, client):
    new_event(admin, days=-3, title="Old one")
    assert b"Old one" not in client.get("/").data
    assert b"Old one" in client.get("/past-events").data
    assert b"has closed" in client.get("/events/1/register").data


def test_hidden_event_is_404(admin, client):
    new_event(admin, published="")
    assert client.get("/events/1/register").status_code == 404


def test_event_today_still_open(admin, client):
    new_event(admin, days=0)
    assert b"Register now" in client.get("/").data


def test_javascript_links_stripped(admin, app):
    new_event(admin, link="javascript:alert(1)")
    import sqlite3
    assert sqlite3.connect(app.config["DATABASE"]).execute("SELECT link FROM events").fetchone()[0] == ""


def test_upload_is_resized_and_deleted_with_event(admin, app):
    new_event(admin, image=(png(), "p.png"))
    files = list(app.config["UPLOAD_DIR"].iterdir())
    assert len(files) == 1 and files[0].suffix == ".jpg"
    assert max(Image.open(files[0]).size) <= 1800
    admin.post("/admin/event/1/delete")
    assert list(app.config["UPLOAD_DIR"].iterdir()) == []


def test_fake_image_rejected(admin, app):
    r = new_event(admin, image=(io.BytesIO(b"<?php evil ?>"), "x.png"))
    assert b"valid image" in r.data and list(app.config["UPLOAD_DIR"].iterdir()) == []


def test_membership_signup_and_honeypot(client, app):
    ok = client.post("/membership", data={"name": "Mina", "email": "m@x.com", "phone": "98765 43210"})
    assert b"Thank you" in ok.data
    assert b"already on the list" in client.post("/membership", data={"name": "Mina", "email": "m@x.com", "phone": "98765 43210"}).data
    client.post("/membership", data={"name": "Bot", "email": "b@x.com", "phone": "98765 43210", "website": "spam"})
    import sqlite3
    assert sqlite3.connect(app.config["DATABASE"]).execute("SELECT COUNT(*) FROM signups").fetchone()[0] == 1


def test_csrf_enforced_when_enabled(tmp_path):
    app = create_app({"TESTING": True, "DATA_DIR": str(tmp_path), "ADMIN_PASSWORD": "x", "SESSION_COOKIE_SECURE": False})
    assert app.test_client().post("/membership", data={"name": "a"}).status_code == 400


def test_site_text_editable(admin, client):
    admin.post("/admin/content", data={"name": "Iconic!", "tagline": "t", "instagram": "javascript:x", "email": "hi@x.com"})
    html = client.get("/contact").data
    assert b"hi@x.com" in html and b"javascript" not in html
    assert b"Iconic!" in client.get("/").data
