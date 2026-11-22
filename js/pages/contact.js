import C from "../config.js";
import { h, safeUrl } from "../lib/dom.js";
import { head } from "./_head.js";

export default function contact(main) {
  main.classList.add("narrow");
  main.append(head("Contact", "Say hello", C.contactNote),
    h("div", { class: "links" }, C.email && h("a", { href: "mailto:" + C.email }, C.email), C.phone && h("span", null, C.phone),
      h("a", { href: safeUrl(C.instagram), rel: "noopener" }, C.instagramHandle)));
}
