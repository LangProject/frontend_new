import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Проксируем запросы на авторизацию
      "/auth": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      // Проксируем запросы пользователя
      "/user": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      // Проксируем сессии обучения
      "/session": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
      // Проксируем AI задачи
      "/ai": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
