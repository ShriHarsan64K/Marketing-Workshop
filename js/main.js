import { $ } from "./lib/dom.js?v=20261122173409";
import { renderHeader } from "./components/header.js?v=20261122173409";
import { renderFooter } from "./components/footer.js?v=20261122173409";

const page = document.body.dataset.page;
document.body.dataset.theme = page === "about" ? "pink" : "wine";   // wine page with pink ink; the founder page flips to pink with wine ink
renderHeader(page === "about" ? "bio" : "default");
renderFooter();
const { default: render } = await import(`./pages/${page}.js?v=20261122173409`);
const main = $("#main"); main.classList.add("wrap");
await render(main);
