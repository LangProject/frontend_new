// src/lessons/LessonEngine.tsx
import { useState } from "react";
import { LESSONS } from "./index";
import type { Lesson, LessonProgress } from "./types";
import { ExerciseDemoScreen } from "../screens/ExerciseDemoScreen";

interface LessonEngineProps {
  lessonId: string;
  onBack: () => void;
  onFinish: () => void;
}

const STORAGE_PREFIX = "lesson_progress_";

const createInitialProgress = (lesson: Lesson): LessonProgress => ({
  currentIndex: 0,
  total: lesson.exercises.length,
  completed: false,
  correctCount: 0,
});

const loadProgress = (lesson: Lesson): LessonProgress => {
  if (typeof window === "undefined") return createInitialProgress(lesson);

  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + lesson.id);
    if (!raw) return createInitialProgress(lesson);

    const parsed = JSON.parse(raw) as Partial<LessonProgress>;

    // если раньше структура изменилась или урок был завершён,
    // начинаем его ЗАНОВО
    if (
      typeof parsed.currentIndex !== "number" ||
      typeof parsed.total !== "number" ||
      typeof parsed.completed !== "boolean" ||
      typeof parsed.correctCount !== "number" ||
      parsed.total !== lesson.exercises.length ||
      parsed.completed
    ) {
      return createInitialProgress(lesson);
    }

    return {
      currentIndex: Math.min(
        parsed.currentIndex,
        Math.max(lesson.exercises.length - 1, 0)
      ),
      total: lesson.exercises.length,
      completed: false, // перезапускаем незавершённым
      correctCount: parsed.correctCount,
    };
  } catch {
    return createInitialProgress(lesson);
  }
};

const saveProgress = (lesson: Lesson, progress: LessonProgress) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_PREFIX + lesson.id,
      JSON.stringify(progress)
    );
  } catch {
    // ignore
  }
};

export const LessonEngine = ({
  lessonId,
  onBack,
  onFinish,
}: LessonEngineProps) => {
  const lesson = LESSONS[lessonId];

  if (!lesson) {
    return (
      <div className="lesson-screen">
        <div className="lesson-content">
          <h2 className="finish-title">Lesson not found</h2>
          <button type="button" className="footer-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const [progress, setProgress] = useState<LessonProgress>(() =>
    loadProgress(lesson)
  );

  const { currentIndex, total, completed } = progress;

  // Если урок завершён в текущей сессии – красивый финальный экран
  if (completed || lesson.exercises.length === 0) {
    return (
      <div className="lesson-screen">
        <div className="lesson-content finish-content">
          <h2 className="finish-title">{lesson.title}</h2>
          <p className="finish-text">
            Lesson finished. Correct answers: {progress.correctCount}/
            {progress.total}
          </p>
        </div>

        <div className="lesson-footer">
          <button
            type="button"
            className="footer-btn"
            onClick={() => {
              // очистим прогресс в хранилище, чтобы при следующем запуске
              // урок начался с нуля
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(STORAGE_PREFIX + lesson.id);
              }
              onFinish();
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[currentIndex];

  return (
    <ExerciseDemoScreen
      type={exercise.type}
      step={currentIndex + 1}
      total={total}
      onBack={onBack}
      onComplete={({ correct }) => {
        setProgress((prev) => {
          const nextIndex = prev.currentIndex + 1;
          const isCompleted = nextIndex >= lesson.exercises.length;

          const next: LessonProgress = {
            currentIndex: isCompleted ? lesson.exercises.length - 1 : nextIndex,
            total: lesson.exercises.length,
            completed: isCompleted,
            correctCount: prev.correctCount + (correct ? 1 : 0),
          };

          saveProgress(lesson, next);

          if (isCompleted) {
            // чтобы отрисовать финальный экран
            return { ...next, completed: true };
          }

          return next;
        });
      }}
    />
  );
};
