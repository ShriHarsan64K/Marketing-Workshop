// Everything you may want to edit lives here. Events live in the Google Sheet.
export default {
  name: "code:iconic",
  headline: "Finally, a space that's yours.",
  lede: "code:iconic is a women's social club in Chennai. Brunches, themed nights, creative workshops, picnics and trips. Free to join.",
  tagline: "The energy. The dress. The life. Finally, a space that's yours.",
  instagram: "https://instagram.com/code.iconic",
  instagramHandle: "@code.iconic",
  instagramStats: null,   // e.g. { posts: 12, followers: 340, following: 80 } (hidden until you add real numbers)
  contactName: "Jaya Shree S",
  email: "jayashreesenthilkumar2004@gmail.com",
  phone: "9677514453",     // shown as written; WhatsApp and call links use +91
  city: "Chennai",
  cityLine: "Tamil Nadu, India",
  timezone: "Asia/Kolkata",
  whatTitle: "What we do",
  // [title, line, photo in images/archive or images/]
  pillars: [
    ["Crochet workshops", "Learn a stitch and make something soft.", "images/archive/crochet.webp"],
    ["Journaling & vision boards", "Cut, paste and dream out loud, pen in hand.", "images/slide3.webp"],
    ["Picnics", "Blankets, snacks and open sky.", "images/archive/circle-1.webp"],
    ["Brunch", "Long tables and good food.", "images/slide1.webp"],
    ["Galentine's", "A night to celebrate your people.", "images/slide2.webp"],
    ["Book club", "Read, sip and talk it over.", "images/archive/group-1.webp"]
  ],
  perks: [   // shown in the membership band on the home page
    ["No fee, no catch", "Joining code:iconic costs nothing."],
    ["Hear about events first", "New dates reach members before they reach everyone else."],
    ["Women who show up", "A warm circle in Chennai for brunches, workshops and trips."]
  ],
  // Home page slideshow photos live in /images
  slides: [
    { image: "images/slide1.webp", heading: "Good company, great afternoons" },
    { image: "images/slide2.webp", heading: "Women who show up for each other" },
    { image: "images/slide3.webp", heading: "Make something that's yours" },
    { image: "images/slide4.webp", heading: "Laughter is part of the plan" },
    { image: "images/slide5.webp", heading: "Cut. Paste. Dream." },
    { image: "images/slide6.webp", heading: "Proud of what we made" }
  ],
  mapCenter: [13.0827, 80.2707],   // Chennai
  membershipText: "Membership is free. Join our community of women in Chennai, tell us a little about you, and hear about every event first.",
  contactNote: "We'd love to hear from you.",

  // Google Sheet > File > Share > Publish to web > CSV
  eventsCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRJ0JDY3tDtsbVejQI17tjiOvlFl_EyL41-ZJjNhqUY-BFcjrp9rqZIGYzh2xm3n9rcGbTgJ5b1uHwy/pub?output=csv",

  // Google Forms: `action` is the form's .../formResponse URL, `fields` maps our fields to its entry.NNN ids.
  registerForm: { action: "https://docs.google.com/forms/d/e/1FAIpQLSd2PQBLORqpE-TgJrJrn6kV2Yaf5Zgv2z30uUzO0IDJWUzHhA/formResponse",
    fields: { event: "entry.438693767", name: "entry.2092647898", email: "entry.997670100", phone: "entry.1932758490" } },
  memberForm: { action: "https://docs.google.com/forms/d/e/1FAIpQLSfWJ9Ootrg3DxA1UAmzwD61qAPnmeibn3cZsTNs1lgaDydjjA/formResponse",
    fields: { message: "entry.438693767", name: "entry.2092647898", email: "entry.997670100", phone: "entry.1932758490" } },

  // Photos for the home tiles, gallery and past-events page. Files live in /images/archive
  archive: [
    ["group-1.webp", "The whole circle"], ["crochet.webp", "Crochet and chats"], ["table-1.webp", "Around the workshop table"],
    ["table-2.webp", "Making things together"], ["circle-1.webp", "Mood board morning"], ["circle-2.webp", "Proud of what we made"],
    ["hug.webp", "Hellos at the door"], ["sparkle.webp", "Little sparkly details"], ["gather.webp", "Everyone arrives"],
    ["mugs.webp", "Journals and smiles"], ["trio.webp", "New friends"]
  ],

  // Founder page (about.html). Design only: swap in the real words later.
  story: {
    kicker: "Founder",
    title: "Jaisu's Story",
    banner: "images/archive/group-1.webp",
    paragraphs: [
      "A short opening that tells people who Jaisu is and why code:iconic exists. Two or three sentences work best.",
      "How it began. Add the moment the idea for code:iconic came to life, in Jaisu's own words.",
      "Who it is for. Add a few lines about the women who come along and what they find here.",
      "Where it is going. Add what Jaisu hopes the community becomes in Chennai and beyond."
    ],
    photo: ["images/archive/table-2.webp", "Making things together"],
    quote: "A line from Jaisu that sums up what code:iconic is about.",
    pair: [["images/archive/crochet.webp", "Crochet and chats"], ["images/archive/circle-2.webp", "Proud of what we made"]]
  }
};
