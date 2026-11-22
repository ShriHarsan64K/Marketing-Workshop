// Everything you may want to edit lives here. Events live in the Google Sheet.
window.SITE = {
  name: "code: iconic",
  tagline: "The energy. The dress. The life. Finally, a space that's yours.",
  instagram: "https://instagram.com/code.iconic",
  email: "",            // shown on the Contact page
  phone: "",            // optional
  aboutWho: "Tell your story here: who you are, why you started, and what you stand for.",
  aboutWhat: "Brunches, themed nights out, creative workshops, picnics and trips.",
  membershipText: "Join our community of women in Chennai. Leave your details and we'll be in touch.",
  contactNote: "We'd love to hear from you.",
  timezone: "Asia/Kolkata",

  // Google Sheet > File > Share > Publish to web > "Events" tab > CSV. Paste that link:
  eventsCsv: "",

  // Google Forms: `action` is the form's .../formResponse URL, `fields` maps our fields to its entry.NNN ids.
  registerForm: { action: "", fields: { event: "", name: "", email: "", phone: "" } },
  memberForm:   { action: "", fields: { name: "", email: "", phone: "", message: "" } },

  // Home page slideshow: photos live in /images
  slides: [
    { image: "images/slide1.jpg", heading: "Good company, great afternoons", caption: "Workshops on a sunny terrace" },
    { image: "images/slide2.jpg", heading: "Women who show up for each other", caption: "Meet your people in Chennai" },
    { image: "images/slide3.jpg", heading: "Make something that's yours", caption: "Creative, cosy, unhurried" },
    { image: "images/slide4.jpg", heading: "Laughter is part of the plan", caption: "Every gathering, every week" },
    { image: "images/slide5.jpg", heading: "Cut. Paste. Dream.", caption: "Mood boards, journals and more" },
    { image: "images/slide6.jpg", heading: "Proud of what we made", caption: "Come create with us" }
  ]
};
