// src/i18n.ts
import type { UiLangCode } from "./utils/detectUiLanguage";
import { SUPPORTED_UI_LANGS } from "./utils/detectUiLanguage";

type TKey =
  | "auth.welcomeTitle"
  | "auth.welcomeSubtitle"
  | "auth.signUp"
  | "auth.logIn"
  | "auth.namePlaceholder"
  | "auth.emailPlaceholder"
  | "auth.passwordPlaceholder"
  | "auth.createAccountButton"
  | "auth.loginButton"
  | "auth.forgotPassword"
  | "uiLanguage.title"
  | "uiLanguage.subtitle"
  | "learningLanguage.title"
  | "learningLanguage.subtitle"
  | "level.selectTitle"
  | "level.selectSubtitle"
  | "level.testTitle"
  | "level.testSubtitle"
  | "dashboard.learningPathsTitle"
  | "dashboard.summaryTitle";

type Dict = Record<TKey, string>;

const en: Dict = {
  "auth.welcomeTitle": "Welcome",
  "auth.welcomeSubtitle": "Create an account or log in to save your progress.",
  "auth.signUp": "Sign up",
  "auth.logIn": "Log in",
  "auth.namePlaceholder": "Your name",
  "auth.emailPlaceholder": "Email",
  "auth.passwordPlaceholder": "Password",
  "auth.createAccountButton": "Create account",
  "auth.loginButton": "Log in",
  "auth.forgotPassword": "Forgot password?",
  "uiLanguage.title": "Choose your language",
  "uiLanguage.subtitle": "Select the language for the app interface.",
  "learningLanguage.title": "Choose a learning language",
  "learningLanguage.subtitle": "Select the language you want to study.",
  "level.selectTitle": "How well do you know this language?",
  "level.selectSubtitle":
    "Choose your current level to get the right exercises.",
  "level.testTitle": "Don't know your level?",
  "level.testSubtitle": "Find your level in a few quick questions.",
  "dashboard.learningPathsTitle": "Learning Paths",
  "dashboard.summaryTitle": "Summary",
};

const de: Dict = {
  "auth.welcomeTitle": "Willkommen",
  "auth.welcomeSubtitle":
    "Erstelle ein Konto oder melde dich an, um deinen Fortschritt zu speichern.",
  "auth.signUp": "Registrieren",
  "auth.logIn": "Anmelden",
  "auth.namePlaceholder": "Dein Name",
  "auth.emailPlaceholder": "E-Mail",
  "auth.passwordPlaceholder": "Passwort",
  "auth.createAccountButton": "Konto erstellen",
  "auth.loginButton": "Anmelden",
  "auth.forgotPassword": "Passwort vergessen?",
  "uiLanguage.title": "Wähle deine Sprache",
  "uiLanguage.subtitle": "Wähle die Sprache für die App-Oberfläche.",
  "learningLanguage.title": "Lernsprache wählen",
  "learningLanguage.subtitle": "Wähle die Sprache, die du lernen möchtest.",
  "level.selectTitle": "Wie gut kannst du diese Sprache?",
  "level.selectSubtitle": "Wähle dein aktuelles Niveau für passende Übungen.",
  "level.testTitle": "Kennst du dein Niveau nicht?",
  "level.testSubtitle": "Finde dein Niveau in ein paar kurzen Fragen heraus.",
  "dashboard.learningPathsTitle": "Lernpfade",
  "dashboard.summaryTitle": "Zusammenfassung",
};

