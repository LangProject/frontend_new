// src/lessons/types.ts
export type ExerciseType = 'grammar' | 'vocabulary' | 'listening';

export type TaskType = 
  | 'multiple_choice' 
  | 'match_pairs'
  | 'definition_match'
  | 'error_identification'
  | 'fill_gap'
  | 'conjugation'
  | 'verb_conjugation'
  | 'error_correction';

export interface ExtendedTask {
  id: string;
  type: TaskType;
  question: string;
  sentence?: string;
  solution?: string;
  explanation?: string;
  correct_translation?: string;
  words?: string[];
  language_data?: any;
}

export interface Lesson {
  id: string;
  title: string;
  exercises: LessonExercise[];
}

export interface LessonExercise {
  id: string;
  type: ExerciseType;
}

export interface LessonProgress {
  currentIndex: number;
  total: number;
  completed: boolean;
  correctCount: number;
}

export interface LessonFeedback {
  solution?: string;
  explanation?: string;
}
