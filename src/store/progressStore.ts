// src/store/progressStore.ts

// 👇 ВАЖНО: слово export перед interface обязательно!
export interface UserStats {
  totalWords: number;
  totalMinutes: number;
  streakDays: number;
  completedLessons: string[]; // ID пройденных уроков
}

const STORAGE_KEY = "lang_app_progress";

// Начальные данные
const defaultStats: UserStats = {
  totalWords: 151,
  totalMinutes: 11,
  streakDays: 4,
  completedLessons: [],
};

// 1. Получить данные
export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultStats;
};

// 2. Сохранить данные (внутренняя функция)
const saveStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  // Генерируем событие для обновления UI
  window.dispatchEvent(new Event("storage-update"));
};

// 3. Функция завершения урока (экспортируемая)
export const finishLesson = (lessonId: string) => {
  const stats = getStats();

  // Если урок еще не был пройден
  if (!stats.completedLessons.includes(lessonId)) {
    stats.completedLessons.push(lessonId);

    // Добавляем фиктивный прогресс за урок
    stats.totalWords += 15;
    stats.totalMinutes += 2;
  }

  // Сохраняем и уведомляем Dashboard
  saveStats(stats);
};

// 4. Проверка (экспортируемая)
export const isLessonCompleted = (lessonId: string) => {
  const stats = getStats();
  return stats.completedLessons.includes(lessonId);
};
