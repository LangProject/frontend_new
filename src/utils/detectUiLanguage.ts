// src/utils/detectUiLanguage.ts

// Поддерживаемые языки интерфейса
export const SUPPORTED_UI_LANGS = ["en", "de", "es", "fr", "pl"] as const;

export type UiLangCode = (typeof SUPPORTED_UI_LANGS)[number];

/**
 * Определяем стартовый язык интерфейса:
 * 1. Если пользователь уже выбирал язык — берём из localStorage.
 * 2. Иначе ВСЕГДА "en" (английский).
 */
export const detectInitialUiLanguage = (): UiLangCode => {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("ui_language");
      if (
        stored &&
        (SUPPORTED_UI_LANGS as readonly string[]).includes(stored)
      ) {
        return stored as UiLangCode;
      }
    } catch {
      // проблемы с localStorage игнорируем
    }
  }

  // первый заход — всегда английский
  return "en";
};
