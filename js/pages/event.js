import C from "../config.js";
import { h, safeUrl } from "../lib/dom.js";
import { withEvents, pretty, todayISO, imgSrc } from "../lib/events.js";
import { contactForm } from "../lib/forms.js";
import { head } from "./_head.js";

export default async function event(main) {
  const id = new URLSearchParams(location.search).get("e");
  await withEvents(main, evs => {
    const e = evs.find(x => x.id === id);
    if (!e) { main.append(head("Event", "We couldn't find that event."), h("a", { class: "btn", href: "calendar.html" }, "See upcoming events")); return; }
    document.title = e.title + " · " + C.name;
    const info = h("div", null, h("p", { class: "eyebrow" }, "Register"), h("h1", null, e.title),
      h("dl", { class: "facts" }, h("dt", null, "When"), h("dd", null, pretty(e.date) + (e.time ? ", " + e.time : "")), e.venue && [h("dt", null, "Where"), h("dd", null, e.venue)], e.price && [h("dt", null, "Price"), h("dd", null, e.price)]),
      e.description && h("p", { class: "lead" }, e.description), e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title }));
    const box = h("div");
    if (e.date < todayISO()) box.append(h("p", { class: "note" }, "Registration for this event has closed. ", h("a", { href: "calendar.html" }, "See upcoming events"), "."));
    else box.append(contactForm({ cfg: C.registerForm, button: "Reserve my spot", extraValues: { event: `${e.title} (${e.date})` },
      success(bot) {
        box.replaceChildren(bot ? "" : h("div", { class: "note", role: "status" }, h("h3", { style: "margin-bottom:.5rem" }, "You're on the list."), "We've received your registration. We'll confirm your spot soon."),
          !bot && safeUrl(e.link) && h("p", null, h("a", { class: "btn", href: safeUrl(e.link), rel: "noopener" }, "Payment and details")));
      } }));
    main.append(h("div", { class: "event-grid" }, info, box));
  });
}
