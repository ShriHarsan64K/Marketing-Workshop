import C from "../config.js";
import { h } from "../lib/dom.js";
import { contactForm, field } from "../lib/forms.js";
import { head } from "./_head.js";

export default function membership(main) {
  main.classList.add("narrow");
  main.append(head("Membership", "Join code:iconic. It's free.", C.membershipText));
  const box = h("div"); main.append(box);
  const prefill = new URLSearchParams(location.search).get("email") || "";
  box.append(contactForm({ cfg: C.memberForm, button: "Join for free", extraValues: {}, prefillEmail: prefill.slice(0, 200),
    extra: field("Tell us a little about yourself", "message", { rows: 4, maxlength: 500, required: true, placeholder: "What do you love doing? What would you like to try with us?" }),
    success: bot => box.replaceChildren(bot ? "" : h("div", { class: "note", role: "status" }, h("h3", { style: "margin-bottom:8px" }, "Welcome in."), "Thanks for joining. We'll be in touch soon.")) }));
}