const es: Dict = {
  "auth.welcomeTitle": "Bienvenido",
  "auth.welcomeSubtitle":
    "Crea una cuenta o inicia sesión para guardar tu progreso.",
  "auth.signUp": "Registrarse",
  "auth.logIn": "Iniciar sesión",
  "auth.namePlaceholder": "Tu nombre",
  "auth.emailPlaceholder": "Correo electrónico",
  "auth.passwordPlaceholder": "Contraseña",
  "auth.createAccountButton": "Crear cuenta",
  "auth.loginButton": "Iniciar sesión",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "uiLanguage.title": "Elige tu idioma",
  "uiLanguage.subtitle": "Selecciona el idioma de la interfaz.",
  "learningLanguage.title": "Elige el idioma de aprendizaje",
  "learningLanguage.subtitle": "Selecciona el idioma que quieres estudiar.",
  "level.selectTitle": "¿Qué nivel tienes en este idioma?",
  "level.selectSubtitle":
    "Elige tu nivel actual para obtener los ejercicios correctos.",
  "level.testTitle": "¿No conoces tu nivel?",
  "level.testSubtitle": "Encuentra tu nivel con unas pocas preguntas rápidas.",
  "dashboard.learningPathsTitle": "Rutas de aprendizaje",
  "dashboard.summaryTitle": "Resumen",
};

const fr: Dict = {
  "auth.welcomeTitle": "Bienvenue",
  "auth.welcomeSubtitle":
    "Crée un compte ou connecte-toi pour enregistrer ta progression.",
  "auth.signUp": "Inscription",
  "auth.logIn": "Connexion",
  "auth.namePlaceholder": "Ton nom",
  "auth.emailPlaceholder": "E-mail",
  "auth.passwordPlaceholder": "Mot de passe",
  "auth.createAccountButton": "Créer un compte",
  "auth.loginButton": "Se connecter",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "uiLanguage.title": "Choisis ta langue",
  "uiLanguage.subtitle": "Sélectionne la langue de l’interface.",
  "learningLanguage.title": "Choisis la langue à apprendre",
  "learningLanguage.subtitle":
    "Sélectionne la langue que tu souhaites étudier.",
  "level.selectTitle": "Quel est ton niveau dans cette langue ?",
  "level.selectSubtitle":
    "Choisis ton niveau actuel pour obtenir les bons exercices.",
  "level.testTitle": "Tu ne connais pas ton niveau ?",
  "level.testSubtitle": "Trouve ton niveau en quelques questions rapides.",
  "dashboard.learningPathsTitle": "Parcours d’apprentissage",
  "dashboard.summaryTitle": "Résumé",
};

const pl: Dict = {
  "auth.welcomeTitle": "Witaj",
  "auth.welcomeSubtitle":
    "Utwórz konto lub zaloguj się, aby zapisać swoje postępy.",
  "auth.signUp": "Zarejestruj się",
  "auth.logIn": "Zaloguj się",
  "auth.namePlaceholder": "Twoje imię",
  "auth.emailPlaceholder": "E-mail",
  "auth.passwordPlaceholder": "Hasło",
  "auth.createAccountButton": "Utwórz konto",
  "auth.loginButton": "Zaloguj się",
  "auth.forgotPassword": "Nie pamiętasz hasła?",
  "uiLanguage.title": "Wybierz swój język",
  "uiLanguage.subtitle": "Wybierz język interfejsu aplikacji.",
  "learningLanguage.title": "Wybierz język nauki",
  "learningLanguage.subtitle": "Wybierz język, którego chcesz się uczyć.",
  "level.selectTitle": "Jaki masz poziom w tym języku?",
  "level.selectSubtitle":
    "Wybierz swój poziom, aby otrzymać odpowiednie ćwiczenia.",
  "level.testTitle": "Nie znasz swojego poziomu?",
  "level.testSubtitle": "Poznaj swój poziom w kilku pytaniach.",
  "dashboard.learningPathsTitle": "Ścieżки nauki",
  "dashboard.summaryTitle": "Podsumowanie",
};

const DICTS: Record<UiLangCode, Dict> = { en, de, es, fr, pl };

export const t = (lang: UiLangCode | null | undefined, key: TKey): string => {
  const fallbackLang: UiLangCode = "en";

  const safeLang: UiLangCode =
    lang && (SUPPORTED_UI_LANGS as readonly string[]).includes(lang)
      ? (lang as UiLangCode)
      : fallbackLang;

  const dict = DICTS[safeLang] ?? DICTS[fallbackLang];
  return dict[key] ?? DICTS[fallbackLang][key];
};
