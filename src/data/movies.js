// Mock movie catalog. TMDB integration will replace this later.
//
// Each movie has:
//   id, title, year, genres[], rating (public/critic score out of 10),
//   poster, alt, description
// Movies the user has already watched additionally carry:
//   watched: true, myRating (personal score), personalTag, personalTagColor, quote

export const GENRES = [
  'Sci-Fi',
  'Psych Thriller',
  'Neo-Noir',
  'Dystopian',
  'Art House',
  'Drama',
  'Action',
  'Thriller',
  'Mystery',
  'Romance',
  'Horror',
]

export const MOVIES = [
  // --- Already watched (originals from the Stitch "Recently Watched" rail) ---
  {
    id: 'arrival',
    title: 'Arrival',
    year: 2016,
    genres: ['Sci-Fi', 'Drama'],
    rating: 8.6,
    poster:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD3cDJff9tzFDZIMcO8anS0tVuYaUdWEwT2rJk42_l_jtVctgh23dGwQn358DYCV5jACO4i8EfHaUzdglT1f_S8bu5sesMAsfeoFWPn-DkHh6t9_RxrBSAXG9XK8ltd51CXh7QVb7PmGxoXgbtmYW3eUqTiToyFTveqFgRinir678Np7D21hC0F88tvHs2F57KnBM7C0uloN8dPBfg5dD1qYR1pddWUpUdLBnjNxDR-n-wsVKr0JmxH',
    alt: 'Dark atmospheric movie poster of a giant mysterious extraterrestrial pebble spacecraft hovering quietly above misty rolling mountain clouds.',
    description:
      'A linguist is recruited by the military to communicate with alien visitors after twelve mysterious spacecraft appear around the world.',
    watched: true,
    myRating: 10,
    personalTag: 'Masterpiece',
    personalTagColor: 'text-primary',
    quote: '"Linguistic perfection"',
  },
  {
    id: 'ex-machina',
    title: 'Ex Machina',
    year: 2015,
    genres: ['Sci-Fi', 'Psych Thriller'],
    rating: 7.7,
    poster:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNWGcfDcda4cEsD6S4eXGn86qGI3sMQNOSOBJenkoaOYYdsq9OkW6oc6Cx2BzsIUAr-r1cSjIg2Q4o9iOVxtJ1OmGl0Hw9DEvkXAHv9ZbF8M38V3-DyoJztIVa8_x8iDHPxVhyXntwKJs25ow3Aw8kX_Jczkq-F2GUurl4wHQOZS7Hz9cJ7IaNvvoWSZ_AJ928VA-8rtB54rt5Q8mpUwSHBOzat-wPcVjhvVEDkm3klC535cQodiDh',
    alt: 'Futuristic neon backlit portrait of a female humanoid android inside an architecturally minimal glass laboratory.',
    description:
      'A young programmer is invited to administer the Turing test on an intelligent, beautiful android — and must decide who to trust.',
    watched: true,
    myRating: 9,
    personalTag: 'Favorite',
    personalTagColor: 'text-secondary',
    quote: '"Tense and pristine"',
  },
  {
    id: 'tenet',
    title: 'Tenet',
    year: 2020,
    genres: ['Sci-Fi', 'Action', 'Thriller'],
    rating: 7.3,
    poster:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9fnXqTJmsStSh1Pwfe5Ag0nbKnBRXIZ3EQ4yciR-5599l7EKuN0mOM0CHpTJTuCDunqCF6GeZxTHqlcVxiuNWpprHMNSTiDo1AwBQtuEqrVsYOym4N186LdeQkb4LmLcWLwvR-K1bgFWoVF0p-F5GYvqQNPqbOZ28KHQtAbt4sWLxGfssc7w0WMPebb1IK8nmjx8GRQqeEh6azky3ZxZ9s6PZ9-KSggvAWEua9gEXzg87JS6iQlzS',
    alt: 'High stakes cinematic still of a secret agent running through an inverted time distortion chamber with shattered glass suspended mid-air.',
    description:
      'Armed with only one word, Tenet, a protagonist fights for the survival of the world through a twilight world of international espionage and time inversion.',
    watched: true,
    myRating: 8,
    personalTag: 'Rewatched',
    personalTagColor: 'text-on-surface-variant',
    quote: '"Temporal puzzle box"',
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: 2017,
    genres: ['Sci-Fi', 'Neo-Noir', 'Dystopian'],
    rating: 8.0,
    poster:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAKhkbuKQ0hV2ukkIPaUmqS54A0b7m-E-Us4D5zRHmtAa3_3gNlty_g8c1-8CKMIssLmKsK2DMfAjV12IIS8hOspOMDupfnQNtAEPMHqa9IBfksGgzWVplMx8pvVcYknXa-OTAhQzB2x4N0ExGnDYUIv2ApWtdhqH6IQA6T14-7CiChk2bvL0Sxz6EYesHdKmEUgfE4Zxi8Gog8RLer7sdtsPfrcMd7fUNBeud1iP7AEziDanBDUftt',
    alt: 'Atmospheric dystopian landscape in glowing vibrant orange haze with gigantic classical statue remnants and a silhouette of a trenchcoat detective figure.',
    description:
      "A young blade runner unearths a long-buried secret that leads him to track down former blade runner Rick Deckard, missing for thirty years.",
    watched: true,
    myRating: 10,
    personalTag: 'Masterpiece',
    personalTagColor: 'text-primary',
    quote: '"Audiovisual bliss"',
  },

  // --- Wider catalog for Discover / For You / Watchlist ---
  {
    id: 'inception',
    title: 'Inception',
    year: 2010,
    genres: ['Sci-Fi', 'Psych Thriller', 'Mystery'],
    rating: 8.8,
    poster: 'https://picsum.photos/seed/inception-cinematch/400/600',
    alt: 'Movie poster placeholder for Inception',
    description:
      'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a target\u2019s subconscious.',
  },
  {
    id: 'parasite',
    title: 'Parasite',
    year: 2019,
    genres: ['Drama', 'Thriller', 'Mystery'],
    rating: 8.5,
    poster: 'https://picsum.photos/seed/parasite-cinematch/400/600',
    alt: 'Movie poster placeholder for Parasite',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between a wealthy family and a destitute clan.',
  },
  {
    id: 'blade-runner-1982',
    title: 'Blade Runner',
    year: 1982,
    genres: ['Sci-Fi', 'Neo-Noir', 'Dystopian'],
    rating: 8.1,
    poster: 'https://picsum.photos/seed/bladerunner1982-cinematch/400/600',
    alt: 'Movie poster placeholder for Blade Runner',
    description:
      'A blade runner must pursue and terminate four replicants who stole a ship in space and have returned to Earth to find their creator.',
  },
  {
    id: 'children-of-men',
    title: 'Children of Men',
    year: 2006,
    genres: ['Sci-Fi', 'Dystopian', 'Drama'],
    rating: 7.9,
    poster: 'https://picsum.photos/seed/childrenofmen-cinematch/400/600',
    alt: 'Movie poster placeholder for Children of Men',
    description:
      'In a chaotic future where humans can no longer procreate, a former activist agrees to help transport a miraculously pregnant woman to safety.',
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    year: 1999,
    genres: ['Sci-Fi', 'Action'],
    rating: 8.7,
    poster: 'https://picsum.photos/seed/thematrix-cinematch/400/600',
    alt: 'Movie poster placeholder for The Matrix',
    description:
      'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
  },
  {
    id: 'her',
    title: 'Her',
    year: 2013,
    genres: ['Sci-Fi', 'Drama', 'Romance'],
    rating: 8.0,
    poster: 'https://picsum.photos/seed/her-cinematch/400/600',
    alt: 'Movie poster placeholder for Her',
    description:
      'A lonely writer develops an unlikely relationship with an operating system designed to meet his every need.',
  },
  {
    id: 'under-the-skin',
    title: 'Under the Skin',
    year: 2013,
    genres: ['Sci-Fi', 'Art House', 'Horror'],
    rating: 6.3,
    poster: 'https://picsum.photos/seed/undertheskin-cinematch/400/600',
    alt: 'Movie poster placeholder for Under the Skin',
    description:
      'An alien entity in human form roams the streets, luring lonely men into a mysterious, otherworldly void.',
  },
  {
    id: 'prisoners',
    title: 'Prisoners',
    year: 2013,
    genres: ['Psych Thriller', 'Drama', 'Mystery'],
    rating: 8.1,
    poster: 'https://picsum.photos/seed/prisoners-cinematch/400/600',
    alt: 'Movie poster placeholder for Prisoners',
    description:
      'When his daughter and her friend go missing, a desperate father takes matters into his own hands as the police pursue multiple leads.',
  },
  {
    id: 'se7en',
    title: 'Se7en',
    year: 1995,
    genres: ['Psych Thriller', 'Neo-Noir', 'Mystery'],
    rating: 8.6,
    poster: 'https://picsum.photos/seed/se7en-cinematch/400/600',
    alt: 'Movie poster placeholder for Se7en',
    description:
      'Two detectives hunt a serial killer who uses the seven deadly sins as his motives in a series of ritualistic murders.',
  },
  {
    id: 'gone-girl',
    title: 'Gone Girl',
    year: 2014,
    genres: ['Psych Thriller', 'Drama', 'Mystery'],
    rating: 8.1,
    poster: 'https://picsum.photos/seed/gonegirl-cinematch/400/600',
    alt: 'Movie poster placeholder for Gone Girl',
    description:
      'With his wife\u2019s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.',
  },
  {
    id: 'shutter-island',
    title: 'Shutter Island',
    year: 2010,
    genres: ['Psych Thriller', 'Mystery', 'Dystopian'],
    rating: 8.2,
    poster: 'https://picsum.photos/seed/shutterisland-cinematch/400/600',
    alt: 'Movie poster placeholder for Shutter Island',
    description:
      'In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.',
  },
  {
    id: 'the-truman-show',
    title: 'The Truman Show',
    year: 1998,
    genres: ['Drama', 'Art House'],
    rating: 8.2,
    poster: 'https://picsum.photos/seed/trumanshow-cinematch/400/600',
    alt: 'Movie poster placeholder for The Truman Show',
    description:
      'An insurance salesman discovers his whole life is actually a nonstop television show broadcast around the clock to the entire world.',
  },
  {
    id: 'eternal-sunshine',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    genres: ['Romance', 'Drama', 'Art House'],
    rating: 8.3,
    poster: 'https://picsum.photos/seed/eternalsunshine-cinematch/400/600',
    alt: 'Movie poster placeholder for Eternal Sunshine of the Spotless Mind',
    description:
      'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.',
  },
  {
    id: 'donnie-darko',
    title: 'Donnie Darko',
    year: 2001,
    genres: ['Sci-Fi', 'Psych Thriller', 'Art House'],
    rating: 8.0,
    poster: 'https://picsum.photos/seed/donniedarko-cinematch/400/600',
    alt: 'Movie poster placeholder for Donnie Darko',
    description:
      'A troubled teenager is plagued by visions of a large rabbit that manipulates him into committing a series of crimes.',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    genres: ['Sci-Fi', 'Drama'],
    rating: 8.7,
    poster: 'https://picsum.photos/seed/interstellar-cinematch/400/600',
    alt: 'Movie poster placeholder for Interstellar',
    description:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\u2019s survival.',
  },
  {
    id: 'get-out',
    title: 'Get Out',
    year: 2017,
    genres: ['Horror', 'Psych Thriller', 'Mystery'],
    rating: 7.7,
    poster: 'https://picsum.photos/seed/getout-cinematch/400/600',
    alt: 'Movie poster placeholder for Get Out',
    description:
      'A young Black man visits his white girlfriend\u2019s family estate, where he uncovers a disturbing secret.',
  },
]

