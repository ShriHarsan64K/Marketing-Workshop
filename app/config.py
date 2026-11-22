import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class Config:
    # Everything that must survive redeploys (database, uploads, secret key) lives in DATA_DIR.
    DATA_DIR = os.environ.get("DATA_DIR", str(ROOT / "instance"))
    SECRET_KEY = os.environ.get("SECRET_KEY")
    # Admin login is disabled until this is set (fails closed; there is no default password).
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
    MAX_CONTENT_LENGTH = 40 * 1024 * 1024  # whole request; photos are resized after upload
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("INSECURE_COOKIES") != "1"  # set INSECURE_COOKIES=1 for http://localhost
    TIMEZONE = "Asia/Kolkata"  # events are "today" in Chennai, whatever the server's clock says
