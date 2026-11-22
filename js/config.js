// Everything you may want to edit lives here. Events live in the Google Sheet.
window.SITE = {
  name: "code: iconic",
  headline: "Finally, a space that's yours.",
  lede: "code:iconic is a women's social club in Chennai. Brunches, themed nights, creative workshops, picnics and trips. Free to join.",
  whatTitle: "Plans worth showing up for.",
  pillars: [
    ["Brunches and nights out", "Themed gatherings with good food and better company."],
    ["Creative workshops", "Journaling, mood boards and making things with your hands."],
    ["Picnics and trips", "Easy afternoons outdoors and weekends away."]
  ],
  tagline: "The energy. The dress. The life. Finally, a space that's yours.",
  instagram: "https://instagram.com/code.iconic",
  email: "",            // shown on the Contact page
  phone: "",            // optional
  aboutWho: "Tell your story here: who you are, why you started, and what you stand for.",
  aboutWhat: "Brunches, themed nights out, creative workshops, picnics and trips.",
  membershipText: "Membership is free. Join our community of women in Chennai, tell us a little about you, and hear about every event first.",
  vibes: ["Brunches", "Themed nights", "Creative workshops", "Picnics", "Trips", "New friends"],
  perks: [   // edit freely: shown on the home page membership section
    ["No fee, no catch", "Joining code: iconic costs nothing."],
    ["Hear about events first", "New dates reach members before they reach everyone else."],
    ["Women who show up", "A warm circle in Chennai for brunches, workshops and trips."]
  ],
  contactNote: "We'd love to hear from you.",
  timezone: "Asia/Kolkata",

  // Google Sheet > File > Share > Publish to web > "Events" tab > CSV. Paste that link:
  eventsCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJ0JDY3tDtsbVejQI17tjiOvlFl_EyL41-ZJjNhqUY-BFcjrp9rqZIGYzh2xm3n9rcGbTgJ5b1uHwy/pub?output=csv",

  // Google Forms: `action` is the form's .../formResponse URL, `fields` maps our fields to its entry.NNN ids.
  registerForm: { action: "https://docs.google.com/forms/d/e/1FAIpQLSd2PQBLORqpE-TgJrJrn6kV2Yaf5Zgv2z30uUzO0IDJWUzHhA/formResponse",
    fields: { event: "entry.438693767", name: "entry.2092647898", email: "entry.997670100", phone: "entry.1932758490" } },
  memberForm: { action: "https://docs.google.com/forms/d/e/1FAIpQLSfWJ9Ootrg3DxA1UAmzwD61qAPnmeibn3cZsTNs1lgaDydjjA/formResponse",
    fields: { message: "entry.438693767", name: "entry.2092647898", email: "entry.997670100", phone: "entry.1932758490" } },

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
