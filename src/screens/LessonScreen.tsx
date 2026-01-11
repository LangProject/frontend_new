import { useState, useEffect, useRef } from "react";
import { LessonService } from "../api/services/lessonService";
import type {
  LessonExercise,
  LessonFeedback,
  UserStats,
  AnswerValue,
} from "../types/lesson";
import "./lesson.css";

/* --- ТИПИ --- */
interface ExtendedTask extends LessonExercise {
  verb_infinitive?: string;
  context_sentence?: string;
  tense?: string;
  person?: string;
  incorrect_sentence?: string;
  sentence?: string;
  translation?: string;
  word?: string;
  definitions?: string[];
}

interface Props {
  lessonId: string;
  onBack: () => void;
}

// Пороги ELO
const ELO_THRESHOLDS: Record<string, number> = {
  A1: 100,
  A2: 300,
  B1: 600,
  B2: 1000,
  C1: 1400,
  C2: 1900,
};

export const LessonScreen = ({ lessonId, onBack }: Props) => {
  const [task, setTask] = useState<ExtendedTask | null>(null);
  const [feedback, setFeedback] = useState<LessonFeedback | null>(null);
  const [stats, setStats] = useState<UserStats>({ elo: 0, level: "A1" });

  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [eloChange, setEloChange] = useState<number | null>(null);

  // Inputs
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [reorderIndices, setReorderIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState("");

  const initialized = useRef(false);

  // --- INIT ---
  useEffect(() => {
    if (initialized.current) return;
    if (lessonId) {
      initialized.current = true;
      localStorage.setItem("session_id", lessonId);
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const init = async () => {
    try {
      const s = await LessonService.getStats();
      setStats(s);
      await loadNextTask();
    } catch (error: any) {
      handleSessionError(error);
    }
  };

  const handleSessionError = (error: any) => {
    console.error("API Error:", error);
    if (error.response?.status === 401 || error.response?.status === 404) {
      localStorage.removeItem("session_id");
      onBack();
    }
  };

  const loadNextTask = async () => {
    // 1. Скидаємо поточне завдання, щоб уникнути "залипання" старого екрану
    setTask(null);
    setLoading(true);
    resetUI();

    try {
      const t = await LessonService.getNextTask();
      console.log("📥 Loaded New Task:", t); // ДЕБАГ: Дивіться сюди, чи є поле translation!

      if (t) {
        if (t.type === "definition_match" && (t as ExtendedTask).definitions) {
          t.options = (t as ExtendedTask).definitions;
        }
        setTask(t as ExtendedTask);
      } else {
        alert("No more tasks available!");
        onBack();
      }
    } catch (error: any) {
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const resetUI = () => {
    setFeedback(null);
    setIsChecked(false);
    setIsCorrect(false);
    setEloChange(null);
    setSelectedOptionIndex(null);
    setSelectedIndices([]);
    setReorderIndices([]);
    setTextInput("");
  };

  // --- CHECK ---
  const handleCheck = async () => {
    if (!task) return;
    const oldElo = stats.elo;

    let answer: AnswerValue;
    switch (task.type) {
      case "single_choice":
      case "definition_match":
        if (selectedOptionIndex === null || !task.options) return;
        answer = task.options[selectedOptionIndex];
        break;
      case "multiple_choice":
        if (selectedIndices.length === 0 || !task.options) return;
        answer = selectedIndices.map((i) => task.options![i]);
        break;
      case "sentence_reorder":
        if (reorderIndices.length === 0) return;
        answer = reorderIndices;
        break;
      default:
        if (!textInput.trim()) return;
        answer = textInput.trim();
    }

    setLoading(true);

    try {
      const result = await LessonService.submitAnswer({
        exercise_id: task.id,
        type: task.type,
        answer,
      });

      if (!result) return;

      console.log("📤 Feedback received:", result); // ДЕБАГ: Дивіться, де лежить правильна відповідь

      setFeedback(result);
      setIsChecked(true);

      const scoreVal = Number(result.score);
      const success =
        (!isNaN(scoreVal) && scoreVal >= 0.9) ||
        result.correct === true ||
        result.is_correct === true;

      setIsCorrect(success);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const newStats = await LessonService.getStats();
      setStats(newStats);

      const diff = newStats.elo - oldElo;
      if (diff !== 0) setEloChange(diff);
    } catch (error: any) {
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    loadNextTask();
  };

  // --- 🔥 ПОКРАЩЕНИЙ ПОШУК ВІДПОВІДІ 🔥 ---
  const getFeedbackText = () => {
    if (isCorrect) return "Great job!";
    if (!feedback) return "Incorrect";

    // 1. Стандартні поля
    if (feedback.correct_answer) return `Correct: ${feedback.correct_answer}`;
    if (feedback.solution) return `Correct: ${feedback.solution}`;

    // 2. Специфічні поля (перебір варіантів)
    const fb = feedback as any;
    if (fb.correct_conjugation) return `Correct: ${fb.correct_conjugation}`;
    if (fb.correct_sentence) return `Correct: ${fb.correct_sentence}`;
    if (fb.correct_form) return `Correct: ${fb.correct_form}`;
    if (fb.target_word) return `Correct: ${fb.target_word}`;

    // 3. Sentence Reorder
    if (
      task?.type === "sentence_reorder" &&
      feedback.correct_order &&
      task.options
    ) {
      return `Correct: ${feedback.correct_order
        .map((idx: number) => task.options![idx])
        .join(" ")}`;
    }

    // 4. Options
    if (feedback.options) {
      const correctOpt = feedback.options.find((o) => o.is_correct);
      if (correctOpt) return `Correct: ${correctOpt.choice}`;
    }

    // 5. Fallback для Fill Blank, якщо нічого не прийшло, але є переклад у самому завданні
    if (task?.type === "fill_blank" && (task as ExtendedTask).translation) {
      // Це краще, ніж нічого
      return `Hint: Check the translation "${
        (task as ExtendedTask).translation
      }"`;
    }

    return "Incorrect (Answer hidden)";
  };

  // --- PROGRESS ---
  const getProgressInfo = () => {
    const sortedLevels = Object.entries(ELO_THRESHOLDS).sort(
      (a, b) => a[1] - b[1]
    );
    const currentElo = stats.elo;

    let start = 0;
    let end = sortedLevels[0][1];

    for (let i = 0; i < sortedLevels.length; i++) {
      if (currentElo >= sortedLevels[i][1]) {
        start = sortedLevels[i][1];
        end = sortedLevels[i + 1] ? sortedLevels[i + 1][1] : start + 500;
      } else {
        break;
      }
    }

    if (currentElo === 0) return { percent: 5, label: "Loading..." };

    const range = end - start;
    const gained = currentElo - start;
    const percent = Math.max((gained / range) * 100, 5);

    return {
      percent: Math.min(percent, 100),
      label: `${currentElo} / ${end}`,
    };
  };

  const progressInfo = getProgressInfo();

  // --- RENDERERS ---
  const renderSingleChoice = () => (
    <div className="ls-options-grid">
      {(task?.options || []).map((opt, idx) => {
        let cls = "ls-option-card";
        if (isChecked && feedback?.options) {
          const isOptCorrect = feedback.options.find(
            (o) => o.choice === opt
          )?.is_correct;
          if (isOptCorrect) cls += " correct";
          else if (selectedOptionIndex === idx) cls += " wrong";
        } else if (selectedOptionIndex === idx) cls += " selected";
        return (
          <button
            key={idx}
            className={cls}
            onClick={() => !isChecked && setSelectedOptionIndex(idx)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderMultipleChoice = () => {
    const toggle = (i: number) => {
      if (isChecked) return;
      setSelectedIndices((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    };
    return (
      <div className="ls-options-grid">
        {(task?.options || []).map((opt, idx) => {
          const isSel = selectedIndices.includes(idx);
          let cls = "ls-option-card";
          if (isChecked && feedback?.options) {
            const isOptCorrect = feedback.options.find(
              (o) => o.choice === opt
            )?.is_correct;
            if (isOptCorrect) cls += " correct";
            else if (isSel) cls += " wrong";
          } else if (isSel) cls += " selected";
          return (
            <button key={idx} className={cls} onClick={() => toggle(idx)}>
              <span style={{ marginRight: 8 }}>{isSel ? "☑" : "☐"}</span> {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const renderSentenceReorder = () => {
    const words = task?.options || (task as any)?.words || [];
    const currentSentence = reorderIndices.map((i) => words[i]);
    return (
      <div style={{ width: "100%" }}>
        <div className="ls-sentence-slot-area">
          {currentSentence.map((w, i) => (
            <button
              key={i}
              className="ls-word-chip in-slot"
              onClick={() =>
                !isChecked &&
                setReorderIndices((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              {w}
            </button>
          ))}
          {currentSentence.length === 0 && (
            <span style={{ color: "#999" }}>Tap words...</span>
          )}
        </div>
        <div className="ls-word-bank">
          {words.map((w, i) => (
            <button
              key={i}
              className={`ls-word-chip ${
                reorderIndices.includes(i) ? "used" : ""
              }`}
              onClick={() =>
                !isChecked &&
                !reorderIndices.includes(i) &&
                setReorderIndices([...reorderIndices, i])
              }
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTextInput = (ph: string) => (
    <input
      className="ls-text-input"
      style={{
        width: "100%",
        padding: 16,
        fontSize: 18,
        borderRadius: 12,
        border: "2px solid #ddd",
      }}
      placeholder={ph}
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      disabled={isChecked}
    />
  );

  const renderContent = () => {
    switch (task?.type) {
      case "single_choice":
      case "definition_match":
        return renderSingleChoice();
      case "multiple_choice":
        return renderMultipleChoice();
      case "sentence_reorder":
        return renderSentenceReorder();
      case "verb_conjugation":
        return (
          <div style={{ width: "100%" }}>
            <div
              style={{
                background: "#eff6ff",
                padding: 15,
                borderRadius: 10,
                marginBottom: 20,
                border: "1px solid #dbeafe",
              }}
            >
              <div style={{ color: "#666", fontSize: 12 }}>VERB</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#2563eb",
                  marginBottom: 5,
                }}
              >
                {task.verb_infinitive}
              </div>
              <div style={{ fontSize: 14 }}>
                {task.person} | {task.tense}
              </div>
            </div>
            {task.context_sentence && (
              <div style={{ fontStyle: "italic", marginBottom: 15 }}>
                "{task.context_sentence}"
              </div>
            )}
            {renderTextInput("Type conjugation...")}
          </div>
        );
      case "error_correction":
        return (
          <div style={{ width: "100%" }}>
            <div
              style={{
                background: "#fef2f2",
                padding: 15,
                borderRadius: 10,
                marginBottom: 20,
                color: "#dc2626",
                fontWeight: "bold",
              }}
            >
              ❌ {task.incorrect_sentence}
            </div>
            {renderTextInput("Type correct sentence...")}
          </div>
        );
      case "fill_blank":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 10, fontSize: 22, fontWeight: "500" }}>
              {task.sentence?.replace("___", "_______")}
            </div>

            {/* 🔥 ПЕРЕВІРКА НАЯВНОСТІ ПІДКАЗКИ 🔥 */}
            {task.translation ? (
              <div
                style={{
                  marginBottom: 20,
                  color: "#6b7280",
                  fontSize: 16,
                  fontStyle: "italic",
                  background: "#f3f4f6",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                Hint: <strong>{task.translation}</strong>
              </div>
            ) : (
              // Якщо підказки немає (старий кеш), показуємо заглушку або нічого
              <div style={{ marginBottom: 20, fontSize: 12, color: "#ccc" }}>
                No hint available
              </div>
            )}

            {renderTextInput("Type missing word...")}
          </div>
        );
      case "translation":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 15, fontSize: 18, fontWeight: "bold" }}>
              {(task as any).source_text}
            </div>
            {renderTextInput("Translate...")}
          </div>
        );
      default:
        return <div>{renderTextInput("Type answer...")}</div>;
    }
  };

  if (loading && !isChecked)
    return (
      <div className="ls-container">
        <div className="ls-loading">Loading...</div>
      </div>
    );
  if (!task)
    return (
      <div className="ls-container">
        <div className="ls-loading">No task loaded</div>
      </div>
    );

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        <div className="ls-top-bar">
          <div className="ls-elo-counter">
            <span>⚡ {stats.elo}</span>
            {eloChange && (
              <span
                className={`ls-elo-change ${
                  eloChange > 0 ? "positive" : "negative"
                }`}
              >
                {eloChange > 0 ? `+${eloChange}` : eloChange}
              </span>
            )}
          </div>

          <div className="ls-pencil-wrapper">
            <div className="ls-pencil-progress">
              <div className="ls-p-eraser"></div>
              <div className="ls-p-metal"></div>
              <div className="ls-p-body-container">
                <div
                  className="ls-p-fill"
                  style={{ width: `${progressInfo.percent}%` }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#333",
                    zIndex: 10,
                  }}
                >
                  {progressInfo.label}
                </div>
              </div>
              <div className="ls-p-wood"></div>
              <div className="ls-p-lead"></div>
            </div>
          </div>
        </div>

        <div className="ls-content">
          <h1 className="ls-prompt-text">{task.prompt}</h1>
          {renderContent()}
        </div>

        {isChecked && (
          <div className="ls-feedback-container">
            <div
              className={`ls-feedback-banner ${
                isCorrect ? "correct" : "wrong"
              }`}
            >
              {getFeedbackText()}
            </div>
          </div>
        )}

        <div className="ls-footer">
          <button className="ls-quit-btn" onClick={onBack}>
            ✕
          </button>
          {!isChecked ? (
            <button className="ls-main-btn" onClick={handleCheck}>
              CHECK
            </button>
          ) : (
            <button className="ls-main-btn" onClick={handleNext}>
              CONTINUE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
