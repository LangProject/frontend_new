// src/lessons/LessonEngine.tsx
import { useEffect, useState } from "react";
import { getLessonData } from "./lessonsData";
import { finishLesson } from "../store/progressStore";
import "../screens/lesson.css";

interface Props {
  lessonId: string;
  onFinish: () => void;
}

export const LessonEngine = ({ lessonId, onFinish }: Props) => {
  // 1. Получаем уровень
  const userLevel = localStorage.getItem("learning_level");

  // 2. Получаем данные урока
  const lesson = getLessonData(userLevel, lessonId);

  // --- STATE ---
  const [stepIndex, setStepIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isFinished, setIsFinished] = useState(false);

  // Inputs
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [userPairs, setUserPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
  const [correctAnswerText, setCorrectAnswerText] = useState<string | null>(
    null
  );

  // Сброс состояния при смене шага (вопроса)
  useEffect(() => {
    setStatus("idle");
    setSelectedOptionId(null);
    setTextInput("");
    setUserPairs({});
    setSelectedLeft(null);
    setOrderedIndices([]);
    setCorrectAnswerText(null);
  }, [stepIndex, lesson]); // Добавил lesson в зависимости

  // ЗАЩИТА 1: Если урока вообще нет
  if (!lesson) {
    return (
      <div className="centered-content">
        <h2>Lesson not found</h2>
        <p>
          ID: {lessonId} (Level: {userLevel})
        </p>
        <button className="primary-button-duo" onClick={onFinish}>
          Back
        </button>
      </div>
    );
  }

  const steps = lesson.steps || [];
  const step = steps[stepIndex];
  const progress = steps.length > 0 ? (stepIndex / steps.length) * 100 : 0;

  // ЗАЩИТА 2: Если в уроке нет шагов или индекс вышел за пределы
  if (!step) {
    return (
      <div className="centered-content">
        <h2>Error: Empty Lesson</h2>
        <p>This lesson has no steps or data is corrupted.</p>
        <button className="primary-button-duo" onClick={onFinish}>
          Exit
        </button>
      </div>
    );
  }

  // --- LOGIC ---

  const handleNext = () => {
    if (status === "wrong" && hearts <= 0) {
      alert("Game Over! Try again.");
      setHearts(3);
      setStepIndex(0);
      return;
    }

    if (stepIndex + 1 >= steps.length) {
      finishLesson(lessonId);
      setIsFinished(true);
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleFinishScreenClick = () => {
    onFinish();
  };

  const handleCheck = () => {
    let isCorrect = false;
    let correctText = "";

    switch (step.type) {
      case "select_one":
      case "fill_blank":
        const correctOpt = step.options?.find((o) => o.isCorrect);
        if (correctOpt?.id === selectedOptionId) isCorrect = true;
        correctText = correctOpt?.text || "";
        break;

      case "input_text":
        const answers = Array.isArray(step.correctText)
          ? step.correctText
          : [step.correctText || ""];
        if (
          answers.some(
            (a) => a?.toLowerCase().trim() === textInput.trim().toLowerCase()
          )
        ) {
          isCorrect = true;
        }
        correctText = answers[0] || "";
        break;

      case "match_pairs":
        if (step.pairs && Object.keys(userPairs).length === step.pairs.length) {
          if (step.pairs.every((p) => userPairs[p.left] === p.right))
            isCorrect = true;
        }
        correctText = "Match all pairs correctly";
        break;

      case "reorder":
        if (
          JSON.stringify(orderedIndices) === JSON.stringify(step.correctOrder)
        )
          isCorrect = true;
        correctText =
          step.correctOrder?.map((i) => step.words?.[i]).join(" ") || "";
        break;

      case "error_id":
        if (
          orderedIndices.length > 0 &&
          orderedIndices[0] === step.correctIndex
        )
          isCorrect = true;
        correctText = `Error is "${step.words?.[step.correctIndex || 0]}"`;
        break;

      default:
        isCorrect = true; // Для info слайдов
    }

    if (isCorrect) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setHearts((h) => Math.max(0, h - 1));
      setCorrectAnswerText(correctText);
    }
  };

  // --- HELPERS ---
  const isLeftPaired = (id: string) => !!userPairs[id];
  const isRightPaired = (id: string) => Object.values(userPairs).includes(id);

  // --- RENDER FINISH SCREEN ---
  if (isFinished) {
    return (
      <div className="lesson-complete-screen">
        <div className="complete-content">
          <div className="complete-icon">🎉</div>
          <h1 className="complete-title">Lesson Completed!</h1>
          <div className="complete-stats">
            <div className="stat-box">
              <span className="stat-label">XP EARNED</span>
              <span className="stat-value text-yellow">⚡ 15</span>
            </div>
          </div>
        </div>
        <div className="lesson-footer-area">
          <button
            className="primary-button-duo btn-success"
            onClick={handleFinishScreenClick}
          >
            CONTINUE
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER LESSON ---
  return (
    <div className="lesson-container">
      <div className="lesson-top-bar">
        <div className="bar-container">
          <div className="bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="hearts-container">❤️ {hearts}</div>
      </div>

      <div className="lesson-scroll-area">
        {step.type === "info" && (
          <div className="centered-content">
            <h2 className="lesson-title">{step.title}</h2>
            <p className="lesson-text">{step.question}</p>
          </div>
        )}

        {(step.type === "select_one" || step.type === "fill_blank") && (
          <>
            <h2 className="lesson-instruction">{step.title}</h2>
            {step.type === "fill_blank" ? (
              <div className="sentence-big">
                {step.context?.replace("_____", "____")}
              </div>
            ) : (
              <h1 className="word-hero">{step.question}</h1>
            )}

            <div className="options-grid">
              {step.options?.map((opt, i) => (
                <button
                  key={opt.id}
                  className={`option-card ${
                    selectedOptionId === opt.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    status === "idle" && setSelectedOptionId(opt.id)
                  }
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </>
        )}

        {step.type === "match_pairs" && (
          <>
            <h2 className="lesson-instruction">{step.title}</h2>
            <div className="match-container">
              <div className="match-column">
                {step.pairs?.map((p) => (
                  <button
                    key={p.left}
                    className={`match-card ${
                      selectedLeft === p.left ? "active" : ""
                    } ${isLeftPaired(p.left) ? "paired" : ""}`}
                    onClick={() =>
                      !isLeftPaired(p.left) &&
                      status === "idle" &&
                      setSelectedLeft(selectedLeft === p.left ? null : p.left)
                    }
                  >
                    {p.left}
                  </button>
                ))}
              </div>
              <div className="match-column">
                {step.pairs?.map((p) => (
                  <button
                    key={p.right}
                    className={`match-card ${
                      isRightPaired(p.right) ? "paired" : ""
                    }`}
                    onClick={() => {
                      if (status !== "idle" || isRightPaired(p.right)) return;
                      if (selectedLeft) {
                        setUserPairs({ ...userPairs, [selectedLeft]: p.right });
                        setSelectedLeft(null);
                      }
                    }}
                  >
                    {p.right}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step.type === "reorder" && (
          <>
            <h2 className="lesson-instruction">{step.title}</h2>
            <h3 className="sub-instruction">{step.question}</h3>
            <div className="assembly-area">
              {orderedIndices.map((i) => (
                <button
                  key={i}
                  className="word-chip"
                  onClick={() =>
                    status === "idle" &&
                    setOrderedIndices(orderedIndices.filter((idx) => idx !== i))
                  }
                >
                  {step.words?.[i]}
                </button>
              ))}
            </div>
            <div className="word-bank">
              {step.words?.map(
                (w, i) =>
                  !orderedIndices.includes(i) && (
                    <button
                      key={i}
                      className="word-chip"
                      onClick={() =>
                        status === "idle" &&
                        setOrderedIndices([...orderedIndices, i])
                      }
                    >
                      {w}
                    </button>
                  )
              )}
            </div>
          </>
        )}

        {step.type === "input_text" && (
          <>
            <h2 className="lesson-instruction">{step.title}</h2>
            <h1 className="word-hero">{step.question}</h1>
            <textarea
              className="lesson-textarea"
              placeholder="Type answer..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              readOnly={status !== "idle"}
            />
          </>
        )}

        {step.type === "error_id" && (
          <>
            <h2 className="lesson-instruction">{step.title}</h2>
            <p className="sub-instruction">{step.question}</p>
            <div className="sentence-container">
              {step.words?.map((word, index) => (
                <button
                  key={index}
                  className={`clickable-word ${
                    orderedIndices.includes(index) ? "selected-error" : ""
                  }`}
                  onClick={() =>
                    status === "idle" && setOrderedIndices([index])
                  }
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="lesson-footer-area">
        {status === "idle" ? (
          <button
            className="primary-button-duo"
            onClick={step.type === "info" ? handleNext : handleCheck}
            disabled={
              (step.type === "select_one" && !selectedOptionId) ||
              (step.type === "fill_blank" && !selectedOptionId) ||
              (step.type === "match_pairs" &&
                Object.keys(userPairs).length !== (step.pairs?.length || 0)) ||
              (step.type === "reorder" && orderedIndices.length === 0) ||
              (step.type === "input_text" && textInput.length === 0) ||
              (step.type === "error_id" && orderedIndices.length === 0)
            }
          >
            {step.type === "info" ? "CONTINUE" : "CHECK"}
          </button>
        ) : (
          <div
            className={`feedback-sheet ${
              status === "correct" ? "sheet-success" : "sheet-error"
            }`}
          >
            <div className="feedback-header">
              <div className="feedback-icon">
                {status === "correct" ? "🎉" : "❌"}
              </div>
              <div className="feedback-text">
                <div className="feedback-title">
                  {status === "correct" ? "Excellent!" : "Incorrect"}
                </div>
                {status === "wrong" && (
                  <div className="feedback-correct-answer">
                    Correct: {correctAnswerText}
                  </div>
                )}
              </div>
            </div>
            <button
              className={`primary-button-duo ${
                status === "correct" ? "btn-success" : "btn-error"
              }`}
              onClick={handleNext}
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
