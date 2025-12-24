# 🗺 API Integration Map

Цей документ описує, як фронтенд взаємодіє з бекендом: які файли відповідають за запити та де саме в коді знаходяться виклики API.

---

## 1. Авторизація (Auth)

Логіка входу та реєстрації знаходиться у файлі **`src/hooks/useAuth.ts`**.

### 🔹 Вхід (`/auth/login`)

**Файл:** `src/hooks/useAuth.ts`
**Функція:** `login`
**Рядок у коді:**

```typescript
const response = await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: data.email, password: data.password }),
});
🔹 Реєстрація (/auth/register)
Файл: src/hooks/useAuth.ts Функція: register Рядок у коді:

TypeScript

const response = await fetch(`${API_URL}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: finalName,
    email: data.email,
    password: data.password
  }),
});
2. Налаштування та Синхронізація (User & Session)
Ця логіка знаходиться в головному файлі src/App.tsx. Тут відбувається перевірка сесії при завантаженні та збереження початкових налаштувань.

🔹 Старт сесії (/session/begin-session)
Потрібен для отримання session_id, без якого не можна отримати статистику. Файл: src/App.tsx Функція: syncUserData (всередині useEffect) Рядок у коді:

TypeScript

const sessionRes = await fetch(`${API_URL}/session/begin-session`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}` }
});
🔹 Отримання статистики (/user/stats)
Використовується для синхронізації мови та рівня, якщо користувач вже зареєстрований. Файл: src/App.tsx Функція: syncUserData (всередині useEffect) Рядок у коді:

TypeScript

const statsRes = await fetch(`${API_URL}/user/stats`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "x-session-id": sessionId // <--- Обов'язковий заголовок
  }
});
🔹 Ініціалізація (/user/initialize)
Відправляється, коли новий користувач вибрав мову та рівень. Файл: src/App.tsx Функція: handleFinalizeSetup Рядок у коді:

TypeScript

const res = await fetch(`${API_URL}/user/initialize`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(payload), // { source_language, target_language, language_level }
});
3. Навчання (Learning)
Логіка отримання вправ знаходиться у файлі екрану уроку src/screens/LessonScreen.tsx.

🔹 Отримання вправи (/session/exercise)
Запит на отримання конкретного завдання для уроку. Файл: src/screens/LessonScreen.tsx Функція: fetchData (всередині useEffect) Рядок у коді:

TypeScript

// Примітка: Цей код може бути закоментований для тестування UI
const res = await fetch(`${API_URL}/session/exercise`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "x-session-id": sessionId
  }
});
4. Конфігурація Проксі (CORS)
Щоб браузер не блокував запити (CORS error), ми налаштували проксі у файлі vite.config.ts. Це перенаправляє всі запити з фронтенду на бекенд (http://127.0.0.1:8000).

Файл: vite.config.ts Код:

TypeScript

server: {
  proxy: {
    '/auth': {
      target: '[http://127.0.0.1:8000](http://127.0.0.1:8000)',
      changeOrigin: true,
      secure: false,
    },
    '/user': {
      target: '[http://127.0.0.1:8000](http://127.0.0.1:8000)',
      changeOrigin: true,
      secure: false,
    },
    '/session': {
      target: '[http://127.0.0.1:8000](http://127.0.0.1:8000)',
      changeOrigin: true,
      secure: false,
    },
    '/ai': {
      target: '[http://127.0.0.1:8000](http://127.0.0.1:8000)',
      changeOrigin: true,
      secure: false,
    }
  }
}
```
