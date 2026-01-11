import { useState, useEffect, useRef } from "react";
import { LessonService } from "../api/services/lessonService";
import type {
  LessonExercise,
  LessonFeedback,
  UserStats,
  AnswerValue,
} from "../types/lesson";
import "./lesson.css";

interface ExtendedTask extends LessonExercise {
  verb_infinitive?: string;
  context_sentence?: string;
  tense?: string;
  person?: string;
  incorrect_sentence?: string;
  sentence?: string;
  word?: string;
  definitions?: string[];
}

interface Props {
  lessonId: string;
  onBack: () => void;
}

export const LessonScreen = ({ lessonId, onBack }: Props) => {
  const [task, setTask] = useState<ExtendedTask | null>(null);
  const [feedback, setFeedback] = useState<LessonFeedback | null>(null);
  const [stats, setStats] = useState<UserStats>({ elo: 1200, level: "A1" });

  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eloChange, setEloChange] = useState<number | null>(null);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [reorderIndices, setReorderIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState("");

  // 🔥 2. СОЗДАЕМ РЕФ ДЛЯ ЗАЩИТЫ ОТ ДВОЙНОГО ВЫЗОВА
  const initialized = useRef(false);

  useEffect(() => {
    // Проверяем: если уже инициализировали, выходим
    if (initialized.current) return;

    if (lessonId) {
      // Ставим флаг, что инициализация запущена
      initialized.current = true;

      console.log("🚀 Initializing Lesson..."); // Для проверки в консоли
      localStorage.setItem("session_id", lessonId);
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // useEffect(() => {
  //   if (lessonId) {
  //     localStorage.setItem("session_id", lessonId);
  //     init();
  //   }
  // }, [lessonId]);

  const handleSessionError = (error: any) => {
    if (
      error.response &&
      (error.response.status === 404 || error.response.status === 401)
    ) {
      console.warn("Session lost or invalid token.");
      localStorage.removeItem("session_id");
      onBack();
    } else {
      console.error("API Error:", error);
    }
  };

  const init = async () => {
    try {
      const s = await LessonService.getStats();
      setStats(s);
      await loadNextTask();
    } catch (error: any) {
      handleSessionError(error);
    }
  };

  const loadNextTask = async () => {
    setLoading(true);
    // resetUI();
    try {
      const t = await LessonService.getNextTask();
      if (t) {
        if (t.type === "definition_match" && (t as ExtendedTask).definitions) {
          t.options = (t as ExtendedTask).definitions;
        }
        setTask(t as ExtendedTask);
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
    setEloChange(null);
    setSelectedOptionIndex(null);
    setSelectedIndices([]);
    setReorderIndices([]);
    setTextInput("");
  };

  const handleCheck = async () => {
    if (!task) return;

    const oldElo = stats.elo;
    console.log("🔍 Old ELO:", oldElo);

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

      case "fill_blank":
      case "translation":
      case "verb_conjugation":
      case "error_correction":
      case "error_identification":
        if (!textInput.trim()) return;
        answer = textInput.trim();
        break;

      default:
        console.warn("Unknown task type:", task.type);
        return;
    }

    setLoading(true);

    try {
      const result = await LessonService.submitAnswer({
        exercise_id: task.id,
        type: task.type,
        answer,
      });

      if (!result) return;

      setFeedback(result);
      setIsChecked(true);

      let correct = false;

      if (task.type === "single_choice" || task.type === "definition_match") {
        const userChoice = task.options![selectedOptionIndex!];
        const correctOpt = result.options?.find((o) => o.is_correct);
        if (correctOpt?.choice === userChoice) correct = true;
      } else if (task.type === "multiple_choice") {
        const userChoices = selectedIndices.map((i) => task.options![i]).sort();
        const correctChoices = result.options
          ?.filter((o) => o.is_correct)
          .map((o) => o.choice)
          .sort();
        correct =
          JSON.stringify(userChoices) === JSON.stringify(correctChoices);
      } else if (task.type === "sentence_reorder" && result.correct_order) {
        correct =
          JSON.stringify(reorderIndices) ===
          JSON.stringify(result.correct_order);
      } else if (result.correct_answer) {
        correct =
          textInput.trim().toLowerCase() ===
          result.correct_answer.toLowerCase();
      } else {
        correct = true;
      }

      setIsCorrect(correct);
      if (correct) setProgress((p) => Math.min(p + 10, 100));

      // Ждем, пока сервер обновит БД
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newStats = await LessonService.getStats();
      console.log("🚀 New ELO:", newStats.elo);

      setStats(newStats);

      const diff = newStats.elo - oldElo;
      console.log("📈 Diff:", diff);

      if (diff !== 0) {
        setEloChange(diff);
      }
    } catch (error: any) {
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (progress >= 100) {
      LessonService.endLevel().catch(console.error);
      onBack();
    } else {
      loadNextTask();
    }
  };

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

  const renderMultipleChoice = () => {
    const list =
      isChecked && feedback?.options
        ? feedback.options.map((o) => ({
            text: o.choice,
            isCorrect: o.is_correct,
          }))
        : task?.options?.map((s) => ({ text: s, isCorrect: undefined })) || [];

    const toggleIndex = (idx: number) => {
      if (isChecked) return;
      if (selectedIndices.includes(idx))
        setSelectedIndices((prev) => prev.filter((i) => i !== idx));
      else setSelectedIndices((prev) => [...prev, idx]);
    };

    return (
      <div className="ls-options-grid">
        {list.map((opt, idx) => {
          const isSelected = selectedIndices.includes(idx);
          let cls = "ls-option-card";

          if (isChecked) {
            if (opt.isCorrect) cls += " correct";
            else if (isSelected && !opt.isCorrect) cls += " wrong";
          } else if (isSelected) {
            cls += " selected";
          }

          return (
            <button key={idx} className={cls} onClick={() => toggleIndex(idx)}>
              <span style={{ marginRight: 10 }}>
                {isSelected || (isChecked && opt.isCorrect) ? "☑" : "☐"}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>
    );
  };

  const renderSentenceReorder = () => {
    if (!task?.options && !(task as any).words)
      return <div>Error: No words provided</div>;
    const wordsSource = task.options || (task as any).words || [];
    const currentSentence = reorderIndices.map((idx) => wordsSource[idx]);

    return (
      <div style={{ width: "100%" }}>
        <div className="ls-sentence-slot-area">
          {currentSentence.length === 0 && !isChecked && (
            <span style={{ color: "#9ca3af" }}>
              Tap words to build sentence...
            </span>
          )}
          {currentSentence.map((word, i) => (
            <button
              key={`slot-${i}`}
              className="ls-word-chip in-slot"
              onClick={() =>
                !isChecked &&
                setReorderIndices((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              {word}
            </button>
          ))}
        </div>
        <div className="ls-word-bank">
          {wordsSource.map((word, idx) => {
            const isUsed = reorderIndices.includes(idx);
            return (
              <button
                key={`bank-${idx}`}
                className={`ls-word-chip ${isUsed ? "used" : ""}`}
                onClick={() =>
                  !isUsed &&
                  !isChecked &&
                  setReorderIndices([...reorderIndices, idx])
                }
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVerbConjugation = () => (
    <div style={{ width: "100%", marginBottom: 20 }}>
      <div
        style={{
          background: "#eff6ff",
          padding: "16px",
          borderRadius: "12px",
          border: "2px solid #bfdbfe",
          marginBottom: "20px",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
          VERB
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#1e40af",
            marginBottom: 10,
          }}
        >
          {task?.verb_infinitive}
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>TENSE</span>
            <br />
            <strong>{task?.tense}</strong>
          </div>
          <div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>PERSON</span>
            <br />
            <strong>{task?.person}</strong>
          </div>
        </div>
      </div>
      {task?.context_sentence && (
        <div style={{ fontSize: 18, marginBottom: 15, fontStyle: "italic" }}>
          "{task.context_sentence}"
        </div>
      )}
      {renderTextInput("Type conjugated verb...")}
    </div>
  );

  const renderErrorCorrection = () => (
    <div style={{ width: "100%" }}>
      <div
        style={{
          background: "#fee2e2",
          padding: "16px",
          borderRadius: "12px",
          border: "2px solid #fecaca",
          marginBottom: "20px",
          color: "#b91c1c",
          fontWeight: "bold",
        }}
      >
        ❌ {task?.incorrect_sentence}
      </div>
      {renderTextInput("Type correct sentence...")}
    </div>
  );

  const renderTextInput = (placeholder: string = "Type answer...") => (
    <input
      className="ls-text-input"
      style={{
        width: "100%",
        padding: "16px",
        fontSize: "18px",
        borderRadius: "16px",
        border: "2px solid #e5e7eb",
        outline: "none",
        background: isChecked ? "#f9fafb" : "white",
      }}
      placeholder={placeholder}
      value={textInput}
      onChange={(e) => setTextInput(e.target.value)}
      disabled={isChecked}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isChecked) handleCheck();
      }}
    />
  );

  if (loading && !isChecked)
    return (
      <div className="ls-container">
        <div className="ls-loading">Loading...</div>
      </div>
    );
  if (!task)
    return (
      <div className="ls-container">
        <div className="ls-loading">Loading task data...</div>
      </div>
    );

  let content;
  switch (task.type) {
    case "single_choice":
    case "definition_match":
      content = renderSingleChoice();
      break;
    case "multiple_choice":
      content = renderMultipleChoice();
      break;
    case "sentence_reorder":
      content = renderSentenceReorder();
      break;
    case "verb_conjugation":
      content = renderVerbConjugation();
      break;
    case "error_correction":
      content = renderErrorCorrection();
      break;
    case "fill_blank":
      content = (
        <div style={{ width: "100%" }}>
          {task.sentence && (
            <div style={{ fontSize: 18, marginBottom: 15 }}>
              {task.sentence.replace("___", "_____")}
            </div>
          )}
          {renderTextInput("Type missing word...")}
        </div>
      );
      break;
    case "translation":
      content = (
        <div style={{ width: "100%" }}>
          {(task as any).source_text && (
            <div style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
              {(task as any).source_text}
            </div>
          )}
          {renderTextInput("Type translation...")}
        </div>
      );
      break;
    default:
      content = (
        <div>
          <div style={{ color: "orange", marginBottom: 10 }}>
            Unknown type: {task.type}
          </div>
          {renderTextInput()}
        </div>
      );
  }

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        <div className="ls-top-bar">
          <div className="ls-elo-counter">
            <span className="ls-elo-icon">⚡</span>
            <span className="ls-elo-value">{stats.elo}</span>
            {eloChange !== null && (
              <span
                className={`ls-elo-change ${
                  eloChange >= 0 ? "positive" : "negative"
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
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="ls-p-wood"></div>
              <div className="ls-p-lead"></div>
            </div>
          </div>
        </div>

        <div className="ls-content">
          <h1 className="ls-prompt-text">{task.prompt}</h1>
          {content}
        </div>

        {isChecked && (
          <div className="ls-feedback-container">
            <div
              className={
                isCorrect
                  ? "ls-feedback-banner correct"
                  : "ls-feedback-banner wrong"
              }
            >
              {isCorrect
                ? "Great job!"
                : `Correct: ${feedback?.correct_answer || "See details"}`}
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
