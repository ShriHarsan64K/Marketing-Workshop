/* Founder page: same page head as Archive, then the story beside a photo. */
import C from "../config.js?v=20261125112103";
import { h } from "../lib/dom.js?v=20261125112103";
import { head } from "../components/pagehead.js?v=20261125112103";

export default function about(main) {
  const S = C.story, img = (src, alt, w, hh) => h("img", { src, alt, loading: "lazy", width: w, height: hh });
  main.append(head(["Jaisu's ", h("em", null, "story")], S.kicker + " of code:iconic"),
    h("div", { class: "bio" },
      h("figure", { class: "bio-photo" }, img(S.banner, "", 1400, 1050)),
      h("div", { class: "bio-text" }, S.paragraphs.map((p, i) => h("p", { class: i ? null : "first" }, p)))),
    h("blockquote", { class: "bio-quote" }, S.quote),
    h("div", { class: "bio-pair" }, S.pair.map(([src, alt]) => img(src, alt, 800, 1000))),
    h("div", { class: "bio-cta" }, h("a", { class: "btn ghost", href: "calendar.html" }, "See events")));
}
