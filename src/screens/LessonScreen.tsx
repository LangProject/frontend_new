import { useState, useEffect } from "react";
// import { api } from "../utils/api";
import "./lesson.css";

interface Task {
  type: string;
  prompt: string;
  options?: { choice: string; is_correct: boolean }[];
  correct_answer?: string;
  sentence?: string;
  source_text?: string;
}

interface LessonScreenProps {
  lessonId: string;
  onBack: () => void;
}

const MOCK_TASKS: Task[] = [
  {
    type: "multiple_choice",
    prompt: "Cat",
    options: [
      { choice: "Perro", is_correct: false },
      { choice: "Gato", is_correct: true },
      { choice: "Casa", is_correct: false },
      { choice: "Auto", is_correct: false },
    ],
  },
  {
    type: "multiple_choice",
    prompt: "Dog",
    options: [
      { choice: "Gato", is_correct: false },
      { choice: "Perro", is_correct: true },
      { choice: "Pajaro", is_correct: false },
      { choice: "Pez", is_correct: false },
    ],
  },
];

export const LessonScreen = ({ lessonId, onBack }: LessonScreenProps) => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [elo, setElo] = useState(1200);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textInput, setTextInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const loadTask = async () => {
    setLoading(true);
    setFeedback(null);
    setSelectedOption(null);
    setTextInput("");

    setTimeout(() => {
      const nextTask = task
        ? MOCK_TASKS[Math.floor(Math.random() * MOCK_TASKS.length)]
        : MOCK_TASKS[0];
      setTask(nextTask);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    loadTask();
  }, []);

  const checkAnswer = () => {
    if (!task) return;
    let isCorrect = false;

    if (task.type === "multiple_choice" || task.type === "single_choice") {
      if (selectedOption !== null && task.options) {
        isCorrect = task.options[selectedOption].is_correct;
      }
    } else {
      const userAnswer = textInput.trim().toLowerCase();
      isCorrect = userAnswer.length > 0;
    }

    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setElo((e) => e + 15);
    else setElo((e) => Math.max(0, e - 10));
  };

  if (loading) return <div className="ls-loading">Loading...</div>;
  if (!task) return <div className="ls-loading">Error</div>;

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        {/* 🔥 НОВЫЙ "PRO" КАРАНДАШ */}
        <div className="ls-header-pencil">
          <div className="ls-p-lead"></div> {/* Грифель */}
          <div className="ls-p-wood"></div> {/* Дерево */}
          <div className="ls-p-body">
            {" "}
            {/* Зеленое тело */}
            ELO: {elo}
          </div>
          <div className="ls-p-metal"></div> {/* Металл */}
          <div className="ls-p-eraser"></div> {/* Ластик */}
        </div>

        <div className="ls-content">
          <h3 className="ls-task-type">Select the correct translation</h3>

          <h1 className="ls-prompt-text">
            {task.sentence || task.source_text || task.prompt}
          </h1>

          <div className="ls-options-grid">
            {task.options ? (
              task.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let statusClass = "";
                if (feedback === "correct" && isSelected)
                  statusClass = "opt-correct";
                if (feedback === "wrong" && isSelected)
                  statusClass = "opt-wrong";

                return (
                  <div
                    key={idx}
                    className={`ls-option-card ${
                      isSelected ? "selected" : ""
                    } ${statusClass}`}
                    onClick={() => !feedback && setSelectedOption(idx)}
                  >
                    <span className="ls-opt-text">{opt.choice}</span>
                    <span className="ls-opt-idx">{idx + 1}</span>
                  </div>
                );
              })
            ) : (
              <textarea
                className="ls-text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={!!feedback}
              />
            )}
          </div>
        </div>

        <div className="ls-footer">
          {!feedback ? (
            <button
              className="ls-main-btn"
              onClick={checkAnswer}
              disabled={selectedOption === null && !textInput}
            >
              CHECK
            </button>
          ) : (
            <button
              className="ls-main-btn"
              style={{
                backgroundColor: feedback === "wrong" ? "#ef4444" : "#22c55e",
                boxShadow: "none",
              }}
              onClick={loadTask}
            >
              {feedback === "correct" ? "CONTINUE" : "NEXT"}
            </button>
          )}

          <button className="ls-quit-link" onClick={onBack}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
};
