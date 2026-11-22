# code:iconic

Static events website for the code:iconic community in Chennai. No server or database.

- **Events:** Google Sheet (published as CSV). **Sign-ups:** two Google Forms. **Hosting:** GitHub Pages.
- **Home:** full-photo hero, what we do (crochet, journaling, picnics, brunch, vision boards, Galentine's, book club), upcoming events, a small tile section modelled on leborrel.nl (next-event countdown, cartridge and ticket refresh themselves from the sheet every 5 minutes), and the membership band. **About** is a biography page modelled on sophiawebster.com.
- **Look:** wine `#4A0B0C` and pink `#E6BDC5` only (tints are mixed from them): a wine page with pink ink and soft pink glows, flipped to pink on the founder page and footer. Logo: the lips poster (`images/logo/`). Icons: IBM Carbon (`js/lib/icons.js`). Type: New York for text, Classique (Didot/Baskerville-style serif) for headlines, system UI font for labels. Everything is in rem on a 90% root. Note: GitHub Pages ignores files that start with an underscore, so never name a module `_something.js`; a `.nojekyll` file is also in the repo root.

## Structure
```
index.html calendar.html past.html event.html membership.html about.html contact.html 404.html   page shells
css/   tokens → base → layout → components → home / about   (cascade layers, standard 4/8px + type scale)
js/
  config.js            everything you edit: text, links, sheet + form IDs, photos, founder story
  main.js              picks header variant, footer and the page module
  lib/                 dom.js (helpers, icons) · events.js (sheet, dates, calendar file) · forms.js (Google Forms)
  components/          header.js · footer.js · tiles.js (bento cards)
  pages/               one module per page
images/  archive/ (event photos) · logo/ · events/ (posters)
```

## Edit content
| What | Where |
|---|---|
| Events (add / hide / edit) | Google Sheet "Events" tab, live in ~5 minutes |
| Registrations and sign-ups | The two Google Forms' response sheets |
| Text, links, photos, founder story | `js/config.js` |
| Event posters | add file to `images/events/`, put filename in the sheet |

Sheet columns: `title, date, time, venue, price, description, image, link, published, photos` (`published` = `TRUE` to show).

## Run locally
```bash
python3 -m http.server 8000     # ES modules need http://, not file://
```
