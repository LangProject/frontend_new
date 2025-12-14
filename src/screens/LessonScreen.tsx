// src/screens/LessonScreen.tsx
import { LessonEngine } from "../lessons/LessonEngine";

interface Props {
  lessonId: string;
  onBack: () => void; // Функция возврата в меню
}

export const LessonScreen = ({ lessonId, onBack }: Props) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Кнопка "Назад" (крестик) */}
      <button
        onClick={onBack}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "none",
          border: "none",
          fontSize: 24,
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <LessonEngine
        lessonId={lessonId}
        // 👇 ВОТ ЭТОЙ СТРОЧКИ НЕ ХВАТАЛО, ИЗ-ЗА ЭТОГО БЫЛА ОШИБКА
        onFinish={() => {
          console.log("Lesson finished!");
          onBack(); // Возвращаемся в меню после конца урока
        }}
      />
    </div>
  );
};
