// src/lessons/types.ts
import type { ExerciseType } from "../ExerciseDemoScreen";

export interface LessonExercise {
  id: string;
  type: ExerciseType;
}

export interface Lesson {
  id: string;
  title: string;
  exercises: LessonExercise[];
}

export interface LessonProgress {
  currentIndex: number; // индекс текущего задания
  total: number; // всего заданий
  completed: boolean; // урок завершён или нет
  correctCount: number; // сколько "правильных" ответов (пока заглушка)
}
