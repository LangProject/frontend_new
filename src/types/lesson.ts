export type TaskType =
  | "single_choice"
  | "multiple_choice"
  | "sentence_reorder"
  | "fill_blank"
  | "translation";

// Відповідь сервера на /session/answer (результат перевірки)
export interface LessonFeedback {
  type: TaskType;
  prompt: string;
  options?: { choice: string; is_correct: boolean }[];
  correct_answer?: string;
  correct_order?: number[];
  words?: string[];
}

// Завдання від /session/exercise
export interface LessonExercise {
  id: string;
  type: TaskType;
  prompt: string;
  options?: string[];
  words?: string[];
}

// Універсальна відповідь юзера
export type AnswerValue = string | number | number[] | string[];

export interface AnswerPayload {
  exercise_id: string;
  type: TaskType;
  answer: AnswerValue;
}

export interface UserStats {
  elo: number;
  level: string;
}
