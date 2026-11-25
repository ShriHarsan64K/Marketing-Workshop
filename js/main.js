import { $ } from "./lib/dom.js?v=20261125112103";

const page = document.body.dataset.page;
const main = $("#main");
if (page !== "home") main.classList.add("wrap");
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
const { default: render } = await import(`./pages/${page}.js?v=20261125112103`);
await render(main);
