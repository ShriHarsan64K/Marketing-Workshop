"""Image uploads: verified with Pillow, auto-rotated, resized and re-encoded as JPEG (phone photos are huge)."""
import secrets
from pathlib import Path

from flask import current_app, url_for
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_SIDE = 1800


def save_image(file_storage):
    """Return the stored filename, or None if nothing was chosen. Raises ValueError for non-images."""
    if not file_storage or not file_storage.filename:
        return None
    try:
        img = ImageOps.exif_transpose(Image.open(file_storage.stream))
        img.thumbnail((MAX_SIDE, MAX_SIDE))
        if img.mode in ("RGBA", "LA", "P"):
            rgba = img.convert("RGBA")
            img = Image.new("RGB", rgba.size, "white")
            img.paste(rgba, mask=rgba.split()[-1])
        else:
            img = img.convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise ValueError("That file isn't a valid image (use jpg, png or webp).")
    name = secrets.token_hex(8) + ".jpg"
    img.save(current_app.config["UPLOAD_DIR"] / name, "JPEG", quality=85, optimize=True)
    return name


def delete_image(name):
    """Remove an uploaded file. Bundled images (images/...) are never touched."""
    if name and not name.startswith("images/"):
        (Path(current_app.config["UPLOAD_DIR"]) / Path(name).name).unlink(missing_ok=True)


def media_url(name):
    if name.startswith("images/"):
        return url_for("static", filename=name)
    return url_for("public.uploads", name=name)


def init_app(app):
    app.add_template_filter(media_url, "media")