// "Recently Watched & Rated" data for the Profile screen — derived from
// the movies the user has already watched, in the shape MovieCard expects.
export const recentlyWatched = MOVIES.filter((m) => m.watched).map((m) => ({
  id: m.id,
  title: m.title,
  rating: m.myRating,
  tag: m.personalTag,
  tagColor: m.personalTagColor,
  quote: m.quote,
  poster: m.poster,
  alt: m.alt,
}))

// Taste DNA genre breakdown, used to draw the Profile screen's affinity bar + pills.
export const genreAffinity = [
  { id: 'sci-fi', label: 'Sci-Fi', pct: 38, barClass: 'bg-primary-container', dotClass: 'bg-white', activePillClass: 'bg-primary-container text-on-primary-container', pctTextClass: 'opacity-90' },
  { id: 'psych-thriller', label: 'Psych Thriller', pct: 24, barClass: 'bg-secondary', dotClass: 'bg-secondary', pctTextClass: 'text-secondary' },
  { id: 'neo-noir', label: 'Neo-Noir', pct: 18, barClass: 'bg-tertiary-container', dotClass: 'bg-tertiary-container', pctTextClass: 'text-tertiary' },
  { id: 'dystopian', label: 'Dystopian', pct: 12, barClass: 'bg-surface-tint', dotClass: 'bg-surface-tint', pctTextClass: 'text-on-surface-variant' },
  { id: 'art-house', label: 'Art House', pct: 8, barClass: 'bg-surface-bright', dotClass: 'bg-surface-bright', pctTextClass: 'text-on-surface-variant' },
]
