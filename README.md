# code: iconic

Static events website (plain HTML/CSS/JS) for the code: iconic community in Chennai. No server or database:

- **Events** come from a Google Sheet (published as CSV).
- **Event registrations** and **membership sign-ups** go into Google Forms (responses land in Google Sheets).
- **Hosting:** GitHub Pages (free, HTTPS).

## Edit content
| What | Where |
|---|---|
| Add/edit/hide events | Google Sheet "Events" tab (live in about 5 minutes) |
| See / confirm registrations | Registration Form > Responses > Sheet (add a Status column) |
| Site text, Instagram, email, slideshow captions | `js/config.js` |
| Event posters / gallery photos | add the file to `images/events/`, put its filename in the sheet |
| Slideshow photos | `images/slide1.jpg` ... (list in `js/config.js`) |

## Events sheet columns (row 1, exact names)
`title, date, time, venue, price, description, image, link, published, photos`

- `date`: `2026-12-05` (or `05/12/2026`). Format the column as Plain text.
- `published`: `TRUE` to show, anything else hides it.
- `image`: filename in `images/events/` or a full https link. `photos`: comma-separated filenames for the past-events gallery.
- `link`: payment / details link, shown after someone registers.

## Run locally
```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## Files
`index.html calendar.html past.html event.html membership.html about.html contact.html` share `css/style.css` and `js/app.js` (header, footer, rendering). Settings: `js/config.js`.

## Google setup (already done)
- Events sheet "code iconic - Events": File > Share > Publish to web > CSV (URL in `js/config.js`).
- Two Forms (registration, membership), each with responses linked to a Sheet. The site posts to each Form's `formResponse` URL using the `entry.NNN` ids in `js/config.js`. If you rebuild a Form, re-read its entry ids (view-source of the live form, search `FB_PUBLIC_LOAD_DATA_`).
- Confirm/reject: add a "Status" column in the responses sheet and update it by hand.
