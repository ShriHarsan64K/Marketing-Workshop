import { h } from "../lib/dom.js?v=20261122173409";
import { head } from "../components/pagehead.js?v=20261122173409";
export default function notfound(main) { main.classList.add("narrow"); main.append(head("404", "That page isn't here."), h("a", { class: "btn", href: "index.html" }, "Back home")); }
