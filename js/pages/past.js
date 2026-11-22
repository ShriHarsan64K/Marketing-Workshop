import C from "../config.js";
import { h, arch } from "../lib/dom.js";
import { withEvents, past, pretty, imgSrc } from "../lib/events.js";
import { head } from "./_head.js";

export default async function pastEvents(main) {
  main.append(head("Archive", "Past events", "Photos and memories from afternoons gone by."),
    h("div", { class: "moments", style: "margin-bottom:64px" }, C.archive.map(([f, t]) => h("figure", null, h("img", { src: arch(f), alt: t, loading: "lazy", width: 800, height: 1000 }), h("figcaption", null, t)))));
  await withEvents(main, evs => {
    for (const e of past(evs)) main.append(h("article", { style: "margin-bottom:64px" }, h("p", { class: "eyebrow" }, pretty(e.date) + (e.venue ? " · " + e.venue : "")), h("h2", null, e.title),
      e.description && h("p", { class: "lead", style: "margin-top:12px" }, e.description),
      e.image && h("img", { class: "event-img", src: imgSrc(e.image), alt: e.title, loading: "lazy" }),
      e.photoList.length > 0 && h("div", { class: "moments", style: "margin-top:24px" }, e.photoList.map(p => h("figure", null, h("img", { src: imgSrc(p), alt: e.title + " photo", loading: "lazy" }))))));
  });
}
