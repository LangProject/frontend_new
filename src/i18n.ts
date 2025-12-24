import { type UiLangCode } from "./utils/detectUiLanguage";

type Dict = Record<string, string>;

// 🇺🇸 ENGLISH
const en: Dict = {
  "common.continue": "CONTINUE",

  // Auth (Вхід/Реєстрація)
  "auth.welcomeTitle": "Welcome!",
  "auth.welcomeSubtitle": "Please sign in to continue",
  "auth.login": "Log in", // Текст на перемикачі
  "auth.signup": "Sign up", // Текст на перемикачі
  "auth.name": "Name",
  "auth.fullName": "Full name",
  "auth.nickname": "Nickname",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.repeatPassword": "Repeat password",
  "auth.forgotPassword": "Forgot password?",
  "auth.logInCta": "Log in", // Кнопка входу
  "auth.signUpCta": "Create account", // Кнопка реєстрації
  "auth.loading": "Please wait...",
  "auth.namePlaceholder": "Your name",
  "auth.emailPlaceholder": "you@example.com",
  "auth.passwordPlaceholder": "Enter password",

  // Setup (Вибір мови/рівня)
  "chooseUiLang.title": "I speak...",
  "uiLanguage.subtitle": "Select the language for the app interface.",
  "chooseLearningLang.title": "I want to learn...",
  "learningLanguage.subtitle": "Select the language you want to study.",

  "level.selectTitle": "How well do you know this language?",
  "level.selectSubtitle":
    "Choose your current level to get the right exercises.",
  "level.testTitle": "Don't know your level?",
  "level.testSubtitle": "Find your level in a few quick questions.",

  // Dashboard
  "dashboard.learningPathsTitle": "Learning Paths",
  "dashboard.level": "Level",
  "dashboard.selectTopic": "Select Topic",
  "dashboard.reading": "Reading",
  "dashboard.vocabulary": "Vocabulary",
  "dashboard.writing": "Writing",
  "dashboard.startTest": "Start Test",
};

// 🇷🇺 RUSSIAN
const ru: Dict = {
  "common.continue": "ПРОДОЛЖИТЬ",

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
  "auth.loading": "Загрузка...",
  "auth.namePlaceholder": "Ваше имя",
  "auth.emailPlaceholder": "you@example.com",
  "auth.passwordPlaceholder": "Введите пароль",

  "chooseUiLang.title": "Я говорю на...",
  "uiLanguage.subtitle": "Выберите язык интерфейса приложения.",
  "chooseLearningLang.title": "Я хочу изучать...",
  "learningLanguage.subtitle": "Выберите язык, который хотите учить.",

  "level.selectTitle": "Ваш уровень знаний?",
  "level.selectSubtitle": "Выберите текущий уровень.",
  "level.testTitle": "Не знаете свой уровень?",
  "level.testSubtitle": "Определите уровень тестом.",

  "dashboard.learningPathsTitle": "Пути обучения",
  "dashboard.level": "Уровень",
  "dashboard.selectTopic": "Выберите тему",
  "dashboard.reading": "Чтение",
  "dashboard.vocabulary": "Словарь",
  "dashboard.writing": "Письмо",
  "dashboard.startTest": "Начать тест",
};

// 🇩🇪 GERMAN
const de: Dict = {
  "common.continue": "WEITER",
  "auth.welcomeTitle": "Willkommen!",
  "auth.welcomeSubtitle": "Bitte melden Sie sich an",
  "auth.login": "Anmelden",
  "auth.signup": "Registrieren",
  "auth.name": "Name",
  "auth.fullName": "Vollständiger Name",
  "auth.nickname": "Benutzername",
  "auth.email": "E-Mail",
  "auth.password": "Passwort",
  "auth.repeatPassword": "Passwort wiederholen",
  "auth.forgotPassword": "Passwort vergessen?",
  "auth.logInCta": "Anmelden",
  "auth.signUpCta": "Konto erstellen",
  "auth.loading": "Bitte warten...",

  "chooseUiLang.title": "Ich spreche...",
  "uiLanguage.subtitle": "Wähle die Sprache für die App-Oberfläche.",
  "chooseLearningLang.title": "Ich möchte lernen...",
  "learningLanguage.subtitle": "Wähle die Sprache, die du lernen möchtest.",

  "level.selectTitle": "Wie gut kannst du diese Sprache?",
  "level.selectSubtitle": "Wähle dein aktuelles Niveau.",
  "level.testTitle": "Kennst du dein Niveau nicht?",
  "level.testSubtitle": "Finde dein Niveau heraus.",

  "dashboard.learningPathsTitle": "Lernpfade",
  "dashboard.level": "Niveau",
  "dashboard.selectTopic": "Thema wählen",
  "dashboard.reading": "Lesen",
  "dashboard.vocabulary": "Wortschatz",
  "dashboard.writing": "Schreiben",
  "dashboard.startTest": "Test starten",
};

// 🇪🇸 SPANISH
const es: Dict = {
  "common.continue": "CONTINUAR",
  "auth.welcomeTitle": "¡Bienvenido!",
  "auth.welcomeSubtitle": "Inicia sesión para continuar",
  "auth.login": "Acceso",
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

  "dashboard.learningPathsTitle": "Rutas",
  "dashboard.level": "Nivel",
  "dashboard.selectTopic": "Elige un tema",
  "dashboard.reading": "Lectura",
  "dashboard.vocabulary": "Vocabulario",
  "dashboard.writing": "Escritura",
  "dashboard.startTest": "Iniciar prueba",
};

const fr = { ...en };
const pl = { ...en };

const DICTS: Record<string, Dict> = { en, de, es, fr, pl, ru };

export const t = (lang: UiLangCode | null | undefined, key: string): string => {
  const fallbackLang = "en";
  const safeLang = lang && DICTS[lang] ? lang : fallbackLang;
  const dict = DICTS[safeLang] || DICTS[fallbackLang];

  // Якщо ключа немає - повертаємо сам ключ, щоб бачити, чого не вистачає
  return dict[key] || DICTS[fallbackLang][key] || key;
};
