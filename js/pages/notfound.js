import { h } from "../lib/dom.js";
import { head } from "./_head.js";
export default function notfound(main) { main.classList.add("narrow"); main.append(head("404", "That page isn't here."), h("a", { class: "btn", href: "index.html" }, "Back home")); }
