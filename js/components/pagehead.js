import { h } from "../lib/dom.js?v=20261122173409";
export const head = (eyebrow, title, lead) => h("div", { class: "page-head" }, h("p", { class: "eyebrow" }, eyebrow), h("h1", null, title), lead && h("p", { class: "lead" }, lead));
