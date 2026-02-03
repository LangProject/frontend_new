import { type UiLangCode } from "./utils/detectUiLanguage";

type Dict = Record<string, string>;

// 🇺🇸 ENGLISH
const en: Dict = {
  "common.continue": "CONTINUE",

  // Auth
  "auth.welcomeTitle": "Welcome!",
  "auth.welcomeSubtitle": "Please sign in to continue",
  "auth.login": "Log in",
  "auth.signup": "Sign up",
  "auth.name": "Name",
  "auth.fullName": "Full name",
  "auth.nickname": "Nickname",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.repeatPassword": "Repeat password",
  "auth.forgotPassword": "Forgot password?",
  "auth.logInCta": "Log in",
  "auth.signUpCta": "Create account",
  "auth.loading": "Please wait...",
  "auth.namePlaceholder": "Your name",
  "auth.emailPlaceholder": "you@example.com",
  "auth.passwordPlaceholder": "Enter password",

  // Setup
  "chooseUiLang.title": "I speak...",
  "uiLanguage.subtitle": "Select the language for the app interface.",
  "chooseLearningLang.title": "I want to learn...",
  "learningLanguage.subtitle": "Select the language you want to study.",

  "level.selectTitle": "How well do you know this language?",
  "level.selectSubtitle": "Select your current level.",
  "level.testTitle": "Don't know your level?",
  "level.testSubtitle": "Find your level quickly.",

  // DASHBOARD (Новые переводы)
  "dashboard.title": "Learning Path",
  "dashboard.subtitle": "Your personal plan",
  "dashboard.level": "Level",
  "dashboard.reading": "Reading",
  "dashboard.vocabulary": "Vocabulary",
  "dashboard.writing": "Writing",
  "dashboard.totalElo": "Total ELO",
};

// 🇪🇸 SPANISH
const es: Dict = {
  ...en,
  "auth.welcomeTitle": "¡Bienvenido!",
  "auth.welcomeSubtitle": "Inicia sesión para continuar",
  "auth.login": "Entrar",
  "auth.signup": "Registro",
  "auth.name": "Nombre",
  "auth.fullName": "Nombre completo",
  "auth.nickname": "Usuario",
  "auth.email": "Correo",
  "auth.password": "Contraseña",
  "auth.repeatPassword": "Repetir contraseña",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "auth.logInCta": "Iniciar sesión",
  "auth.signUpCta": "Crear cuenta",
  "auth.loading": "Espera...",

  "chooseUiLang.title": "Yo hablo...",
  "uiLanguage.subtitle": "Selecciona el idioma de la interfaz.",
  "chooseLearningLang.title": "Quiero aprender...",
  "learningLanguage.subtitle": "Selecciona el idioma que quieres estudiar.",

  "level.selectTitle": "¿Qué nivel tienes?",
  "level.selectSubtitle": "Elige tu nivel actual.",
  "level.testTitle": "¿No conoces tu nivel?",
  "level.testSubtitle": "Encuentra tu nivel rápidamente.",

  // Dashboard ES
  "dashboard.title": "Ruta de aprendizaje",
  "dashboard.subtitle": "Tu plan personal",
  "dashboard.level": "Nivel",
  "dashboard.reading": "Lectura",
  "dashboard.vocabulary": "Vocabulario",
  "dashboard.writing": "Escritura",
  "dashboard.totalElo": "ELO Total",
};

// 🇩🇪 GERMAN
const de: Dict = {
  ...en,
  "auth.welcomeTitle": "Willkommen!",
  "auth.logInCta": "Anmelden",
  "auth.signUpCta": "Registrieren",
  
  // Dashboard DE
  "dashboard.title": "Lernpfad",
  "dashboard.subtitle": "Ihr persönlicher Plan",
  "dashboard.level": "Niveau",
  "dashboard.reading": "Lesen",
  "dashboard.vocabulary": "Wortschatz",
  "dashboard.writing": "Schreiben",
  "dashboard.totalElo": "Gesamt-ELO",
};

// 🇷🇺 RUSSIAN
const ru: Dict = {
  ...en,
  "common.continue": "ПРОДОЛЖИТЬ",

  // Auth
  "auth.welcomeTitle": "Добро пожаловать!",
  "auth.welcomeSubtitle": "Войдите, чтобы продолжить",
  "auth.login": "Вход",
  "auth.signup": "Регистрация",
  "auth.name": "Имя",
  "auth.fullName": "Полное имя",
  "auth.nickname": "Никнейм",
  "auth.email": "Email",
  "auth.password": "Пароль",
  "auth.repeatPassword": "Повторите пароль",
  "auth.forgotPassword": "Забыли пароль?",
  "auth.logInCta": "Войти",
  "auth.signUpCta": "Создать аккаунт",
  "auth.loading": "Подождите...",

  // Setup
  "chooseUiLang.title": "Я говорю на...",
  "uiLanguage.subtitle": "Выберите язык интерфейса.",
  "chooseLearningLang.title": "Я хочу учить...",
  "learningLanguage.subtitle": "Выберите язык для изучения.",

  "level.selectTitle": "Ваш уровень?",
  "level.selectSubtitle": "Укажите текущий уровень знаний.",
  "level.testTitle": "Не знаете свой уровень?",
  "level.testSubtitle": "Пройдите быстрый тест.",

  // Dashboard RU
  "dashboard.title": "Путь обучения",
  "dashboard.subtitle": "Ваш персональный план",
  "dashboard.level": "Уровень",
  "dashboard.reading": "Чтение",
  "dashboard.vocabulary": "Словарь",
  "dashboard.writing": "Письмо",
  "dashboard.totalElo": "Общий ELO",
};

// Другие языки (пока копии EN)
const fr = { ...en };
const pl = { ...en };

const DICTS: Record<string, Dict> = { en, de, es, fr, pl, ru };

export const t = (lang: UiLangCode | null | undefined, key: string): string => {
  const fallback = DICTS.en[key] || key;
  if (!lang) return fallback;
  const dict = DICTS[lang];
  return dict?.[key] || fallback;
};