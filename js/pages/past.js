import C from "../config.js?v=20261122175707";
import { h, arch } from "../lib/dom.js?v=20261122175707";
import { past, pretty, imgSrc } from "../lib/events.js?v=20261122175707";
import { liveEvents } from "../lib/events-live.js?v=20261122175707";
import { head } from "../components/pagehead.js?v=20261122175707";

export default async function pastEvents(main) {
  const list = h("div");
  main.append(head(["The ", h("em", null, "archive")], "Photos from past events."),
    h("div", { class: "moments gap-after" }, C.archive.map(([f, t]) => h("figure", null, h("img", { src: arch(f), alt: t, loading: "lazy", width: 800, height: 1000 })))), list);
  await liveEvents(list, evs => past(evs).map(e => h("article", { class: "past-event" }, h("h2", null, e.title), h("p", { class: "meta" }, pretty(e.date) + (e.venue ? " · " + e.venue : "")),
    e.description && h("p", { class: "lead" }, e.description),
    e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title, loading: "lazy" }),
    e.photoList.length > 0 && h("div", { class: "moments" }, e.photoList.map(p => h("figure", null, h("img", { src: imgSrc(p), alt: e.title + " photo", loading: "lazy" })))))));
}
