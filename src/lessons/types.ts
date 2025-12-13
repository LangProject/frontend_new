// src/lessons/types.ts
import type { ExerciseType } from "../screens/ExerciseDemoScreen";

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
  currentIndex: number;
  total: number;
  completed: boolean;
  correctCount: number;
}
