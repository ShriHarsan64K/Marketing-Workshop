# code: iconic

Events website for the code: iconic women's community in Chennai. Python 3 + Flask + SQLite.

- **Public:** home slideshow, upcoming events, calendar, past events with photo galleries, membership sign-up, event registration, about, contact.
- **Admin (`/admin`):** add/edit/hide/delete events, upload posters and gallery photos, manage the slideshow, edit site text, confirm or reject registrations, download CSVs.

## Run locally

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then edit ADMIN_PASSWORD
set -a; source .env; set +a
flask --app wsgi run
```

Open http://127.0.0.1:5000 and log in at `/admin`. Windows PowerShell: set `$env:ADMIN_PASSWORD="..."` and `$env:INSECURE_COOKIES="1"` before `flask --app wsgi run`.

Admin login stays disabled until `ADMIN_PASSWORD` is set (there is no default password).

## Tests

```bash
pip install -r requirements-dev.txt && pytest
```

## Layout

```
app/
  __init__.py        app factory (create_app), error pages
  config.py          settings from environment variables
  db.py, schema.sql  SQLite connection + tables (created once at startup)
  settings.py        editable site text and defaults
  media.py           image upload: verify, auto-rotate, resize, delete
  util.py            validation helpers, timezone-aware "today"
  blueprints/        public.py (visitors), admin.py (organiser)
  templates/, static/
wsgi.py              gunicorn / PythonAnywhere entry point
tests/               pytest suite
```

Everything that must persist (database, uploads, secret key) lives in `DATA_DIR` (default `./instance`, git-ignored).

## Deploy

See [DEPLOY.md](DEPLOY.md) (free hosting on PythonAnywhere).
