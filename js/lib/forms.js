/* Forms post straight into Google Forms (formResponse). The browser can't read the reply (no-cors), so a resolved request counts as sent. */
import { h, $ } from "./dom.js?v=20261122180336";

const PHONE = /^\+?[0-9][0-9 \-]{8,17}[0-9]$/, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const field = (label, name, attrs) => h("label", null, label, attrs.rows ? h("textarea", { name, ...attrs }) : h("input", { name, ...attrs }));

async function postToForm(cfg, values) {
  if (!cfg.action) throw new Error("not-configured");
  const fd = new FormData();
  for (const [k, entry] of Object.entries(cfg.fields)) if (entry && k in values) fd.append(entry, values[k]);
  await fetch(cfg.action, { method: "POST", mode: "no-cors", body: fd });
}

export function contactForm({ cfg, extra, button, success, extraValues, prefillEmail }) {
  const err = h("p", { class: "bad", role: "alert", hidden: true });
  const form = h("form", { class: "card-form", novalidate: true },
    field("Full name", "name", { required: true, maxlength: 100, autocomplete: "name" }),
    field("Email", "email", { type: "email", required: true, maxlength: 200, autocomplete: "email", value: prefillEmail || null }),
    field("Phone number (WhatsApp preferred)", "phone", { type: "tel", required: true, maxlength: 20, placeholder: "+91 98765 43210", autocomplete: "tel" }),
    extra, h("input", { class: "hp", name: "website", tabindex: "-1", autocomplete: "off", "aria-hidden": "true" }),
    err, h("button", { class: "btn" }, button));
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (f.website) return success(true);                              // honeypot: pretend success
    const v = { name: f.name.trim().slice(0, 100), email: f.email.trim().toLowerCase().slice(0, 200), phone: f.phone.trim().slice(0, 20), message: (f.message || "").trim().slice(0, 500) };
    err.hidden = true;
    if (v.name.length < 2 || !EMAIL.test(v.email) || !PHONE.test(v.phone) || (extra && v.message.length < 10)) {
      err.textContent = extra ? "Please fill in every field: your name, a valid email, a phone number and a few words about you." : "Please fill in every field: your name, a valid email and a phone number.";
      err.hidden = false; return;
    }
    const btn = $("button", form); btn.disabled = true;
    try { await postToForm(cfg, { ...v, ...extraValues }); success(); }
    catch (e) { err.textContent = e.message === "not-configured" ? "This form is not connected yet." : "Something went wrong. Please try again."; err.hidden = false; btn.disabled = false; }
  });
  return form;
}
