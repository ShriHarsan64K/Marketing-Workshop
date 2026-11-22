# Free hosting: PythonAnywhere

Why this one: free forever tier, a persistent disk (SQLite database and uploaded photos survive), built-in HTTPS, runs Flask with no changes. Render/Railway-style free tiers wipe the disk on redeploy, so uploads and registrations would be lost.

Free-tier limits: URL is `yourname.pythonanywhere.com` (custom domain needs the paid plan, about $5/month); click "Run until 3 months from today" on the Web tab every 3 months to keep it alive.

## One-time setup

1. Create a free account at pythonanywhere.com.
2. **Consoles > Bash**:
   ```bash
   git clone https://github.com/<you>/<repo>.git iconic && cd iconic
   mkvirtualenv iconic --python=python3.10
   pip install -r requirements.txt
   ```
3. **Web > Add a new web app > Manual configuration > Python 3.10.**
4. On the Web tab set:
   - **Source code:** `/home/<you>/iconic`
   - **Virtualenv:** `/home/<you>/.virtualenvs/iconic`
   - **Force HTTPS:** on
5. Open the **WSGI configuration file** link, delete its contents and paste:
   ```python
   import os, sys
   sys.path.insert(0, "/home/<you>/iconic")
   os.environ["ADMIN_PASSWORD"] = "choose-a-long-password"
   os.environ["DATA_DIR"] = "/home/<you>/iconic-data"   # outside the git folder
   from wsgi import app as application
   ```
6. Click **Reload**. Visit `https://<you>.pythonanywhere.com`, log in at `/admin`, then use "Edit website text" to fill in About, email and phone.

## Updating the site later

```bash
cd ~/iconic && git pull && pip install -r requirements.txt
```
Then click **Reload** on the Web tab. Data in `DATA_DIR` is untouched.

## Backups

Download `iconic-data/site.db` and `iconic-data/uploads/` from the Files tab now and then (or use the CSV exports in admin).
