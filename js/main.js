import { $ } from "./lib/dom.js";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";

const page = document.body.dataset.page;
document.body.dataset.theme = page === "about" ? "wine" : "pink";   // pink page with wine ink; the founder page flips to wine with pink ink
renderHeader(page === "about" ? "bio" : "default");
renderFooter();
const { default: render } = await import(`./pages/${page}.js`);
const main = $("#main"); main.classList.add("wrap");
await render(main);
