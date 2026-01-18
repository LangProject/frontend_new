import { useState, useEffect, useRef } from "react";
import { LessonService } from "../api/services/lessonService";
import type {
  LessonExercise,
  LessonFeedback,
  UserStats,
} from "../types/lesson";
import "./lesson.css";

interface ExtendedTask extends LessonExercise {
  verb_infinitive?: string;
  context_sentence?: string;
  tense?: string;
  person?: string;
  incorrect_sentence?: string;
  sentence?: string;
  translation?: string;
  words?: string[];
  correct_order?: number[];
  definitions?: string[];
  pairs?: { left: string; right: string }[];
}

interface Props {
  lessonId: string;
  section: string;
  onBack: () => void;
}

const ELO_THRESHOLDS: Record<string, number> = {
  A1: 100,
  A2: 300,
  B1: 600,
  B2: 1000,
  C1: 1400,
  C2: 1900,
};

// Функция для мягкого сравнения строк
const normalizeText = (text: string | undefined | null) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const LessonScreen = ({ lessonId, section, onBack }: Props) => {
  const [task, setTask] = useState<ExtendedTask | null>(null);
  const [feedback, setFeedback] = useState<LessonFeedback | null>(null);
  const [stats, setStats] = useState<UserStats>({ elo: 0, level: "A1" });

  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [eloChange, setEloChange] = useState<number | null>(null);

  // Состояния для ответов
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState("");

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [sentenceIndices, setSentenceIndices] = useState<number[]>([]);

  const initialized = useRef(false);

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
    setLoading(true);
    resetUI();
    setTask(null);

    try {
      const t = await LessonService.getNextTask(section);
      if (t) {
       // Пропускаем fill_blank только в секции reading
if (section === "reading" && t.type === "fill_blank") {
   await loadNextTask();
   return;
}
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
    setTextInput("");
    setMatches({});
    setSelectedLeft(null);
    setSentenceIndices([]);
  };

  const handleCheck = async () => {
    if (!task) return;
    const oldElo = stats.elo;

    let answer: any;

    switch (task.type) {
      case "match_pairs":
        if (task.pairs && Object.keys(matches).length !== task.pairs.length) return;
        answer = Object.entries(matches).map(([left, right]) => ({ left, right }));
        break;
        case "sentence_reorder":
        if (sentenceIndices.length === 0) return; 
        answer = sentenceIndices; // Отправляем массив чисел [0, 2, 1...]
        break;
      case "single_choice":
      case "definition_match":
      case "error_identification":
        if (selectedOptionIndex === null || !task.options) return;
        answer = task.type === "error_identification" 
          ? selectedOptionIndex 
          : task.options[selectedOptionIndex];
        if (task.type === "definition_match") answer = [answer]; 
        break;

      case "multiple_choice":
        if (selectedIndices.length === 0 || !task.options) return;
        answer = selectedIndices.map((i) => task.options![i]);
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

      setFeedback(result);
      setIsChecked(true);

      const scoreVal = Number(result.score);
      // Базовая проверка от сервера
      let success =
        result.status === "correct" ||
        result.correct === true ||
        result.is_correct === true ||
        (!isNaN(scoreVal) && scoreVal >= 0.9);

    // --- ФИНАЛЬНЫЙ FALLBACK ДЛЯ REORDER ---
      if (!success && task.type === "sentence_reorder") {
        // Проверяем наличие правильного порядка и в задании, и в ответе сервера
        const correctOrder = (task as any).correct_order || (result as any).correct_order;
        
        if (Array.isArray(answer) && Array.isArray(correctOrder)) {
          // Сравниваем длину и каждый элемент (приводя к числу для надежности)
          success = answer.length === correctOrder.length && 
                    answer.every((val, index) => Number(val) === Number(correctOrder[index]));
        }
      }
      // Fallback для текстовых ответов (оставляем твой)
      if (!success && typeof answer === "string") {
        const userText = normalizeText(answer);
        const fb = result as any;
        if (
          (fb.correct_conjugation && normalizeText(fb.correct_conjugation) === userText) ||
          (fb.correct_answer && normalizeText(fb.correct_answer) === userText) ||
          (fb.solution && normalizeText(fb.solution) === userText)
        ) {
          success = true;
        }
      }


      setIsCorrect(success);
      if (success) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const newStats = await LessonService.getStats();
        setStats(newStats);
        const diff = newStats.elo - oldElo;
        if (diff !== 0) setEloChange(diff);
      }
    } catch (error: any) {
      handleSessionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    loadNextTask();
  };

 const getFeedbackText = () => {
    if (isCorrect) return "Correct! Great job!";
    if (!feedback) return "Incorrect answer";

   // 1. Приоритет для REORDER (собираем предложение из индексов)
    if (task?.type === "sentence_reorder" && task.words) {
      // Ищем порядок в задании или в пришедшем фидбеке
      const order = (task as any).correct_order || (feedback as any).correct_order;
      
      if (order && Array.isArray(order)) {
        const correctSentence = order.map((idx: number) => task.words![idx]).join(" ");
        return `Wrong answer! Correct: ${correctSentence}`;
      }
    }

    // 2. Ищем готовый текст от бэкенда (для Writing/Conjugation)
    const sol = feedback.solution || 
                feedback.correct_answer || 
                (feedback as any).correct_sentence || 
                (feedback as any).correct_conjugation;
    if (sol) return `Wrong answe! Correct: ${sol}`;

    // 3. Для тестов (выбор вариантов)
    if (feedback.options) {
      const correctOpts = feedback.options.filter((o) => o.is_correct);
      if (correctOpts.length > 0) {
        return `Wrong answer! Correct: ${correctOpts.map((o) => o.choice).join(", ")}`;
      }
    }

    // 4. Для сопоставления пар
    if (task?.type === "match_pairs" && task.pairs) {
      const wrongPairs = task.pairs.filter((p) => matches[p.left] !== p.right);
      if (wrongPairs.length > 0) {
        return ` Incorrect. Corrections: ${wrongPairs.map((p) => `${p.left} → ${p.right}`).join(", ")}`;
      }
    }

    return "Incorrect answer";
  };

  const getProgressInfo = () => {
    const sortedLevels = Object.entries(ELO_THRESHOLDS).sort((a, b) => a[1] - b[1]);
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
    const range = end - start;
    const gained = currentElo - start;
    const percent = Math.max((gained / range) * 100, 5);
    return { percent: Math.min(percent, 100), label: `${currentElo} / ${end}` };
  };

  const progressInfo = getProgressInfo();
  const bannerClass = isCorrect ? "correct" : "wrong";

  // --- RENDERERS ---

  const renderErrorIdentification = () => {
    const text = task?.sentence || task?.incorrect_sentence || "";
    if (!text) return <div>No sentence data</div>;
    const words = text.split(" ");
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {words.map((w, i) => {
          const isSel = selectedOptionIndex === i;
          let bg = "white";
          let border = "#e5e7eb";
          let color = "#4b5563";
          if (isChecked && isSel) {
            bg = isCorrect ? "#dcfce7" : "#fee2e2";
            border = isCorrect ? "#58cc02" : "#ef4444";
            color = isCorrect ? "#15803d" : "#b91c1c";
          } else if (isSel) {
            bg = "#eff6ff";
            border = "#3b82f6";
            color = "#1d4ed8";
          }
          return (
            <button
              key={i}
              style={{
                background: bg,
                border: `2px solid ${border}`,
                color: color,
                borderRadius: 12,
                padding: "10px 14px",
                fontSize: 18,
                fontWeight: 700,
                cursor: isChecked ? "default" : "pointer",
                boxShadow: isChecked || isSel ? "none" : "0 3px 0 #e5e5e5",
                transition: "all 0.1s",
              }}
              onClick={() => !isChecked && setSelectedOptionIndex(i)}
            >
              {w}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMatchPairs = () => {
    if (!task?.pairs) return null;
    const rightItems = task.pairs.map((p) => p.right);
    return (
      <div className="ls-match-grid">
        <div className="ls-match-col">
          {task.pairs.map((pair) => {
            const isMatched = !!matches[pair.left];
            const isSelected = selectedLeft === pair.left;
            let extraClass = "";
            if (isChecked) {
              const userChoice = matches[pair.left];
              if (userChoice === pair.right) extraClass = " correct";
              else extraClass = " wrong";
            }
            return (
              <button
                key={pair.left}
                className={`ls-match-card ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""}${extraClass}`}
                onClick={() => !isMatched && !isChecked && setSelectedLeft(pair.left)}
                disabled={isMatched || isChecked}
              >
                {pair.left}
              </button>
            );
          })}
        </div>
        <div className="ls-match-col">
          {rightItems.map((rightText, idx) => {
            const isMatched = Object.values(matches).includes(rightText);
            let extraClass = "";
            if (isChecked && isMatched) {
              const leftKey = Object.keys(matches).find((key) => matches[key] === rightText);
              if (leftKey) {
                const isCorrectLink = task.pairs?.some((p) => p.left === leftKey && p.right === rightText);
                extraClass = isCorrectLink ? " correct" : " wrong";
              }
            }
            return (
              <button
                key={idx}
                className={`ls-match-card ${isMatched ? "matched" : ""}${extraClass}`}
                onClick={() => {
                  if (selectedLeft && !isMatched && !isChecked) {
                    setMatches((prev) => ({ ...prev, [selectedLeft]: rightText }));
                    setSelectedLeft(null);
                  }
                }}
                disabled={isMatched || isChecked}
              >
                {rightText}
              </button>
            );
          })}
        </div>
        {!isChecked && Object.keys(matches).length > 0 && (
          <button
            className="ls-reset-match-btn"
            onClick={() => {
              setMatches({});
              setSelectedLeft(null);
            }}
          >
            Reset Pairs
          </button>
        )}
      </div>
    );
  };

  const renderSingleChoice = () => (
    <div className="ls-options-grid">
      {(task?.options || []).map((opt, idx) => {
        let cls = "ls-option-card";
        
        if (isChecked) {
          // 1. Пытаемся понять, является ли эта опция правильной
          let isThisOptionCorrect = false;

          // Вариант А: Если сервер вернул детальный массив options (где есть флаг is_correct)
          if (feedback?.options) {
            isThisOptionCorrect = feedback.options.find((o) => o.choice === opt)?.is_correct ?? false;
          } 
          // Вариант Б: Если сервер вернул просто строку правильного ответа (correct_answer или solution)
          else {
            const correctText = (feedback as any)?.correct_answer || (feedback as any)?.solution;
            // Используем normalizeText для надежного сравнения
            if (correctText && normalizeText(correctText) === normalizeText(opt)) {
              isThisOptionCorrect = true;
            }
          }

          // 2. Применяем стили
          if (isThisOptionCorrect) {
            cls += " correct"; // Всегда красим правильный ответ в зеленый
          } else if (selectedOptionIndex === idx) {
            cls += " wrong"; // Если выбрано, но не верно -> красный
          }
        } 
        else if (selectedOptionIndex === idx) {
          cls += " selected";
        }

        return (
          <button key={idx} className={cls} onClick={() => !isChecked && setSelectedOptionIndex(idx)}>
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderMultipleChoice = () => {
    const toggle = (i: number) => {
      if (isChecked) return;
      setSelectedIndices((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
    };

    return (
      <div className="ls-options-grid">
        {(task?.options || []).map((opt, idx) => {
          const isSel = selectedIndices.includes(idx);
          let cls = "ls-option-card";
          
          if (isChecked) {
             let isThisOptionCorrect = false;
             
             if (feedback?.options) {
               isThisOptionCorrect = feedback.options.find((o) => o.choice === opt)?.is_correct ?? false;
             } else {
               // Для multiple_choice тут сложнее с simple string, обычно там массив.
               // Но на случай если придет строка solution
               const correctText = (feedback as any)?.correct_answer || (feedback as any)?.solution;
               if (correctText && normalizeText(correctText) === normalizeText(opt)) {
                 isThisOptionCorrect = true;
               }
             }

             if (isThisOptionCorrect) {
               cls += " correct";
             } else if (isSel) {
               cls += " wrong";
             }
          } 
          else if (isSel) {
             cls += " selected";
          }

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
  const words = task?.words || [];
  const used = new Set(sentenceIndices);

  return (
    <div className="ls-reorder-container">
      {/* Зона, где собирается предложение */}
      <div className="ls-sentence-build-area">
        {sentenceIndices.map((idx, i) => (
          <button 
            key={`s-${i}`} 
            className={`ls-word-tile in-sentence ${isChecked ? (isCorrect ? "correct" : "wrong") : ""}`}
            onClick={() => !isChecked && setSentenceIndices(prev => prev.filter((_, index) => index !== i))}
          >
            {words[idx]}
          </button>
        ))}
      </div>

      {/* Банк доступных слов */}
      {!isChecked && (
        <div className="ls-word-bank">
          {words.map((word, i) => (
            used.has(i) 
              ? <div key={`b-e-${i}`} className="ls-word-tile-placeholder" />
              : <button 
                  key={`b-${i}`} 
                  className="ls-word-tile in-bank" 
                  onClick={() => setSentenceIndices([...sentenceIndices, i])}
                >
                  {word}
                </button>
          ))}
        </div>
      )}
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
      case "match_pairs": return renderMatchPairs();
      case "sentence_reorder": return renderSentenceReorder();
      case "definition_match":
        return (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#2563eb", marginBottom: "24px", textAlign: "center" }}>
              {task.word}
            </div>
            {renderSingleChoice()}
          </div>
        );
      case "error_identification":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>Tap the word that is incorrect:</div>
            {renderErrorIdentification()}
          </div>
        );
      case "single_choice": return renderSingleChoice();
      case "multiple_choice": return renderMultipleChoice();

      case "verb_conjugation":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ background: "#eff6ff", padding: 15, borderRadius: 10, marginBottom: 20, border: "1px solid #dbeafe" }}>
              <div style={{ color: "#666", fontSize: 12 }}>VERB</div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#2563eb", marginBottom: 5 }}>{task.verb_infinitive}</div>
              <div style={{ fontSize: 14 }}>{task.person} | {task.tense}</div>
            </div>
            {task.context_sentence && <div style={{ fontStyle: "italic", marginBottom: 15 }}>"{task.context_sentence}"</div>}
            {renderTextInput("Type conjugation...")}
          </div>
        );
      case "error_correction":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ background: "#fef2f2", padding: 15, borderRadius: 10, marginBottom: 20, color: "#dc2626", fontWeight: "bold" }}>
              {task.incorrect_sentence}
            </div>
            {renderTextInput("Type correct sentence...")}
          </div>
        );
      case "translation":
        return (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: 15, fontSize: 18, fontWeight: "bold" }}>{(task as any).source_text}</div>
            {renderTextInput("Translate...")}
          </div>
        );
      default: return <div>{renderTextInput("Type answer...")}</div>;
    }
  };

  if (loading && !isChecked) return <div className="ls-container"><div className="ls-loading">Loading...</div></div>;
  if (!task) return <div className="ls-container"><div className="ls-loading">No task loaded</div></div>;

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        <div className="ls-top-bar">
          <div className="ls-elo-counter">
            <span>⚡ {stats.elo}</span>
            {eloChange && <span className={`ls-elo-change ${eloChange > 0 ? "positive" : "negative"}`}>{eloChange > 0 ? `+${eloChange}` : eloChange}</span>}
          </div>
          <div className="ls-pencil-wrapper">
            <div className="ls-pencil-progress">
              <div className="ls-p-eraser"></div>
              <div className="ls-p-metal"></div>
              <div className="ls-p-body-container">
                <div className="ls-p-fill" style={{ width: `${progressInfo.percent}%` }}></div>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "#333", zIndex: 10 }}>
                  {progressInfo.label}
                </div>
              </div>
              <div className="ls-p-wood"></div>
              <div className="ls-p-lead"></div>
            </div>
          </div>
        </div>

        <div className="ls-content" key={task.id}>
          <h1 className="ls-prompt-text">{task.prompt}</h1>
          {renderContent()}
        </div>

        {isChecked && (
          <div className="ls-feedback-container">
            <div className={`ls-feedback-banner ${bannerClass}`}>
              {getFeedbackText()}
            </div>
          </div>
        )}

        <div className="ls-footer">
          <button className="ls-quit-btn" onClick={onBack}>✕</button>
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