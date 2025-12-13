// src/lessons/index.ts
import type { Lesson } from "./types";
import { spanish_basic_1 } from "./spanish_basic_1";

// Все доступные уроки приложения.
// Сейчас у нас фактически один реальный урок spanish_basic_1.
// Мы делаем алиасы под айдишки, которые приходят с Dashboard.
export const LESSONS: Record<string, Lesson> = {
  // базовый id
  spanish_basic_1,

  // алиасы под пути с дашборда
  reading: spanish_basic_1,
  vocabulary: spanish_basic_1,
  writing: spanish_basic_1,
};
