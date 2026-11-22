import { h } from "../lib/dom.js?v=20261122180336";
/* Plain page title with one line under it. */
export const head = (title, lead) => h("header", { class: "page-head" }, h("h1", null, title), lead && h("p", { class: "lead" }, lead));
