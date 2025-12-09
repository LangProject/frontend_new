// src/lessons/index.ts
import type { Lesson } from "./types";
import { spanish_basic_1 } from "./spanish_basic_1";

export const LESSONS: Record<string, Lesson> = {
  [spanish_basic_1.id]: spanish_basic_1,
};
