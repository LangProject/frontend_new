// src/store/progressStore.ts

const KEY_PREFIX = "lesson_progress_";

export const isLessonCompleted = (lessonId: string): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(KEY_PREFIX + lessonId);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { completed?: boolean };
    return !!parsed.completed;
  } catch {
    return false;
  }
};

export const markLessonCompleted = (lessonId: string) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    KEY_PREFIX + lessonId,
    JSON.stringify({ completed: true, completedAt: Date.now() })
  );
};
