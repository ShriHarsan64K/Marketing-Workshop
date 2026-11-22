import { h } from "../lib/dom.js?v=20261122180336";
import { head } from "../components/pagehead.js?v=20261122180336";
export default function notfound(main) { main.classList.add("narrow"); main.append(head(["Not ", h("em", null, "found")]), h("a", { class: "btn", href: "index.html" }, "Back home")); }
