const booksData = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "https://i.pinimg.com/474x/ea/87/e5/ea87e5dd6bd36ccea9299fc024f08c09.jpg",
      rating: 4.02,
      genres: ["Fiction", "Fantasy", "Self-Help"],
      description: "A novel about a library that allows you to live different lives and explore alternate realities.",
      founder: "Matt Haig",
      ratingReview: "A thought-provoking and heartwarming story about choices and regrets."
    },
    {
      id: 2,
      title: "Dune",
      author: "Frank Herbert",
      cover: "https://i.pinimg.com/474x/14/a7/48/14a74879788212584f4b59c22c5e6d99.jpg",
      rating: 4.25,
      genres: ["Science Fiction", "Classic", "Adventure"],
      description: "A science fiction epic about politics, religion, and ecology on the desert planet Arrakis.",
      founder: "Frank Herbert",
      ratingReview: "A masterpiece of science fiction with complex characters and world-building."
    },
    {
      id: 3,
      title: "Where the Crawdads Sing",
      author: "Delia Owens",
      cover: "https://i.pinimg.com/474x/70/27/ca/7027ca56ac260a52ff0a88700123d6f9.jpg",
      rating: 4.46,
      genres: ["Fiction", "Mystery", "Literary Fiction"],
      description: "A coming-of-age story and murder mystery set in the marshes of North Carolina.",
      founder: "Delia Owens",
      ratingReview: "Beautifully written with a compelling mystery and rich natural descriptions."
    },
    {
      id: 4,
      title: "Atomic Habits",
      author: "James Clear",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
      rating: 4.37,
      genres: ["Nonfiction", "Self-Help", "Psychology"],
      description: "A guide to building good habits and breaking bad ones through small changes.",
      founder: "James Clear",
      ratingReview: "Practical advice backed by scientific research on habit formation."
    },
    {
      id: 5,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81LByMrR3VL.jpg",
      rating: 4.18,
      genres: ["Thriller", "Mystery", "Psychological Fiction"],
      description: "A psychological thriller about a woman who stops speaking after a violent incident.",
      founder: "Alex Michaelides",
      ratingReview: "A gripping and twisty thriller that keeps you guessing until the end."
    },
    {
      id: 6,
      title: "Project Hail Mary",
      author: "Andy Weir",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91XKEeOQolL.jpg",
      rating: 4.52,
      genres: ["Science Fiction", "Adventure", "Space Opera"],
      description: "A lone astronaut's mission to save Earth from an extinction-level threat.",
      founder: "Andy Weir",
      ratingReview: "An exciting and scientifically grounded space adventure."
    },
    {
      id: 7,
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91a-dLmEExL.jpg",
      rating: 4.45,
      genres: ["Historical Fiction", "LGBTQ+", "Romance"],
      description: "The life story of a legendary Hollywood actress and her seven marriages.",
      founder: "Taylor Jenkins Reid",
      ratingReview: "A captivating and emotional story about love, fame, and identity."
    },
    {
      id: 8,
      title: "Educated",
      author: "Tara Westover",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91gtDQLqHaL.jpg",
      rating: 4.47,
      genres: ["Memoir", "Biography", "Nonfiction"],
      description: "A memoir about a woman who grows up in a strict family and pursues education.",
      founder: "Tara Westover",
      ratingReview: "Inspiring and powerful story of resilience and self-discovery."
    },
    {
      id: 9,
      title: "The Song of Achilles",
      author: "Madeline Miller",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91Q9SkkVJfL.jpg",
      rating: 4.35,
      genres: ["Historical Fiction", "Fantasy", "LGBTQ+"],
      description: "A retelling of the Iliad from the perspective of Patroclus.",
      founder: "Madeline Miller",
      ratingReview: "A beautifully written and emotional take on Greek mythology."
    },
    {
      id: 10,
      title: "Normal People",
      author: "Sally Rooney",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81JdJtJzcVL.jpg",
      rating: 3.86,
      genres: ["Contemporary", "Literary Fiction", "Romance"],
      description: "A story about the complex relationship between two young people.",
      founder: "Sally Rooney",
      ratingReview: "A nuanced and intimate portrayal of love and friendship."
    },
    {
      id: 11,
      title: "Circe",
      author: "Madeline Miller",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91RZR8ZtXEL.jpg",
      rating: 4.27,
      genres: ["Fantasy", "Historical Fiction", "Mythology"],
      description: "The story of the enchantress Circe from Greek mythology.",
      founder: "Madeline Miller",
      ratingReview: "A fresh and feminist retelling of a classic myth."
    },
    {
      id: 12,
      title: "The Vanishing Half",
      author: "Brit Bennett",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81Q8Us50SRL.jpg",
      rating: 4.15,
      genres: ["Historical Fiction", "Literary Fiction", "Race"],
      description: "A story about twin sisters who live very different lives.",
      founder: "Brit Bennett",
      ratingReview: "A thought-provoking exploration of identity and family."
    },
    {
      id: 13,
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81Kgc9aWEZL.jpg",
      rating: 3.92,
      genres: ["Science Fiction", "Dystopian", "Literary Fiction"],
      description: "A story about an artificial friend observing human life.",
      founder: "Kazuo Ishiguro",
      ratingReview: "A poignant and philosophical science fiction novel."
    },
    {
      id: 14,
      title: "The Invisible Life of Addie LaRue",
      author: "V.E. Schwab",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91XlYt0yQVL.jpg",
      rating: 3.98,
      genres: ["Fantasy", "Historical Fiction", "Magical Realism"],
      description: "A story about a woman cursed to be forgotten by everyone she meets.",
      founder: "V.E. Schwab",
      ratingReview: "A beautifully crafted tale of memory and identity."
    },
    {
      id: 15,
      title: "Malibu Rising",
      author: "Taylor Jenkins Reid",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91S5+3OZkZL.jpg",
      rating: 4.08,
      genres: ["Historical Fiction", "Contemporary", "Family Drama"],
      description: "A story about a famous family and a legendary party in Malibu.",
      founder: "Taylor Jenkins Reid",
      ratingReview: "An engaging and emotional family drama."
    }
  ];
  
  export default booksData;
