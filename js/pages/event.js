import C from "../config.js?v=20261122180336";
import { h, safeUrl } from "../lib/dom.js?v=20261122180336";
import { pretty, todayISO, imgSrc } from "../lib/events.js?v=20261122180336";
import { liveEvents } from "../lib/events-live.js?v=20261122180336";
import { contactForm } from "../lib/forms.js?v=20261122180336";
import { head } from "../components/pagehead.js?v=20261122180336";

export default async function event(main) {
  const id = new URLSearchParams(location.search).get("e");
  const box = h("div"); main.append(box);
  await liveEvents(box, evs => {
    const e = evs.find(x => x.id === id);
    if (!e) return [head("We couldn't find that event."), h("a", { class: "btn", href: "calendar.html" }, "See upcoming events")];
    document.title = e.title + " · " + C.name;
    const form = h("div");
    if (e.date < todayISO()) form.append(h("p", { class: "note" }, "Registration for this event has closed. ", h("a", { href: "calendar.html" }, "See upcoming events"), "."));
    else form.append(contactForm({ cfg: C.registerForm, button: "Reserve my spot", extraValues: { event: `${e.title} (${e.date})` },
      success(bot) {
        form.replaceChildren(bot ? "" : h("div", { class: "note", role: "status" }, h("h3", null, "You're on the list."), h("p", null, "We've received your registration and will confirm your spot soon.")),
          !bot && safeUrl(e.link) && h("p", null, h("a", { class: "btn", href: safeUrl(e.link), rel: "noopener" }, "Payment and details")));
      } }));
    return h("div", { class: "event-grid" }, h("div", null, h("h1", null, e.title),
      h("dl", { class: "facts" }, h("dt", null, "When"), h("dd", null, pretty(e.date) + (e.time ? ", " + e.time : "")), e.venue && [h("dt", null, "Where"), h("dd", null, e.venue)], e.price && [h("dt", null, "Price"), h("dd", null, e.price)]),
      e.description && h("p", { class: "lead" }, e.description), e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title })), form);
  });
}
