// src/lessons/paths.ts

/** Статус урока в пути */
export type LessonStatus = "completed" | "current" | "locked";

/** Один урок внутри пути */
export interface PathLessonItem {
  /** id узла в пути (для UI, анимаций, змейки и т.п.) */
  id: string;

  /** 🔑 ID урока для LessonEngine / lessonsData */
  lessonId: string;

  title: string;
  tasksCount: number;
}

/** Конфиг всего пути */
export interface LearningPathConfig {
  id: string;
  title: string;
  levelLabel: string;
  lessons: PathLessonItem[];
}

/** Все пути */
export const PATH_CONFIGS: Record<string, LearningPathConfig> = {
  reading: {
    id: "reading",
    title: "Reading Path",
    levelLabel: "Level C1 · Unit 3: Advanced Comprehension",
    lessons: [
      {
        id: "reading_3_1",
        lessonId: "lesson-3-1",
        title: "Lesson 3.1",
        tasksCount: 4,
      },
      {
        id: "reading_3_2",
        lessonId: "lesson-3-2",
        title: "Lesson 3.2",
        tasksCount: 6,
      },
      {
        id: "reading_3_3",
        lessonId: "lesson-3-3",
        title: "Lesson 3.3",
        tasksCount: 5,
      },
      {
        id: "reading_3_4",
        lessonId: "lesson-3-4",
        title: "Lesson 3.4",
        tasksCount: 5,
      },
      {
        id: "reading_3_5",
        lessonId: "lesson-3-5",
        title: "Lesson 3.5",
        tasksCount: 5,
      },
      {
        id: "reading_3_6",
        lessonId: "lesson-3-6",
        title: "Lesson 3.6",
        tasksCount: 5,
      },
    ],
  },
};
