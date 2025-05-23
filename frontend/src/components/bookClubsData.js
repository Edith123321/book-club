const bookClubsData = [
  {
    id: 1,
    bookClubName: "The Classic Readers",
    description: "Welcome to The Classic Readers, where we journey through the greatest works of literature that have stood the test of time. Our members explore the depths of 19th-century realism, Victorian social commentary, and the timeless human conditions portrayed by masters like Austen, Dickens, Tolstoy, and the Brontë sisters. We don't just read - we analyze historical contexts, discuss author biographies, compare translations, and debate why these works remain culturally relevant centuries later. Our meetings feature themed discussions, occasional guest lecturers from local universities, and even period-appropriate refreshments. Whether you're a lifelong classics lover or just beginning your journey into canonical literature, you'll find thoughtful companions here.",
    meetingFrequency: "Bi-weekly on Sundays",
    currentBook: {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      description: "A romantic comedy of manners about Elizabeth Bennet and the proud Mr. Darcy, exploring class, reputation, and love in 19th-century England.",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      progress: "Volume 2 completed (21/50 chapters)",
      pagesRead: "210 of 432",
    },
    nextMeeting: {
      date: "June 12, 2023",
      time: "2:00 PM",
      location: "The Reading Nook Café",
      agenda: "Discuss Elizabeth's refusal of Mr. Collins & economic pressures on women"
    },
    discussions: [
      {
        user: "Sarah Johnson",
        comment: "Austen's wit is unmatched! The way she skewers Mrs. Bennet is hilarious.",
        timestamp: "2 days ago",
        likes: 5
      }
    ],
    genres: ["Classics", "Romance"],
    clubCover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500",
    members: [
      { name: "Sarah Johnson", avatar: "https://randomuser.me/api/portraits/women/1.jpg" }
    ]
  },
  {
    id: 2,
    bookClubName: "Sci-Fi Enthusiasts",
    description: "The Sci-Fi Enthusiasts club is more than just a reading group - it's a think tank exploring how speculative fiction shapes and predicts our technological future. We examine the philosophical questions posed by Asimov's robotics, the sociological implications of Le Guin's genderless societies, and the scientific accuracy behind Neal Stephenson's cyberpunk visions. Our meetings often feature 'Tech Watch' segments where we compare current innovations to past predictions, and 'Future Forecasting' debates about where humanity might be headed. From hard sci-fi to space operas, we welcome all subgenres. Many of our members work in STEM fields, but all curious minds are welcome - our only requirement is a passion for exploring 'what if?'",
    meetingFrequency: "Monthly on 3rd Wednesday",
    currentBook: {
      title: "Dune",
      author: "Frank Herbert",
      description: "A political epic set on the desert planet Arrakis, where control of the spice melange means control of the universe.",
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500",
      progress: "Book 1 completed (8/22 chapters)",
      pagesRead: "188 of 412",
    },
    nextMeeting: {
      date: "June 15, 2023",
      time: "7:30 PM",
      location: "Zoom",
      agenda: "Analyze the Bene Gesserit's influence"
    },
    discussions: [
      {
        user: "David Kim",
        comment: "The sandworms are iconic, but the politics are what really hook me.",
        timestamp: "5 days ago",
        likes: 8
      }
    ],
    genres: ["Science Fiction", "Dystopian"],
    clubCover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=500",
    members: [
      { name: "David Kim", avatar: "https://randomuser.me/api/portraits/men/2.jpg" }
    ]
  },
  {
    id: 3,
    bookClubName: "Mystery Solvers",
    description: "Calling all armchair detectives! The Mystery Solvers club is part book discussion, part interactive puzzle experience. We don't just read crime novels - we recreate crime scenes (with props!), analyze forensic details, and attempt to solve cases before the big reveal. Our meetings feature 'Red Herring Awards' for the most misleading clues, 'Most Likely To' predictions about characters, and occasional guest appearances by actual detectives who critique the accuracy of procedural details. We rotate between classic whodunits, psychological thrillers, cozy mysteries, and true crime adaptations. Many of our members participate in escape rooms together, and we host an annual 'Murder Mystery Dinner' based on our favorite book of the year. Warning: Spoilers are treated as capital offenses!",
    meetingFrequency: "Weekly on Thursdays",
    currentBook: {
      title: "Gone Girl",
      author: "Gillian Flynn",
      description: "A psychological thriller about a woman's disappearance and the dark secrets in her marriage.",
      cover: "https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?w=500",
      progress: "Part 1 completed (15/32 chapters)",
      pagesRead: "120 of 415",
    },
    nextMeeting: {
      date: "June 9, 2023",
      time: "6:30 PM",
      location: "Mystery Lovers Bookstore",
      agenda: "Debate: Is Nick guilty?"
    },
    discussions: [
      {
        user: "Olivia Martinez",
        comment: "Amy's diary entries are chilling. Flynn writes unreliable narrators so well!",
        timestamp: "1 day ago",
        likes: 7
      }
    ],
    genres: ["Thriller", "Crime"],
    clubCover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
    members: [
      { name: "Olivia Martinez", avatar: "https://randomuser.me/api/portraits/women/4.jpg" }
    ]
  },
  {
    id: 4,
    bookClubName: "Non-Fiction Network",
    description: "The Non-Fiction Network is for fact-finders, knowledge-seekers, and lifelong learners who believe reality is often stranger than fiction. Our discussions bridge multiple disciplines - one month we might debate the geopolitical implications of a history book, the next we could be replicating simple experiments from a physics text. We maintain a 'Fact-Check Corner' where members verify surprising claims, and 'Further Reading' lists that expand on each book's themes. Many of our meetings feature Skype interviews with authors or subject matter experts. Recent highlights include a nutritionist analyzing 'The Omnivore's Dilemma' and a journalist discussing investigative research methods. Whether you prefer microhistories, scientific explorations, biographies, or cultural studies, you'll find intellectually stimulating company here.",
    meetingFrequency: "Twice a month on Tuesdays",
    currentBook: {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      description: "A sweeping history of humankind, from evolution to the rise of empires.",
      cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500",
      progress: "Ch. 5 completed (5/20 chapters)",
      pagesRead: "150 of 443",
    },
    nextMeeting: {
      date: "June 7, 2023",
      time: "6:00 PM",
      location: "Virtual",
      agenda: "Discuss the Agricultural Revolution's impact"
    },
    discussions: [
      {
        user: "Daniel Brown",
        comment: "Harari's take on how wheat 'domesticated' humans blew my mind.",
        timestamp: "3 days ago",
        likes: 4
      }
    ],
    genres: ["History", "Science"],
    clubCover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500",
    members: [
      { name: "Daniel Brown", avatar: "https://randomuser.me/api/portraits/men/5.jpg" }
    ]
  },
  {
    id: 5,
    bookClubName: "Fantasy Realm Readers",
    description: "Step through the wardrobe into Fantasy Realm Readers, where we celebrate the magic of world-building and mythical storytelling. Our club doesn't just discuss plots - we create elaborate maps of fictional worlds, analyze magical systems for consistency, and debate 'What If' scenarios that could change entire story arcs. We host themed meetings where members dress as favorite characters, annual 'Fantasy Feasts' featuring foods from our current book's universe, and writing workshops for aspiring fantasy authors. From high fantasy epics to urban fantasy series, we explore how these stories reflect human psychology and cultural myths. Many members participate in RPG campaigns together, and our holiday party features a 'White Elephant' gift exchange with magical items from literature. Wizards, warriors, and whimsical creatures all welcome!",
    meetingFrequency: "Every 3 weeks on Fridays",
    currentBook: {
      title: "The Name of the Wind",
      author: "Patrick Rothfuss",
      description: "A bard's retelling of his life as a legendary wizard, full of music and mystery.",
      cover: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500",
      progress: "Ch. 30 completed (30/92 chapters)",
      pagesRead: "300 of 662",
    },
    nextMeeting: {
      date: "June 10, 2023",
      time: "7:00 PM",
      location: "The Enchanted Teapot (theme café)",
      agenda: "Kvothe's time at the University"
    },
    discussions: [
      {
        user: "Ethan Moore",
        comment: "The magic system based on sympathy is so original!",
        timestamp: "1 week ago",
        likes: 6
      }
    ],
    genres: ["Fantasy", "Adventure"],
    clubCover: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=500",
    members: [
      { name: "Ethan Moore", avatar: "https://randomuser.me/api/portraits/men/8.jpg" }
    ]
  },
  {
    id: 6,
    bookClubName: "BIPOC Authors Collective",
    description: "The BIPOC Authors Collective is more than a book club - it's a celebration of diverse voices and a commitment to amplifying marginalized perspectives in literature. We intentionally select works by Black, Indigenous, and People of Color authors across genres, time periods, and geographical locations. Our discussions go beyond textual analysis to explore cultural contexts, publishing industry challenges, and how these stories contribute to broader conversations about identity and social justice. We maintain partnerships with local BIPOC-owned bookstores, host author Q&As, and organize community reading initiatives. Many meetings include 'Cultural Connection' segments where members share personal experiences or family histories related to the themes. Whether we're discussing contemporary novels, historical accounts, or poetic memoirs, we create space for both intellectual engagement and emotional resonance.",
    meetingFrequency: "Monthly on 1st Sunday",
    currentBook: {
      title: "The Hate U Give",
      author: "Angie Thomas",
      description: "A teen grapples with police brutality and activism after witnessing her friend's death.",
      cover: "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?w=500",
      progress: "Ch. 12 completed (12/26 chapters)",
      pagesRead: "180 of 444",
    },
    nextMeeting: {
      date: "June 5, 2023",
      time: "4:00 PM",
      location: "Community Center",
      agenda: "Discuss Starr's code-switching"
    },
    discussions: [
      {
        user: "Jasmine Williams",
        comment: "This book should be required reading. It's heartbreaking but necessary.",
        timestamp: "4 days ago",
        likes: 10
      }
    ],
    genres: ["Contemporary", "Social Justice"],
    clubCover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500",
    members: [
      { name: "Jasmine Williams", avatar: "https://randomuser.me/api/portraits/women/10.jpg" }
    ]
  },
  {
    id: 7,
    bookClubName: "Historical Fiction Society",
    description: "The Historical Fiction Society is a time traveler's paradise, where we use novels as portals to different eras while maintaining a historian's eye for accuracy. Our meetings feature 'Fact or Fiction' segments where we research which elements are historically verified, 'Alternate History' debates about how small changes might affect outcomes, and occasional show-and-tell with period artifacts. Many members are amateur historians or reenactors who bring specialized knowledge about particular time periods. We organize field trips to relevant museums or historical sites, and our holiday party is always era-appropriate to our current book. Whether you're fascinated by meticulously researched biographical fiction or enjoy more speculative 'what if' historicals, you'll appreciate our thoughtful approach to understanding the past through narrative.",
    meetingFrequency: "Every 6 weeks on Saturdays",
    currentBook: {
      title: "The Pillars of the Earth",
      author: "Ken Follett",
      description: "A 12th-century epic about the building of a cathedral and the lives it intertwines.",
      cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
      progress: "Part 3 completed (45/110 chapters)",
      pagesRead: "400 of 973",
    },
    nextMeeting: {
      date: "June 18, 2023",
      time: "3:00 PM",
      location: "St. Mary's Cathedral (for ambiance!)",
      agenda: "Medieval architecture & power struggles"
    },
    discussions: [
      {
        user: "Benjamin Martin",
        comment: "Follett makes stone masonry dramatic—how?!",
        timestamp: "2 weeks ago",
        likes: 3
      }
    ],
    genres: ["Historical Fiction", "Epic"],
    clubCover: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500",
    members: [
      { name: "Benjamin Martin", avatar: "https://randomuser.me/api/portraits/men/11.jpg" }
    ]
  },
  {
    id: 8,
    bookClubName: "Romance Readers Circle",
    description: "The Romance Readers Circle is a judgment-free zone where we celebrate love stories in all their forms - from sweet small-town romances to steamy historicals, LGBTQ+ love stories to paranormal pairings. Our meetings feature 'Trope Bingo' where we track favorite conventions, 'Chemistry Analysis' of memorable meet-cutes, and occasional writing workshops for aspiring romance authors. We maintain a 'Diversity in Romance' initiative to ensure we're reading across cultural experiences, and our annual 'Blind Date With a Book' event is legendary. Many members enjoy watching and comparing film adaptations together. Whether you're here for the emotional depth, the witty banter, or the guaranteed happy endings, you'll find kindred spirits who believe love stories deserve serious literary appreciation.",
    meetingFrequency: "Twice a month on Wednesdays",
    currentBook: {
      title: "Beach Read",
      author: "Emily Henry",
      description: "Two rival authors swap genres and unexpectedly fall in love.",
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500",
      progress: "Ch. 10 completed (10/24 chapters)",
      pagesRead: "150 of 384",
    },
    nextMeeting: {
      date: "June 8, 2023",
      time: "7:00 PM",
      location: "Virtual (Pajamas encouraged!)",
      agenda: "January & Gus's love-hate dynamic"
    },
    discussions: [
      {
        user: "Lily Scott",
        comment: "The banter is *chef's kiss*. Henry writes chemistry so well!",
        timestamp: "2 days ago",
        likes: 9
      }
    ],
    genres: ["Romance", "Contemporary"],
    clubCover: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
    members: [
      { name: "Lily Scott", avatar: "https://randomuser.me/api/portraits/women/13.jpg" }
    ]
  },
  {
    id: 9,
    bookClubName: "Horror Book Club",
    description: "The Horror Book Club is not for the faint of heart! We explore the psychology of fear through Gothic classics, psychological thrillers, supernatural chillers, and body horror. Our meetings feature 'Fright Night' readings of particularly scary passages with the lights dimmed, 'Trope Survival Guide' discussions of horror conventions, and annual Halloween events with costume contests. Many members enjoy analyzing horror films as companion pieces to our readings. We maintain a 'Scare Scale' rating system and content warnings for particularly intense material. Whether you're fascinated by the literary roots of horror in Poe and Shelley, the social commentary in modern horror, or just enjoy that delicious spine-tingling sensation, you'll find your people here. Just remember to bring a nightlight!",
    meetingFrequency: "Monthly on full moons",
    currentBook: {
      title: "The Haunting of Hill House",
      author: "Shirley Jackson",
      description: "A group investigates paranormal activity in a notoriously haunted mansion.",
      cover: "https://images.unsplash.com/photo-1600189261867-8e2c085aaf1d?w=500",
      progress: "Ch. 5 completed (5/9 chapters)",
      pagesRead: "80 of 246",
    },
    nextMeeting: {
      date: "June 4, 2023 (Full Moon)",
      time: "9:00 PM",
      location: "Candlelit Zoom",
      agenda: "Is the house haunted, or is Eleanor unstable?"
    },
    discussions: [
      {
        user: "Nathan Drake",
        comment: "That opening paragraph is the best in horror literature. Change my mind.",
        timestamp: "6 days ago",
        likes: 7
      }
    ],
    genres: ["Horror", "Gothic"],
    clubCover: "https://images.unsplash.com/photo-1518709766630-a6a1f151e8b3?w=500",
    members: [
      { name: "Nathan Drake", avatar: "https://randomuser.me/api/portraits/men/15.jpg" }
    ]
  },
  {
    id: 10,
    bookClubName: "Poetry & Prose",
    description: "Poetry & Prose is a sanctuary for lovers of language, where we savor words like fine wine. Our meetings combine close readings of poems with discussions of lyrical novels and short stories. We host 'Poetry Alchemy' sessions where we remix favorite poems into new forms, 'Prose Poetry' experiments blurring genre boundaries, and annual spoken word performances. Many members are writers who share their own work in our supportive environment. We explore how rhythm, metaphor, and structure create emotional impact, often comparing translations of international works. Whether you're drawn to the concise power of haiku, the musicality of sonnets, or the poetic prose of authors like Toni Morrison, you'll find kindred spirits who believe every word counts.",
    meetingFrequency: "Weekly on Mondays",
    currentBook: {
      title: "Milk and Honey",
      author: "Rupi Kaur",
      description: "A collection of poetry about survival, love, and healing.",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
      progress: "'The hurting' section completed",
      pagesRead: "60 of 208",
    },
    nextMeeting: {
      date: "June 6, 2023",
      time: "5:00 PM",
      location: "Park picnic (weather permitting)",
      agenda: "Discuss trauma & recovery themes"
    },
    discussions: [
      {
        user: "Sophie Lee",
        comment: "Kaur's minimalist style packs such emotional punch.",
        timestamp: "1 day ago",
        likes: 5
      }
    ],
    genres: ["Poetry", "Literary"],
    clubCover: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500",
    members: [
      { name: "Sophie Lee", avatar: "https://randomuser.me/api/portraits/women/17.jpg" }
    ]
  },
  {
    id: 11,
    bookClubName: "Young Adult Explorers",
    description: "The Young Adult Explorers club celebrates the vibrant world of YA literature with the enthusiasm it deserves. Our members range from teens to adults who appreciate the genre's emotional honesty and coming-of-age themes. We discuss how YA tackles contemporary issues, compare different subgenres (fantasy, contemporary, dystopian, etc.), and often invite teen readers to share their perspectives. Our meetings feature 'Throwback Thursdays' where we revisit our own teenage favorites, 'Adaptation Station' film viewings, and writing workshops for aspiring YA authors. We maintain a partnership with local schools to donate books and host reading events. Whether you're a lifelong YA fan or rediscovering the genre, you'll appreciate our thoughtful approach that never loses sight of the fun, fast-paced energy that makes YA so special.",
    meetingFrequency: "Monthly on last Friday",
    currentBook: {
      title: "The Fault in Our Stars",
      author: "John Green",
      description: "Two teens with cancer fall in love while grappling with mortality.",
      cover: "https://images.unsplash.com/photo-1584824486539-53bb4646bdbc?w=500",
      progress: "Ch. 7 completed (7/25 chapters)",
      pagesRead: "120 of 313",
    },
    nextMeeting: {
      date: "June 30, 2023",
      time: "6:00 PM",
      location: "Virtual",
      agenda: "Hazel & Augustus's Amsterdam trip"
    },
    discussions: [
      {
        user: "Zoe Carter",
        comment: "I've cried three times already. How is Green this good at writing teens?",
        timestamp: "3 days ago",
        likes: 8
      }
    ],
    genres: ["YA", "Contemporary"],
    clubCover: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500",
    members: [
      { name: "Zoe Carter", avatar: "https://randomuser.me/api/portraits/women/15.jpg" }
    ]
  },
  {
    id: 12,
    bookClubName: "Graphic Novel Guild",
    description: "The Graphic Novel Guild celebrates the unique art of visual storytelling in all its forms - from superhero comics to graphic memoirs, manga to experimental indie works. Our discussions analyze both artistic techniques (panel composition, color theory, lettering) and narrative structure. Meetings often feature 'Art Recreations' where members attempt to draw in different styles, 'Silent Panel' challenges interpreting wordless sequences, and interviews with comic artists. We maintain a lending library of rare graphic novels and organize trips to comic conventions. Many members are amateur artists who share sketchbooks, while others simply appreciate the medium's storytelling power. Whether you're into Pulitzer-winning graphic literature or Saturday morning funnies, you'll find passionate discussion about how words and images combine to create magic.",
    meetingFrequency: "Monthly on 2nd Saturday",
    currentBook: {
      title: "Persepolis",
      author: "Marjane Satrapi",
      description: "A memoir of growing up during the Iranian Revolution, told in bold black-and-white art.",
      cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
      progress: "Part 1 completed",
      pagesRead: "80 of 153",
    },
    nextMeeting: {
      date: "June 11, 2023",
      time: "1:00 PM",
      location: "Comic Book Store",
      agenda: "Discuss Satrapi's artistic style"
    },
    discussions: [
      {
        user: "Alex Wong",
        comment: "The simplicity of the art makes the heavy themes hit even harder.",
        timestamp: "1 week ago",
        likes: 6
      }
    ],
    genres: ["Graphic Novel", "Memoir"],
    clubCover: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500",
    members: [
      { name: "Alex Wong", avatar: "https://randomuser.me/api/portraits/men/16.jpg" }
    ]
  }
];

export default bookClubsData;