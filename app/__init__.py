"""code: iconic — application factory."""
import secrets
from pathlib import Path

from flask import Flask, render_template
from flask_wtf.csrf import CSRFProtect

from . import db, media, settings
from .blueprints import admin, public

csrf = CSRFProtect()


def _secret_key(data_dir: Path) -> str:
    """Use SECRET_KEY if set, else create one once and keep it, so logins survive restarts."""
    f = data_dir / "secret_key"
    if not f.exists():
        f.write_text(secrets.token_hex(32))
        f.chmod(0o600)
    return f.read_text().strip()


def create_app(test_config=None):
    from .config import Config

    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    data_dir = Path(app.config["DATA_DIR"])
    (data_dir / "uploads").mkdir(parents=True, exist_ok=True)
    app.config["UPLOAD_DIR"] = data_dir / "uploads"
    app.config.setdefault("DATABASE", str(data_dir / "site.db"))
    if not app.config.get("SECRET_KEY"):
        app.config["SECRET_KEY"] = _secret_key(data_dir)

    csrf.init_app(app)
    db.init_app(app)
    media.init_app(app)
    settings.init_app(app)
    app.register_blueprint(public.bp)
    app.register_blueprint(admin.bp)

    @app.errorhandler(404)
    def not_found(_):
        return render_template("error.html", code=404, msg="We couldn't find that page."), 404

    @app.errorhandler(413)
    def too_big(_):
        return render_template("error.html", code=413, msg="That upload is too large. Please use smaller photos."), 413

    @app.errorhandler(429)
    def too_many(_):
        return render_template("error.html", code=429, msg="Too many attempts. Please wait a few minutes."), 429

    return app
