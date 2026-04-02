export const ENGLISH_STARTER_QUIZ = {
  id: "english-starter-msce",
  subject: "English",
  topic: "Grammar & Vocabulary Mastery",
  questionsCount: 10,
  timeLimit: "15 mins",
  color: "bg-blue-600",
  isPremiumOnly: false,
  questions: [
    {
      id: "q1",
      question: "Which of the following sentences contains a relative clause?",
      options: [
        "The boy who won the race is my brother.",
        "He ran very fast to win the race.",
        "Winning the race was his goal.",
        "He won the race easily."
      ],
      correctAnswer: 0,
      difficulty: "difficult",
      explanation: "A relative clause starts with a relative pronoun (who, which, that, etc.) and describes a noun."
    },
    {
      id: "q2",
      question: "Choose the correct order of adjectives: 'She bought a ______ bag.'",
      options: [
        "beautiful small leather Italian",
        "small beautiful Italian leather",
        "beautiful small Italian leather",
        "Italian beautiful small leather"
      ],
      correctAnswer: 2,
      difficulty: "difficult",
      explanation: "The standard order is: Opinion, Size, Age, Shape, Color, Origin, Material, Purpose."
    },
    {
      id: "q3",
      question: "What does the idiom 'to kick the bucket' mean?",
      options: [
        "To start a new project",
        "To die",
        "To be very angry",
        "To complain loudly"
      ],
      correctAnswer: 1,
      difficulty: "simple",
      explanation: "'To kick the bucket' is a common idiom meaning to pass away."
    },
    {
      id: "q4",
      question: "Identify the word register for the following sentence: 'The patient presents with acute myocardial infarction.'",
      options: [
        "Legal",
        "Medical",
        "Scientific",
        "Journalistic"
      ],
      correctAnswer: 1,
      difficulty: "medium",
      explanation: "Terms like 'patient' and 'myocardial infarction' belong to the medical register."
    },
    {
      id: "q5",
      question: "Add the correct question tag: 'You haven't finished your homework, ______?'",
      options: [
        "haven't you",
        "have you",
        "did you",
        "don't you"
      ],
      correctAnswer: 1,
      difficulty: "simple",
      explanation: "A negative statement takes a positive question tag."
    },
    {
      id: "q6",
      question: "Which part of speech is the underlined word? 'The <u>fast</u> runner won the gold medal.'",
      options: [
        "Adverb",
        "Adjective",
        "Noun",
        "Verb"
      ],
      correctAnswer: 1,
      difficulty: "difficult",
      explanation: "In this context, 'fast' describes the noun 'runner', so it is an adjective."
    },
    {
      id: "q7",
      question: "Identify the type of clause: 'Although it was raining, we went for a walk.'",
      options: [
        "Main clause",
        "Adverbial clause of concession",
        "Noun clause",
        "Relative clause"
      ],
      correctAnswer: 1,
      difficulty: "difficult",
      explanation: "The clause 'Although it was raining' expresses a contrast or concession."
    },
    {
      id: "q8",
      question: "In the register of 'Law', what does 'affidavit' mean?",
      options: [
        "A written statement confirmed by oath",
        "A person who commits a crime",
        "The final decision of a judge",
        "A request to a higher court"
      ],
      correctAnswer: 0,
      difficulty: "difficult",
      explanation: "An affidavit is a formal written statement used as evidence in court."
    },
    {
      id: "q9",
      question: "Which of these is a complex sentence?",
      options: [
        "I like tea and he likes coffee.",
        "She went to the market because she needed milk.",
        "The sun rose in the east.",
        "He is tall, dark, and handsome."
      ],
      correctAnswer: 1,
      difficulty: "difficult",
      explanation: "A complex sentence contains one independent clause and at least one dependent clause (starting with 'because')."
    },
    {
      id: "q10",
      question: "What is the meaning of the idiom 'a blessing in disguise'?",
      options: [
        "A gift that is hidden",
        "A good thing that seemed bad at first",
        "A religious ceremony",
        "A person who is very kind"
      ],
      correctAnswer: 1,
      difficulty: "difficult",
      explanation: "This idiom refers to an unfortunate event that eventually results in something positive."
    }
  ]
};
