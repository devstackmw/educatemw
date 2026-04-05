import { db } from "@/firebase";
import { collection, addDoc, getDocs, query, where, doc, setDoc } from "firebase/firestore";

export async function seedInitialData() {
  const quizzesCheck = await getDocs(collection(db, "quizzes"));
  if (quizzesCheck.size > 0) return; // Already seeded

  console.log("Seeding initial data...");

  // 1. Quizzes
  const quizData = [
    {
      subject: "Agriculture",
      topic: "Soil Science",
      questionsCount: 5,
      timeLimit: "5 mins",
      color: "bg-emerald-500",
      isPremiumOnly: false,
      questions: [
        {
          text: "Which of the following is a primary macronutrient for plants?",
          options: ["Iron", "Nitrogen", "Zinc", "Copper"],
          correctAnswerIndex: 1
        },
        {
          text: "What is the process of wearing away of the topsoil called?",
          options: ["Irrigation", "Erosion", "Mulching", "Tillage"],
          correctAnswerIndex: 1
        },
        {
          text: "Which type of soil has the smallest particles?",
          options: ["Sand", "Silt", "Clay", "Loam"],
          correctAnswerIndex: 2
        },
        {
          text: "What is the ideal pH range for most crops?",
          options: ["3.0 - 4.0", "6.0 - 7.5", "9.0 - 10.0", "1.0 - 2.0"],
          correctAnswerIndex: 1
        },
        {
          text: "Which of these is an organic fertilizer?",
          options: ["Urea", "NPK", "Compost", "Ammonium Nitrate"],
          correctAnswerIndex: 2
        }
      ]
    },
    {
      subject: "Geography",
      topic: "Map Reading",
      questionsCount: 3,
      timeLimit: "3 mins",
      color: "bg-blue-500",
      isPremiumOnly: false,
      questions: [
        {
          text: "What do contour lines close together on a map indicate?",
          options: ["Flat land", "Steep slope", "Gentle slope", "A river"],
          correctAnswerIndex: 1
        },
        {
          text: "Which direction is 180 degrees on a compass?",
          options: ["North", "East", "South", "West"],
          correctAnswerIndex: 2
        },
        {
          text: "What is the ratio between distance on a map and distance on the ground called?",
          options: ["Legend", "Scale", "Grid", "Title"],
          correctAnswerIndex: 1
        }
      ]
    }
  ];

  for (const q of quizData) {
    const { questions, ...quizInfo } = q;
    const quizRef = await addDoc(collection(db, "quizzes"), quizInfo);
    for (const question of questions) {
      await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), question);
    }
  }

  // 2. Flashcards
  const flashcardData = [
    {
      subject: "Physics",
      topic: "Energy & Power",
      cardsCount: 4,
      color: "bg-purple-600",
      isPremiumOnly: false,
      cards: [
        { front: "What is the SI unit of Energy?", back: "Joule (J)" },
        { front: "Define Power.", back: "The rate at which work is done or energy is transferred." },
        { front: "What is Kinetic Energy?", back: "Energy possessed by an object due to its motion." },
        { front: "Law of Conservation of Energy", back: "Energy cannot be created or destroyed, only transformed from one form to another." }
      ]
    }
  ];

  for (const set of flashcardData) {
    const { cards, ...setInfo } = set;
    const setRef = await addDoc(collection(db, "flashcardSets"), setInfo);
    for (const card of cards) {
      await addDoc(collection(db, `flashcardSets/${setRef.id}/cards`), card);
    }
  }

  console.log("Seeding complete!");
}

export async function seedLeaderboard() {
  console.log("Seeding leaderboard...");
  const mockStudents = [
    { displayName: "Chifundo Banda", points: 2450, streak: 12, isPremium: true, avatarId: "boy_1", isBanned: false },
    { displayName: "Tiwonge Phiri", points: 2100, streak: 8, isPremium: true, avatarId: "girl_1", isBanned: false },
    { displayName: "Kondwani Mwale", points: 1850, streak: 15, isPremium: false, avatarId: "boy_1", isBanned: false },
    { displayName: "Lumbani Gondwe", points: 1600, streak: 5, isPremium: true, avatarId: "girl_1", isBanned: false },
    { displayName: "Atusaye Nyirenda", points: 1450, streak: 3, isPremium: false, avatarId: "boy_1", isBanned: false },
    { displayName: "Memory Chiumia", points: 1200, streak: 7, isPremium: true, avatarId: "girl_1", isBanned: false },
    { displayName: "Blessings Kamanga", points: 950, streak: 2, isPremium: false, avatarId: "boy_1", isBanned: false },
    { displayName: "Tamara Zimba", points: 800, streak: 4, isPremium: true, avatarId: "girl_1", isBanned: false },
  ];

  for (const student of mockStudents) {
    const uid = "mock_" + Math.random().toString(36).substring(2, 8);
    await setDoc(doc(db, "userStats", uid), {
      uid,
      ...student,
      lastActiveDate: new Date().toISOString().split('T')[0]
    });
  }
  console.log("Leaderboard seeding complete!");
}
