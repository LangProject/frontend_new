// src/lessons/lessonsData.ts

export type StepType =
  | "info"
  | "select_one"
  | "match_pairs"
  | "reorder"
  | "fill_blank"
  | "error_id"
  | "input_text";

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Pair {
  left: string;
  right: string;
}

export interface LessonStep {
  type: StepType;
  title?: string;
  question?: string;
  options?: Option[];
  pairs?: Pair[];
  words?: string[];
  correctOrder?: number[];
  correctIndex?: number;
  correctText?: string | string[];
  context?: string;
}

export interface LessonData {
  id: string;
  title: string;
  steps: LessonStep[];
}

// Тип для хранилища: Уровень -> ID урока -> Данные урока
type LessonsByLevel = Record<string, Record<string, LessonData>>;

// ==========================================
// 🗄️ БАЗА ДАННЫХ ВСЕХ УРОКОВ
// ==========================================
const ALL_LESSONS: LessonsByLevel = {
  // ==========================
  // 🟢 УРОВЕНЬ A1 (Новичок)
  // ==========================
  A1: {
    // --- Reading ---
    reading_1: {
      id: "reading_1",
      title: "Basics (A1)",
      steps: [
        {
          type: "info",
          title: "Welcome!",
          question: "Start with basic words.",
        },
        {
          type: "select_one",
          title: "Translate 'Boy'",
          question: "Niño",
          options: [
            { id: "1", text: "Girl" },
            { id: "2", text: "Boy", isCorrect: true },
            { id: "3", text: "Man" },
          ],
        },
        {
          type: "match_pairs",
          title: "Match Basics",
          pairs: [
            { left: "Hola", right: "Hello" },
            { left: "Adiós", right: "Bye" },
          ],
        },
      ],
    },
    reading_2: {
      id: "reading_2",
      title: "Animals (A1)",
      steps: [
        {
          type: "select_one",
          title: "Translate 'Cat'",
          question: "Gato",
          options: [
            { id: "1", text: "Dog" },
            { id: "2", text: "Cat", isCorrect: true },
          ],
        },
        {
          type: "fill_blank",
          title: "The dog is big",
          context: "El _____ es grande",
          options: [
            { id: "1", text: "perro", isCorrect: true },
            { id: "2", text: "gato" },
          ],
        },
      ],
    },
    reading_3: {
      id: "reading_3",
      title: "Simple Phrases (A1)",
      steps: [
        {
          type: "reorder",
          title: "I am a student",
          question: "Translate: I am a student",
          words: ["Soy", "estudiante", "un"],
          correctOrder: [0, 2, 1],
        },
      ],
    },

    // --- Vocabulary ---
    vocabulary_1: {
      id: "vocabulary_1",
      title: "Food (A1)",
      steps: [
        {
          type: "match_pairs",
          title: "Food",
          pairs: [
            { left: "Manzana", right: "Apple" },
            { left: "Pan", right: "Bread" },
            { left: "Agua", right: "Water" },
          ],
        },
        {
          type: "select_one",
          title: "Milk",
          question: "Leche",
          options: [
            { id: "1", text: "Milk", isCorrect: true },
            { id: "2", text: "Coffee" },
          ],
        },
      ],
    },
    vocabulary_2: {
      id: "vocabulary_2",
      title: "Family (A1)",
      steps: [
        {
          type: "select_one",
          title: "Mother",
          question: "Madre",
          options: [
            { id: "1", text: "Sister" },
            { id: "2", text: "Mother", isCorrect: true },
          ],
        },
        {
          type: "match_pairs",
          title: "Family",
          pairs: [
            { left: "Papá", right: "Dad" },
            { left: "Hermano", right: "Brother" },
          ],
        },
      ],
    },
    vocabulary_3: {
      id: "vocabulary_3",
      title: "Colors (A1)",
      steps: [
        {
          type: "select_one",
          title: "Red",
          question: "Rojo",
          options: [
            { id: "1", text: "Blue" },
            { id: "2", text: "Red", isCorrect: true },
          ],
        },
        {
          type: "fill_blank",
          title: "The car is blue",
          context: "El coche es _____",
          options: [
            { id: "1", text: "azul", isCorrect: true },
            { id: "2", text: "rojo" },
          ],
        },
      ],
    },

    // --- Writing ---
    writing_1: {
      id: "writing_1",
      title: "Greetings (A1)",
      steps: [
        {
          type: "input_text",
          title: "Type 'Good morning'",
          question: "Good morning",
          correctText: ["Buenos días", "buenos dias"],
        },
      ],
    },
    writing_2: {
      id: "writing_2",
      title: "Verbs (A1)",
      steps: [
        {
          type: "fill_blank",
          title: "You eat",
          context: "Tú ____ pan",
          options: [
            { id: "1", text: "comes", isCorrect: true },
            { id: "2", text: "como" },
          ],
        },
      ],
    },
    writing_3: {
      id: "writing_3",
      title: "Sentences (A1)",
      steps: [
        {
          type: "reorder",
          title: "My name is Juan",
          question: "My name is Juan",
          words: ["llamo", "Me", "Juan"],
          correctOrder: [1, 0, 2],
        },
      ],
    },
  },

  // ==========================
  // 🟡 УРОВЕНЬ B1 (Средний)
  // ==========================
  B1: {
    // --- Reading ---
    reading_1: {
      id: "reading_1",
      title: "Travel (B1)",
      steps: [
        {
          type: "info",
          title: "At the Airport",
          question: "Let's learn travel vocabulary.",
        },
        {
          type: "select_one",
          title: "Luggage",
          question: "El equipaje",
          options: [
            { id: "1", text: "Ticket" },
            { id: "2", text: "Luggage", isCorrect: true },
          ],
        },
        {
          type: "match_pairs",
          title: "Travel",
          pairs: [
            { left: "Vuelo", right: "Flight" },
            { left: "Pasaporte", right: "Passport" },
          ],
        },
      ],
    },
    reading_2: {
      id: "reading_2",
      title: "City Life (B1)",
      steps: [
        {
          type: "fill_blank",
          title: "Subway",
          context: "Voy al trabajo en ____",
          options: [
            { id: "1", text: "metro", isCorrect: true },
            { id: "2", text: "cielo" },
          ],
        },
      ],
    },
    reading_3: {
      id: "reading_3",
      title: "Context (B1)",
      steps: [
        {
          type: "reorder",
          title: "I want to book a room",
          question: "I want to book a room",
          words: ["una", "Quiero", "reservar", "habitación"],
          correctOrder: [1, 2, 0, 3],
        },
      ],
    },

    // --- Vocabulary ---
    vocabulary_1: {
      id: "vocabulary_1",
      title: "Restaurant (B1)",
      steps: [
        {
          type: "select_one",
          title: "The Bill",
          question: "La cuenta",
          options: [
            { id: "1", text: "Menu" },
            { id: "2", text: "Bill", isCorrect: true },
          ],
        },
      ],
    },
    vocabulary_2: {
      id: "vocabulary_2",
      title: "Work (B1)",
      steps: [
        {
          type: "match_pairs",
          title: "Office",
          pairs: [
            { left: "Jefe", right: "Boss" },
            { left: "Reunión", right: "Meeting" },
          ],
        },
      ],
    },
    vocabulary_3: {
      id: "vocabulary_3",
      title: "Emotions (B1)",
      steps: [
        {
          type: "select_one",
          title: "Surprised",
          question: "Sorprendido",
          options: [
            { id: "1", text: "Surprised", isCorrect: true },
            { id: "2", text: "Angry" },
          ],
        },
      ],
    },

    // --- Writing ---
    writing_1: {
      id: "writing_1",
      title: "Emails (B1)",
      steps: [
        {
          type: "input_text",
          title: "Translate",
          question: "Dear Sir",
          correctText: "Estimado Señor",
        },
      ],
    },
    writing_2: {
      id: "writing_2",
      title: "Past Tense (B1)",
      steps: [
        {
          type: "fill_blank",
          title: "I went",
          context: "Ayer yo ____ al cine",
          options: [
            { id: "1", text: "fui", isCorrect: true },
            { id: "2", text: "voy" },
          ],
        },
      ],
    },
    writing_3: {
      id: "writing_3",
      title: "Opinions (B1)",
      steps: [
        {
          type: "reorder",
          title: "I think it is good",
          question: "Translate",
          words: ["que", "Creo", "es", "bueno"],
          correctOrder: [1, 0, 2, 3],
        },
      ],
    },
  },

  // ==========================
  // 🔴 УРОВЕНЬ C1 (Продвинутый)
  // ==========================
  C1: {
    // --- Reading ---
    reading_1: {
      id: "reading_1",
      title: "Literature (C1)",
      steps: [
        {
          type: "info",
          title: "Advanced",
          question: "Analysis of complex texts.",
        },
        {
          type: "select_one",
          title: "Meaning",
          question: "Efímero",
          options: [
            { id: "1", text: "Brief/Ephemeral", isCorrect: true },
            { id: "2", text: "Eternal" },
          ],
        },
      ],
    },
    reading_2: {
      id: "reading_2",
      title: "Politics (C1)",
      steps: [
        {
          type: "match_pairs",
          title: "Politics",
          pairs: [
            { left: "Derechos", right: "Rights" },
            { left: "Ley", right: "Law" },
          ],
        },
      ],
    },
    reading_3: {
      id: "reading_3",
      title: "Philosophy (C1)",
      steps: [
        {
          type: "error_id",
          title: "Find Error",
          question: "Tap the wrong word",
          words: ["La", "sistema", "es", "bueno"],
          correctIndex: 0,
        }, // El sistema
      ],
    },

    // --- Vocabulary ---
    vocabulary_1: {
      id: "vocabulary_1",
      title: "Science (C1)",
      steps: [
        {
          type: "select_one",
          title: "Hypothesis",
          question: "Hipótesis",
          options: [
            { id: "1", text: "Theory", isCorrect: true },
            { id: "2", text: "Fact" },
          ],
        },
      ],
    },
    vocabulary_2: {
      id: "vocabulary_2",
      title: "Economics (C1)",
      steps: [
        {
          type: "match_pairs",
          title: "Market",
          pairs: [
            { left: "Inversión", right: "Investment" },
            { left: "Deuda", right: "Debt" },
          ],
        },
      ],
    },
    vocabulary_3: {
      id: "vocabulary_3",
      title: "Abstract (C1)",
      steps: [
        {
          type: "select_one",
          title: "Ambiguous",
          question: "Ambiguo",
          options: [
            { id: "1", text: "Unclear", isCorrect: true },
            { id: "2", text: "Clear" },
          ],
        },
      ],
    },

    // --- Writing ---
    writing_1: {
      id: "writing_1",
      title: "Essays (C1)",
      steps: [
        {
          type: "input_text",
          title: "Connector",
          question: "Translate 'Therefore'",
          correctText: ["Por lo tanto", "Por consiguiente"],
        },
      ],
    },
    writing_2: {
      id: "writing_2",
      title: "Subjunctive (C1)",
      steps: [
        {
          type: "fill_blank",
          title: "Subjunctive",
          context: "Espero que él ____",
          options: [
            { id: "1", text: "venga", isCorrect: true },
            { id: "2", text: "viene" },
          ],
        },
      ],
    },
    writing_3: {
      id: "writing_3",
      title: "Debate (C1)",
      steps: [
        {
          type: "reorder",
          title: "Disagreement",
          question: "However, I disagree",
          words: ["embargo,", "Sin", "no", "estoy", "de", "acuerdo"],
          correctOrder: [1, 0, 2, 3, 4, 5],
        },
      ],
    },
  },
};

/**
 * Функция для получения данных урока по ID и уровню пользователя.
 * @param level - Уровень пользователя (A1, B1, C1...)
 * @param lessonId - ID урока (reading_1, vocabulary_2...)
 */
export const getLessonData = (
  level: string | null,
  lessonId: string
): LessonData | null => {
  // 1. Нормализуем уровень (по умолчанию A1)
  let safeLevel = (level || "A1").toUpperCase();

  // 2. Если такого уровня нет в базе (например B2, C2), делаем фоллбек
  if (!ALL_LESSONS[safeLevel]) {
    if (safeLevel === "B2") safeLevel = "B1"; // B2 -> B1
    else if (safeLevel === "C2") safeLevel = "C1"; // C2 -> C1
    else safeLevel = "A1"; // Остальные -> A1
  }

  // 3. Достаем объект уровня
  const levelData = ALL_LESSONS[safeLevel];

  // 4. Возвращаем урок или null, если ID не найден
  return levelData ? levelData[lessonId] : null;
};

// Экспортируем пустой объект lessonsData для совместимости,
// если где-то в коде остались старые прямые импорты (хотя лучше использовать getLessonData)
export const lessonsData: Record<string, LessonData> = {};
