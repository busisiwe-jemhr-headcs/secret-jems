// ─────────────────────────────────────────────────────────────
//  Secret Jems settings. Edit this file in GitHub to change
//  dates, the spend limit, offices or the staff lists.
//  Vercel redeploys automatically when you commit.
// ─────────────────────────────────────────────────────────────

export const EVENT = {
  name: "Secret Jems",
  tagline: "Our December gift swap. Add your wish list, spin the wheel, and find out who you’re spoiling this holiday season.",
  budget: "",     // e.g. "R300"  (leave "" to hide)
  swapDay: "",    // e.g. "Friday 11 December"  (leave "" to hide)

  // South African time (+02:00)
  cutoff: "2026-11-13T23:59:00+02:00",     // wish lists close: end of Friday 13 November
  drawOpens: "2026-11-16T09:00:00+02:00",  // the draw opens: 09:00 Monday 16 November
};

// Order sets each office's colour: pink, green, gold.
export const OFFICES = [
  { id: "cpt", name: "Cape Town" },
  { id: "jhb", name: "Johannesburg" },
  { id: "kzn", name: "KZN" },
];

export const ROSTER = {
  cpt: [
    "Abigail Michaels", "Alex Böhmer", "Amy Hopkins", "Andrea Houben", "Caroline van der Merwe",
    "Chané Worthington-Fitnum", "Chris Welsh", "Daniel Fabre", "Danielle Lifschitz",
    "Dawie van der Westhuizen", "Evan Anderson", "Kyle Black", "Matt Stopforth", "Megan van Schalkwyk",
    "Nabeelah Goosen", "Nadine Isaacs", "Phandulwazi Mredlana", "Rob Gardner", "Simon Ellis",
    "Tristan", "Wendy Lategan",
  ],
  jhb: [
    "Abongile Makaula", "Adriaan Deetlefs", "Adrian Hughes", "Ashler Matsila", "Bakuena N",
    "Beauty Mafiri", "Bryce Bolton", "Busisiwe Mashele", "Chris Hellmann", "Edward Motloung",
    "Ester le Roux", "Francis Zimuto", "Hlumela Mayedwa", "Ian Manda", "Justin Webb",
    "Kaeleigh Stroud", "Kirsty Rautenbach", "Lefa Mokgatle", "Lise-Jo Snyman", "Michelle Mitchell",
    "Michelle Vieira", "Nomthandazo", "Nonsuku Mthimkhulu", "Qaqamba Tom", "Rethabile Mabe",
    "Rirhandzu Mnisi", "Rodrigue Tusse", "Sandisiwe Gxaba", "Steven Frohlich", "Tarryn Blom",
    "Taryn Pienaar", "Thamsanqa", "Thando Gumede", "Thandoluhle Dlamini", "Thendo Nengwenda",
    "Zama Jugar", "Zilungile Zuma",
  ],
  kzn: ["Bianca McKay", "Richard O’Brien"],
};
