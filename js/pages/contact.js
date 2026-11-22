import C from "../config.js?v=20261122174300";
import { h, arch, safeUrl, whatsapp, telHref } from "../lib/dom.js?v=20261122174300";
import { icon } from "../lib/icons.js?v=20261122174300";
import { head } from "../components/pagehead.js?v=20261122174300";

const pretty = p => { const d = String(p).replace(/\D/g, "").slice(-10); return `+91 ${d.slice(0, 5)} ${d.slice(5)}`; };
const row = (ic, label, href, text) => h("a", { class: "crow", href, rel: href.startsWith("http") ? "noopener" : null }, h("span", { class: "ci" }, icon(ic, 20)), h("span", null, h("small", null, label), text));

export default function contact(main) {
  main.append(head("Contact", C.contactNote),
    h("div", { class: "contact-grid" },
      h("div", { class: "contact-card" },
        h("h2", null, C.contactName),
        h("div", { class: "crows" },
          row("mail", "Email", "mailto:" + C.email, C.email),
          row("phone", "Phone", telHref(C.phone), pretty(C.phone)),
          row("instagram", "Instagram", safeUrl(C.instagram), C.instagramHandle)),
        h("div", { class: "cta" }, h("a", { class: "btn", href: whatsapp(C.phone, "Hi code:iconic, I'd love to know more."), rel: "noopener" }, icon("chat", 18), "Message on WhatsApp"),
          h("a", { class: "btn ghost", href: "mailto:" + C.email }, "Send an email"))),
      h("figure", { class: "contact-photo" }, h("img", { src: arch("trio.webp"), alt: "Friends at a code:iconic event", loading: "lazy", width: 1400, height: 1050 }))));
}
