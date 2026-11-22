import { h } from "../lib/dom.js?v=20261122174510";
import { head } from "../components/pagehead.js?v=20261122174510";
export default function notfound(main) { main.classList.add("narrow"); main.append(head("That page isn't here."), h("a", { class: "btn", href: "index.html" }, "Back home")); }
