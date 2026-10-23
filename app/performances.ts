export type CreditEvent = {
  dateCode?: string;
  date?: string;
  dateLabel?: string;
  venue?: string;
  venueLabel?: string;
  writtenAndDirectedBy?: string;
  writtenAndPresentedBy?: string;
  starring?: string[];
  with?: string;
  performedBy?: string;
  dancedBy?: string[];
  musicBy?: string;
  musicComposedBy?: string[];
  costumes?: string[];
  costumesByCast?: boolean;
  poster?: string;
  posterNote?: string;
  people?: string;
  peopleLabel?: string;
  artists?: string[];
  curatedBy?: string;
  note?: string;
  synopsis?: string;
};

export type Production = {
  id: string;
  title: string;
  href?: string;
  kind?: string;
  events: CreditEvent[];
};

export const productions: Production[] = [
  {
    id: "let-the-characters-determine-the-plot",
    title: "Let the Characters Determine the Plot",
    kind: "Dialogue between Olive Bonner and Camille Clair",
    events: [
      {
        date: "October 9, 2026",
        venue: "3rd Ave/E 14th St. to the Chelsea Hotel",
        venueLabel: "en route from",
      },
    ],
  },
  {
    id: "la-chambre-du-meridien",
    title: "La Chambre du Méridien",
    kind: "Monologue",
    events: [
      {
        date: "September 27, 2026",
        venue: "Le Cadre d'or, Paris France",
      },
    ],
  },
  {
    id: "the-martyrdom-of-saint-rufina",
    title: "The Martyrdom of Saint Rufina",
    events: [
      {
        dateCode: "04.09.2026",
        date: "September 4, 2026",
        venue: "Gallery of the University of Applied Arts, Vienna",
        writtenAndDirectedBy: "Camille Clair",
        starring: ["Etienne Le Coquil", "Tristan Hickey", "Emre Özakat"],
        musicBy: "Nava Hemyary",
        costumes: ["Anna Ammerer"],
        poster: "Nicolas Ceccaldi",
      },
      {
        dateCode: "10.12.2025",
        date: "December 10, 2025",
        venue: "Third Space, Vienna",
        writtenAndDirectedBy: "Camille Clair",
        starring: ["Camille Clair", "Nik Geene", "Albert Løje", "Oren Yehoushua"],
        with: "Sarah M. Dragović on viola",
        costumes: ["Anna Ammerer", "Maria Cozma"],
        poster: "Louis Hay",
      },
      {
        dateCode: "22.06.2025",
        date: "June 22, 2025",
        venue: "d'esque theater, NYC",
        writtenAndDirectedBy: "Camille Clair",
        starring: ["Olive Bonner", "Marco Villard", "Angel Zinovieff"],
        with: "Omeed Almassi on cello",
        costumesByCast: true,
        posterNote: "features a drawing by Rachel Harrison",
      },
    ],
  },
  {
    id: "ambitus",
    title: "Ambitus",
    href: "https://www.youtube.com/live/L-F9UmQ6hAM?si=k_7XK2AgYZRf34cg",
    kind: "A lecture on Eternalism",
    events: [
      {
        date: "July 25, 2026",
        venue: "Loretto Chapel, Clervaux, Luxembourg",
        writtenAndPresentedBy: "Camille Clair",
      },
    ],
  },
  {
    id: "parallelogram",
    title: "Parallelogram",
    href: "https://www.contemporaryartlibrary.org/project/camille-clair-andreas-westerlin-hatt-at-medium-p-berlin-91306?from=%2Fartist%2Fcamille-clair-38677",
    events: [
      {
        date: "July 8 - October 23, 2026",
        dateLabel: "",
        venue: "Medium P, Berlin",
        people: "Camille Clair and Andreas Westerlin Hatt",
      },
    ],
  },
  {
    id: "the-real-pinocchio-theory",
    title: "The Real Pinocchio Theory",
    href: "https://www.contemporaryartlibrary.org/project/the-real-pinocchio-theory-at-shore-gallery-vienna-63344",
    events: [
      {
        date: "February 13 - March 14, 2026",
        dateLabel: "",
        venue: "Shore Gallery, Vienna",
        artists: [
          "Anna Ammerer",
          "Dan Bodan",
          "Naama Doron Angel",
          "Sven Loven",
          "Felix Krapp-Raczek",
          "Günther Möbius",
          "Bartholomaeus Wächter",
        ],
        curatedBy: "Oren Yehoshua",
      },
    ],
  },
  {
    id: "earth-gravity-and-loveland-frogman",
    title: "Earth Gravity and Loveland Frogman",
    kind: "Durational performance",
    events: [
      {
        date: "October 30 - January 30",
        venue: "Nussdorferstrasse, Vienna",
        people: "Camille Clair and Oren Yehoushua",
        peopleLabel: "by",
      },
    ],
  },
  {
    id: "my-example-my-exchange",
    title: "My Example; my Exchange",
    kind: "Trust Punks; Primary Concern; Hobby Opera",
    events: [
      {
        date: "December 18th, 2026",
        dateLabel: "Final performance",
        venue: "The Library, New York Center for Creativity and Dance, Joyce Theater, New York City",
        writtenAndDirectedBy: "Olive Bonner",
        performedBy: "Brett Gelnovatch",
        dancedBy: ["Clara Kim", "Devra Rayne"],
        musicComposedBy: ["Joseph Wagner", "Ana Hafley", "Strider Schmidt"],
        synopsis:
          "A play wherein two resigned opponents Ample and Change recognize their recognition as former familiars. The two of them are interrupted by two dancerly mime-types who attempt and forego a color-analysis in an attempt to swoon each but, when left be, lay side by side, stand up and for themselves, get their nails painted black in part to hold manicured hands, each of theirs, one another, and they see so much of what each says one may see in something, in each other.",
      },
    ],
  },
  {
    id: "sympathetic-character",
    title: "Sympathetic Character",
    kind: "A dialogue between Olive Bonner and Eero Fleming",
    events: [
      {
        dateCode: "17.10.2025",
        date: "October 17, 2025",
        venue: "a yurt on a property in Palenville, New York",
        note: "begun and performed",
      },
      {
        dateCode: "17.10.2026",
        date: "October 17, 2026",
        dateLabel: "final scene",
        venue: "another yurt on said property in Palenville, New York",
      },
    ],
  },
  {
    id: "sheer-scandal",
    title: "Sheer Scandal",
    href: "https://docs.google.com/document/d/1HDCfLxZFuJ73AaJ9WipbHatpWhtR6rf4ihAyEFqYX6M/edit?tab=t.0",
    kind: "Story written and performed by Olive Bonner",
    events: [
      {
        date: "August 31st, 2026",
        venue: "Interrobang, Brooklyn, NY",
        note: "on the closing reception of Total Eclipse, a group exhibition curated by Zaid Arshad, consisting of artworks by Patrick Procktor, Ginger Jingzhe Fan, G. Küng, and Aneesa Razak",
      },
    ],
  },
];
