const booksData = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://i.pinimg.com/474x/ea/87/e5/ea87e5dd6bd36ccea9299fc024f08c09.jpg",
    rating: 4.02,
    genres: ["Fiction", "Fantasy", "Self-Help"],
    description: "Between life and death there is a library where the shelves go on forever. Every book provides a chance to try another life you could have lived. Nora Seed finds herself here after attempting suicide, guided by her childhood librarian Mrs. Elm. As she tries different versions of her life - as a glaciologist, Olympic swimmer, rock star, and more - she must confront her regrets and discover what truly makes life worth living. This poignant novel blends magical realism with profound philosophical questions about choice and happiness.",
    pages: 304,
    published: "August 13, 2020",
    founder: "Matt Haig",
    ratingReview: "A thought-provoking and heartwarming story about choices and regrets.",
    reviews: [
      {
        title: "Life-Changing Perspective",
        description: "This book made me reflect deeply on my own choices. Haig's writing is accessible yet profound.",
        username: "BookLover42"
      },
      {
        title: "Beautiful but Flawed",
        description: "Loved the premise but some alternate lives felt rushed. Still stays with you long after reading.",
        username: "LiteraryExplorer"
      }
    ]
  },
  {
    id: 2,
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://i.pinimg.com/474x/14/a7/48/14a74879788212584f4b59c22c5e6d99.jpg",
    rating: 4.25,
    genres: ["Science Fiction", "Classic", "Adventure"],
    description: "Set in the distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides, whose family accepts control of the desert planet Arrakis. As this planet is the only source of the 'spice' melange, the most valuable substance in the universe, control of Arrakis is highly contested. When Paul and his family are betrayed, he must lead the Fremen, Arrakis's native inhabitants, in a battle for control of the planet and its spice. This epic explores themes of politics, religion, ecology, and human emotion.",
    pages: 412,
    published: "August 1, 1965",
    founder: "Frank Herbert",
    ratingReview: "A masterpiece of science fiction with complex characters and world-building.",
    reviews: [
      {
        title: "The Sci-Fi Bible",
        description: "Herbert created an entire universe with its own ecology, politics and religion. Mind-blowing in scope.",
        username: "SciFiNerd"
      },
      {
        title: "Dense but Rewarding",
        description: "The first 100 pages are challenging with all the terminology, but once it clicks, it's unforgettable.",
        username: "PatientReader"
      }
    ]
  },
  {
    id: 3,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    cover: "https://i.pinimg.com/474x/70/27/ca/7027ca56ac260a52ff0a88700123d6f9.jpg",
    rating: 4.46,
    genres: ["Fiction", "Mystery", "Literary Fiction"],
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. In 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl. But Kya is not what they say. Abandoned by her family, she has survived alone in the marsh that she calls home, finding friends in the gulls and lessons in the sand. When two young men become intrigued by her wild beauty, Kya opens herself to a new life - until the unthinkable happens. This atmospheric novel is both a coming-of-age story and a murder mystery.",
    pages: 384,
    published: "August 14, 2018",
    founder: "Delia Owens",
    ratingReview: "Beautifully written with a compelling mystery and rich natural descriptions.",
    reviews: [
      {
        title: "Nature as a Character",
        description: "The marsh is so vividly described it becomes a main character. Owens' background as a wildlife scientist shines.",
        username: "NatureWriter"
      },
      {
        title: "Overhyped but Good",
        description: "The prose is beautiful but the plot has some predictable elements. Still worth reading for the atmosphere.",
        username: "CriticalReader"
      }
    ]
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
    rating: 4.37,
    genres: ["Nonfiction", "Self-Help", "Psychology"],
    description: "No matter your goals, Atomic Habits offers a proven framework for improving - every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. Drawing on insights from biology, psychology, and neuroscience, Clear creates an easy-to-understand guide for making good habits inevitable and bad habits impossible. The book will reshape how you think about progress and success.",
    pages: 320,
    published: "October 16, 2018",
    founder: "James Clear",
    ratingReview: "Practical advice backed by scientific research on habit formation.",
    reviews: [
      {
        title: "Actually Changed My Life",
        description: "Implemented the 1% better every day concept and it's transformed my productivity. Simple but powerful.",
        username: "HabitChanger"
      },
      {
        title: "Repackaged Wisdom",
        description: "Good advice but not revolutionary if you've read other habit books. Well-organized though.",
        username: "SelfHelpVeteran"
      }
    ]
  },
  {
    id: 5,
    title: "The Silent Patient",
    author: "Alex Michaelides",
    cover: "https://images-na.ssl-images-amazon.com/images/I/81LByMrR3VL.jpg",
    rating: 4.18,
    genres: ["Thriller", "Mystery", "Psychological Fiction"],
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening, her husband Gabriel returns home late, and Alicia shoots him five times in the face and then never speaks another word. Theo Faber is a criminal psychotherapist who waits years for the chance to work with Alicia. His determination to get her to talk and unravel the mystery of why she shot her husband takes him down a twisting path into his own motivations.",
    pages: 325,
    published: "February 5, 2019",
    founder: "Alex Michaelides",
    ratingReview: "A gripping and twisty thriller that keeps you guessing until the end.",
    reviews: [
      {
        title: "Did NOT See That Coming",
        description: "The twist completely blindsided me. One of the best psychological thrillers I've read in years.",
        username: "ThrillerFanatic"
      },
      {
        title: "Overrated Twist",
        description: "The buildup was great but the ending felt gimmicky to me. Still an entertaining read.",
        username: "MysteryLover"
      }
    ]
  },
  {
    id: 6,
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91XKEeOQolL.jpg",
    rating: 4.52,
    genres: ["Science Fiction", "Adventure", "Space Opera"],
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission - and if he fails, humanity and Earth itself will perish. Except he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it. As he gradually pieces together his memory, he realizes an impossible task now confronts him. Hurtling through space with only two corpses for company, he must conquer an extinction-level threat to our species. With shades of The Martian, this novel blends scientific problem-solving with first contact narrative.",
    pages: 496,
    published: "May 4, 2021",
    founder: "Andy Weir",
    ratingReview: "An exciting and scientifically grounded space adventure.",
    reviews: [
      {
        title: "Better Than The Martian",
        description: "Rocky is the best alien character ever created. The science is fascinating but the heart of the story is unforgettable.",
        username: "SpaceGeek"
      },
      {
        title: "Science Over Story",
        description: "The technical details are impressive but the emotional beats didn't always land for me.",
        username: "CharacterReader"
      }
    ]
  },
  {
    id: 7,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91a-dLmEExL.jpg",
    rating: 4.45,
    genres: ["Historical Fiction", "LGBTQ+", "Romance"],
    description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life. When she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself. As Evelyn unfurls her story - revealing her ruthless ambition, unexpected friendship, and forbidden great love - Monique begins to feel a very real connection to the actress. But as Evelyn's story nears its conclusion, it becomes clear that her life intersects with Monique's own in tragic and irreversible ways.",
    pages: 389,
    published: "June 13, 2017",
    founder: "Taylor Jenkins Reid",
    ratingReview: "A captivating and emotional story about love, fame, and identity.",
    reviews: [
      {
        title: "Evelyn Hugo Stays With You",
        description: "This fictional star feels more real than actual celebrities. Her complexity and flaws make her unforgettable.",
        username: "OldHollywoodFan"
      },
      {
        title: "Overly Dramatic",
        description: "Enjoyable but sometimes the twists felt contrived. Great examination of Hollywood's golden age though.",
        username: "RealisticReader"
      }
    ]
  },
  {
    id: 8,
    title: "Educated",
    author: "Tara Westover",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91gtDQLqHaL.jpg",
    rating: 4.47,
    genres: ["Memoir", "Biography", "Nonfiction"],
    description: "Tara Westover was seventeen the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her 'head-for-the-hills' bag. Her father distrusted the medical establishment, so Tara never saw a doctor or nurse. The family was so isolated from mainstream society that there was no one to ensure the children received an education. This memoir traces Westover's journey from her isolated childhood through her doctoral studies at Cambridge University, exploring her struggle to reconcile her love for her family with her desire for education.",
    pages: 334,
    published: "February 20, 2018",
    founder: "Tara Westover",
    ratingReview: "Inspiring and powerful story of resilience and self-discovery.",
    reviews: [
      {
        title: "Unputdownable",
        description: "Read this in one sitting. Her journey from isolation to Cambridge is astonishing. The prose is razor-sharp.",
        username: "MemoirLover"
      },
      {
        title: "Questionable Accuracy",
        description: "Powerful story but some family members dispute her account. Makes you think about memory's subjectivity.",
        username: "FactChecker"
      }
    ]
  },
  {
    id: 9,
    title: "The Song of Achilles",
    author: "Madeline Miller",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91Q9SkkVJfL.jpg",
    rating: 4.35,
    genres: ["Historical Fiction", "Fantasy", "LGBTQ+"],
    description: "Greece in the age of heroes. Young prince Patroclus has been exiled to the court of King Peleus, where he meets Peleus's golden son Achilles. Despite their differences, Achilles befriends the shamed prince, and as they grow into young men skilled in the arts of war and medicine, their bond blossoms into something deeper. When word comes that Helen of Sparta has been kidnapped, Achilles joins the cause, and Patroclus follows. Little do they know the terrible cost this war will exact. Miller's retelling of the Iliad focuses on the passionate relationship between Achilles and Patroclus.",
    pages: 378,
    published: "August 28, 2012",
    founder: "Madeline Miller",
    ratingReview: "A beautifully written and emotional take on Greek mythology.",
    reviews: [
      {
        title: "Destroyed Me",
        description: "I knew how it would end but still wasn't prepared. Miller makes ancient characters feel contemporary.",
        username: "ClassicsMajor"
      },
      {
        title: "Overly Romanticized",
        description: "Beautiful prose but takes too many liberties with the original myth for my taste.",
        username: "HomerPurist"
      }
    ]
  },
  {
    id: 10,
    title: "Normal People",
    author: "Sally Rooney",
    cover: "https://images-na.ssl-images-amazon.com/images/I/81JdJtJzcVL.jpg",
    rating: 3.86,
    genres: ["Contemporary", "Literary Fiction", "Romance"],
    description: "Connell and Marianne grow up in the same small town in rural Ireland. The similarities end there. Connell is popular in school, a star of the football team, while Marianne is a loner. When the two strike up a conversation, something life-changing begins. Moving through their college years, Marianne and Connell circle each other, falling in and out of romance, struggling with mental health issues, and navigating class differences. Rooney's spare, precise prose captures the minute shifts in their relationship with devastating accuracy.",
    pages: 273,
    published: "August 28, 2018",
    founder: "Sally Rooney",
    ratingReview: "A nuanced and intimate portrayal of love and friendship.",
    reviews: [
      {
        title: "Millennial Love Story",
        description: "Rooney perfectly captures modern relationships with all their miscommunications and complexities.",
        username: "TwentySomething"
      },
      {
        title: "Too Much Nothing",
        description: "Beautiful writing but nothing really happens. The characters frustrated me with their passivity.",
        username: "PlotDrivenReader"
      }
    ]
  },
  {
    id: 11,
    title: "Circe",
    author: "Madeline Miller",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91RZR8ZtXEL.jpg",
    rating: 4.27,
    genres: ["Fantasy", "Historical Fiction", "Mythology"],
    description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child - not powerful, like her father, nor viciously alluring, like her mother. When her gift of witchcraft is revealed, Zeus banishes her to a deserted island. There she hones her occult craft, casting spells, gathering strange herbs, and taming wild beasts. Yet a woman who stands alone will never be left in peace for long. This novel reimagines the life of Circe, the legendary witch who appears in the Odyssey, giving voice to one of mythology's most misunderstood women.",
    pages: 393,
    published: "April 10, 2018",
    founder: "Madeline Miller",
    ratingReview: "A fresh and feminist retelling of a classic myth.",
    reviews: [
      {
        title: "Witchcraft as Empowerment",
        description: "Circe's transformation from meek nymph to powerful witch is masterfully done. Finally a myth told from the woman's perspective!",
        username: "FeministReader"
      },
      {
        title: "Slow Start",
        description: "Took about 100 pages to grab me but then I couldn't put it down. Her encounters with famous myths are brilliant.",
        username: "PersistentReader"
      }
    ]
  },
  {
    id: 12,
    title: "The Vanishing Half",
    author: "Brit Bennett",
    cover: "https://images-na.ssl-images-amazon.com/images/I/81Q8Us50SRL.jpg",
    rating: 4.15,
    genres: ["Historical Fiction", "Literary Fiction", "Race"],
    description: "The Vignes twin sisters will always be identical. But after growing up together in a small, southern black community and running away at age sixteen, their lives diverge. One sister lives with her black daughter in the same southern town she once tried to escape. The other secretly passes for white, and her white husband knows nothing of her past. Still, even separated by so many miles and just as many lies, the fates of the twins remain intertwined. Spanning from the 1950s to the 1990s, this novel explores issues of race, identity, family, and the American culture of passing.",
    pages: 343,
    published: "June 2, 2020",
    founder: "Brit Bennett",
    ratingReview: "A thought-provoking exploration of identity and family.",
    reviews: [
      {
        title: "Generational Storytelling",
        description: "Bennett handles the complex themes with such nuance. The different timelines weave together beautifully.",
        username: "LiteraryLover"
      },
      {
        title: "Wanted More Depth",
        description: "Great premise but some characters felt underdeveloped. The racial passing theme could have been explored more deeply.",
        username: "CriticalThinker"
      }
    ]
  },
  {
    id: 13,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    cover: "https://images-na.ssl-images-amazon.com/images/I/81Kgc9aWEZL.jpg",
    rating: 3.92,
    genres: ["Science Fiction", "Dystopian", "Literary Fiction"],
    description: "Klara is an Artificial Friend with outstanding observational qualities who remains in the store waiting to be chosen by a customer. When a girl named Josie selects her, Klara is taken to the family's home where she learns that Josie is fragile and may not have long to live. Through Klara's unique perspective - she is powered by the Sun and interprets the world differently than humans - Ishiguro explores fundamental questions: What does it mean to love? What does it mean to be human? Set in a dystopian future of genetic engineering and social stratification.",
    pages: 307,
    published: "March 2, 2021",
    founder: "Kazuo Ishiguro",
    ratingReview: "A poignant and philosophical science fiction novel.",
    reviews: [
      {
        title: "Quietly Devastating",
        description: "Klara's voice is so distinctive and moving. Ishiguro makes you feel the tragedy of her artificial consciousness.",
        username: "NobelAdmirer"
      },
      {
        title: "Too Slow",
        description: "Beautiful writing but the plot moves at a glacial pace. The dystopian elements felt underdeveloped.",
        username: "PacingMatters"
      }
    ]
  },
  {
    id: 14,
    title: "The Invisible Life of Addie LaRue",
    author: "V.E. Schwab",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91XlYt0yQVL.jpg",
    rating: 3.98,
    genres: ["Fantasy", "Historical Fiction", "Magical Realism"],
    description: "France, 1714: In a moment of desperation, a young woman makes a Faustian bargain to live forever - and is cursed to be forgotten by everyone she meets. Addie LaRue's life becomes a series of encounters and departures, as she learns to navigate a world where no one remembers her. Everything changes when, after nearly 300 years, Addie stumbles across a young man in a hidden bookstore who remembers her name. This sweeping narrative moves back and forth in time, from Addie's early years in France to her adventures across centuries and continents.",
    pages: 448,
    published: "October 6, 2020",
    founder: "V.E. Schwab",
    ratingReview: "A beautifully crafted tale of memory and identity.",
    reviews: [
      {
        title: "Concept Over Execution",
        description: "The premise is brilliant but the middle section drags. Henry's chapters were less compelling than Addie's historical ones.",
        username: "ConceptLover"
      },
      {
        title: "New Favorite Book",
        description: "Addie's 300-year journey is mesmerizing. The ending had me in tears. Schwab's best work yet!",
        username: "FantasyFan"
      }
    ]
  },
  {
    id: 15,
    title: "Malibu Rising",
    author: "Taylor Jenkins Reid",
    cover: "https://images-na.ssl-images-amazon.com/images/I/91S5+3OZkZL.jpg",
    rating: 4.08,
    genres: ["Historical Fiction", "Contemporary", "Family Drama"],
    description: "Malibu: August 1983. Together the siblings are a source of fascination in Malibu and the world over - especially as the offspring of the legendary singer Mick Riva. By midnight the party will be completely out of control. By morning, the Riva mansion will have gone up in flames. This novel tells the story of one unforgettable night in the life of a family, exploring the bonds between siblings and the weight of famous parentage.",
    pages: 369,
    published: "May 25, 2021",
    founder: "Taylor Jenkins Reid",
    ratingReview: "An engaging and emotional family drama.",
    reviews: [
      {
        title: "Summer in Book Form",
        description: "The atmosphere is so vivid you can almost smell the saltwater. Reid excels at creating compelling family dynamics.",
        username: "BeachReader"
      },
      {
        title: "Too Many Characters",
        description: "Enjoyable but the large cast meant some storylines felt underdeveloped. The party scenes were chaotic in a good way.",
        username: "CharacterFocus"
      }
    ]
  }
];

export default booksData;