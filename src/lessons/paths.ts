// src/lessons/paths.ts
import { isLessonCompleted } from "../store/progressStore";

export type LessonStatus = "completed" | "current" | "locked";

export interface PathLessonItem {
  id: string;
  title: string;
  tasksCount: number;
}

export interface LearningPathConfig {
  id: string;
  title: string;
  levelLabel: string;
  lessons: PathLessonItem[];
}

export const PATH_CONFIGS: Record<string, LearningPathConfig> = {
  reading: {
    id: "reading",
    title: "Reading Path",
    levelLabel: "Advanced Comprehension",
    lessons: [
      { id: "reading_1", title: "Lesson 1: Basics", tasksCount: 3 },
      { id: "reading_2", title: "Lesson 2: Practice", tasksCount: 2 },
      { id: "reading_3", title: "Lesson 3: Advanced", tasksCount: 2 },
    ],
  },
  vocabulary: {
    id: "vocabulary",
    title: "Vocabulary Path",
    levelLabel: "Essential Words",
    lessons: [
      { id: "vocabulary_1", title: "Lesson 1: Food", tasksCount: 3 },
      { id: "vocabulary_2", title: "Lesson 2: Family", tasksCount: 3 },
      { id: "vocabulary_3", title: "Lesson 3: Colors", tasksCount: 2 },
    ],
  },
  writing: {
    id: "writing",
    title: "Writing Path",
    levelLabel: "Grammar & Typing",
    lessons: [
      { id: "writing_1", title: "Lesson 1: Greetings", tasksCount: 3 },
      { id: "writing_2", title: "Lesson 2: Verbs", tasksCount: 3 },
      { id: "writing_3", title: "Lesson 3: Sentences", tasksCount: 2 },
    ],
  },
};

export const getLessonStatuses = (
  lessons: PathLessonItem[]
): LessonStatus[] => {
  const completedMap = lessons.map((l) => isLessonCompleted(l.id));
  const firstIncompleteIndex = completedMap.findIndex((isDone) => !isDone);

  if (firstIncompleteIndex === -1) {
    return lessons.map(() => "completed");
  }

  return lessons.map((_, i) => {
    if (i < firstIncompleteIndex) return "completed";
    if (i === firstIncompleteIndex) return "current";
    return "locked";
  });
};
