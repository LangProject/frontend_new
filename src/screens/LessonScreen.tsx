import { useState, useEffect } from "react";
import "./lesson.css";

const API_URL = ""; // Використовує проксі

interface Props {
  lessonId: string;
  onBack: () => void;
}

export const LessonScreen = ({ lessonId, onBack }: Props) => {
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elo, setElo] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Завантаження даних (Завдання + ELO)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        // 1. Отримуємо ID сесії (якщо ще немає, або створюємо нову)
        // Для спрощення беремо вправу безпосередньо, якщо API дозволяє,
        // або імітуємо отримання.
        // Згідно вашого Swagger, треба передавати x-session-id.
        // Тут ми спробуємо отримати статистику для ELO.

        // Отримуємо ELO
        // (Тут потрібен правильний запит до /user/stats, але поки імітуємо або беремо з локалсторедж)
        const savedLevel = localStorage.getItem("learning_level");
        setElo(1200); // Заглушка, якщо бек не віддає ELO без складної сесії

        // 2. Отримуємо вправу
        // const res = await fetch(`${API_URL}/session/exercise`, { ...headers... });
        // const data = await res.json();
        // setTask(data);

        // --- ІМІТАЦІЯ ВІДПОВІДІ БЕКЕНДУ (Щоб ви бачили структуру) ---
        setTimeout(() => {
          setTask({
            type: "single_choice",
            prompt: "How do you say 'Cat' in German?",
            options: [
              { choice: "Der Hund", is_correct: false },
              { choice: "Die Katze", is_correct: true },
              { choice: "Das Pferd", is_correct: false },
              { choice: "Die Maus", is_correct: false },
            ],
          });
          setLoading(false);
        }, 500);
      } catch (e) {
        console.error("Error loading lesson:", e);
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const handleCheck = () => {
    // Тут логіка перевірки відповіді через API
    if (selectedOption === null) return;

    // Імітація прогресу
    setProgress((p) => Math.min(p + 25, 100));

    // Очистка вибору для наступного питання (в реальності тут буде запит на нове питання)
    setTimeout(() => setSelectedOption(null), 1000);
  };

  if (loading) return <div className="ls-loading">Loading task...</div>;

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        {/* ВЕРХНЯ ПАНЕЛЬ: Олівець + ELO */}
        <div className="ls-top-bar">
          {/* Олівець (по центру) */}
          <div className="ls-pencil-wrapper">
            <div className="ls-pencil-progress">
              <div className="ls-p-eraser" />
              <div className="ls-p-metal" />
              <div className="ls-p-body-container">
                <div
                  className="ls-p-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="ls-p-wood" />
              <div className="ls-p-lead" />
            </div>
          </div>

          {/* Лічильник ELO (справа) */}
          <div className="ls-elo-counter">
            <span className="ls-elo-icon">⚡</span>
            <span className="ls-elo-value">{elo || 0}</span>
          </div>
        </div>

        {/* КОНТЕНТ УРОКУ */}
        <div className="ls-content">
          {task && (
            <>
              <div className="ls-task-type">
                {task.type === "single_choice"
                  ? "Select the correct answer"
                  : "Translate this sentence"}
              </div>

              <h1 className="ls-prompt-text">{task.prompt}</h1>

              <div className="ls-options-grid">
                {task.options?.map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    className={`ls-option-card ${
                      selectedOption === idx ? "selected" : ""
                    }`}
                    onClick={() => setSelectedOption(idx)}
                  >
                    {opt.choice}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ФУТЕР */}
        <div className="ls-footer">
          <button className="ls-quit-btn" onClick={onBack}>
            ✕
          </button>
          <button
            className="ls-main-btn"
            onClick={handleCheck}
            disabled={selectedOption === null}
          >
            CHECK
          </button>
        </div>
      </div>
    </div>
  );
};
