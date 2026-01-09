import { useState, useEffect } from "react";
import { LessonService } from "../api/services/lessonService";
import type {
  LessonExercise,
  LessonFeedback,
  UserStats,
  AnswerValue,
} from "../types/lesson";
import "./lesson.css";

interface Props {
  lessonId: string;
  onBack: () => void;
}

export const LessonScreen = ({ lessonId, onBack }: Props) => {
  const [task, setTask] = useState<LessonExercise | null>(null);
  const [feedback, setFeedback] = useState<LessonFeedback | null>(null);
  const [stats, setStats] = useState<UserStats>({ elo: 1200, level: "A1" });

  // UI State
  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);

  // Inputs
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [reorderIndices, setReorderIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    if (lessonId) {
      localStorage.setItem("session_id", lessonId);
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // --- ЛОГИКА ОБРАБОТКИ ОШИБОК (FIX) ---
  const handleSessionError = (error: any) => {
    // Если сервер ответил 400 (Bad Request) или 404 (Not Found)
    if (
      error.response &&
      (error.response.status === 400 || error.response.status === 404)
    ) {
      console.warn("Сессия истекла или невалидна. Сброс.");

      // 1. Удаляем старый ID, чтобы не отправлять его снова
      localStorage.removeItem("session_id");

      // 2. Возвращаем пользователя на главный экран (Start Screen)
      onBack();
    } else {
      console.error("Произошла ошибка:", error);
    }
  };

  const init = async () => {
    try {
      const s = await LessonService.getStats();
      setStats(s);
      await loadNextTask(); // Добавили await
    } catch (error: any) {
      handleSessionError(error);
    }
  };

  const loadNextTask = async () => {
    setLoading(true);
    resetUI();
    try {
      const t = await LessonService.getNextTask();
      if (t) setTask(t);
    } catch (error: any) {
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetUI = () => {
    setFeedback(null);
    setIsChecked(false);
    setSelectedOptionIndex(null);
    setReorderIndices([]);
    setTextInput("");
  };

  const handleCheck = async () => {
    if (!task) return;

    // Збираємо відповідь
    let answer: AnswerValue;
    if (task.type === "single_choice") {
      if (selectedOptionIndex === null || !task.options) return;
      answer = task.options[selectedOptionIndex];
    } else if (task.type === "sentence_reorder") {
      if (reorderIndices.length === 0) return;
      answer = reorderIndices;
    } else {
      if (!textInput.trim()) return;
      answer = textInput;
    }

    setLoading(true);

    try {
      // Відправляємо на сервер
      const result = await LessonService.submitAnswer({
        exercise_id: task.id,
        type: task.type,
        answer,
      });

      if (!result) return; // Если результат пустой (но без ошибки)

      // Показуємо результат
      setFeedback(result);
      setIsChecked(true);

      // Перевіряємо правильність (для кольору)
      let correct = false;
      if (task.type === "single_choice" && result.options) {
        const userChoice = task.options![selectedOptionIndex!];
        const correctOpt = result.options.find((o) => o.is_correct);
        if (correctOpt?.choice === userChoice) correct = true;
      } else if (task.type === "sentence_reorder" && result.correct_order) {
        correct =
          JSON.stringify(reorderIndices) ===
          JSON.stringify(result.correct_order);
      } else if (result.correct_answer) {
        correct =
          textInput.trim().toLowerCase() ===
          result.correct_answer.toLowerCase();
      }

      setIsCorrect(correct);
      if (correct) setProgress((p) => Math.min(p + 10, 100));
    } catch (error: any) {
      // Ловим ошибку и при отправке ответа (вдруг сессия умерла посередине)
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (progress >= 100) {
      // Оборачиваем завершение уровня тоже, на всякий случай
      try {
        LessonService.endLevel();
      } catch (e) {
        console.error(e);
      }
      onBack();
    } else {
      loadNextTask();
    }
  };

  // --- RENDER ---

  const renderSingleChoice = () => {
    const list =
      isChecked && feedback?.options
        ? feedback.options.map((o) => ({
            text: o.choice,
            isCorrect: o.is_correct,
          }))
        : task?.options?.map((s) => ({ text: s, isCorrect: undefined })) || [];

    return (
      <div className="ls-options-grid">
        {list.map((opt, idx) => {
          let cls = "ls-option-card";
          if (isChecked) {
            if (opt.isCorrect) cls += " correct";
            else if (selectedOptionIndex === idx) cls += " wrong";
          } else if (selectedOptionIndex === idx) {
            cls += " selected";
          }
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => !isChecked && setSelectedOptionIndex(idx)}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading && !isChecked) return <div>Loading...</div>;
  // Если task null, но мы не loading — значит что-то пошло не так, но handleSessionError уже должен был сработать
  if (!task) return <div>Loading task data...</div>;

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        <div className="ls-top-bar">
          <div>⚡ {stats.elo}</div>
          <div>Progress: {progress}%</div>
        </div>

        <div className="ls-content">
          <h1>{task.prompt}</h1>
          {task.type === "single_choice" && renderSingleChoice()}

          {/* Если у вас есть компоненты для других типов задач, добавьте их сюда */}

          {(task.type === "fill_blank" || task.type === "translation") && (
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isChecked}
            />
          )}
        </div>

        {isChecked && (
          <div className={isCorrect ? "ls-banner correct" : "ls-banner wrong"}>
            {isCorrect ? "Correct!" : "Wrong!"}
          </div>
        )}

        <div className="ls-footer">
          {!isChecked ? (
            <button onClick={handleCheck}>Check</button>
          ) : (
            <button onClick={handleNext}>Continue</button>
          )}
        </div>
      </div>
    </div>
  );
};
