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
  const [sectionElo, setSectionElo] = useState<number>(0); // ЭЛО конкретного урока/секции
  const [eloChange, setEloChange] = useState<number | null>(null);

  const getProgressInfo = () => {
    // Сортируем пороги ELO для правильного расчета
    const sortedLevels = Object.entries(ELO_THRESHOLDS).sort((a, b) => a[1] - b[1]);
    const currentElo = sectionElo;
    let start = 0;
    let end = sortedLevels[0][1];

    // Определяем текущий диапазон уровня
    for (let i = 0; i < sortedLevels.length; i++) {
      if (currentElo >= sortedLevels[i][1]) {
        start = sortedLevels[i][1];
        const nextLevel = sortedLevels[i + 1];
        end = nextLevel ? nextLevel[1] : start + 500;
      } else {
        break;
      }
    }

    const range = end - start;
    const gained = currentElo - start;
    
    // Вычисляем процент заполнения (минимум 5% для красоты карандаша)
    let percent = (gained / range) * 100;
    if (percent < 5) percent = 5;
    if (percent > 100) percent = 100;

    return {
      percent,
      label: `${currentElo} / ${end}`
    };
  };

  const [userStats, setUserStats] = useState<any>(null);
  

  const [loading, setLoading] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  

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
    setLoading(true);
    // 1. Получаем свежие данные (как в loadStats на дашборде)
    const s = await LessonService.getStats();
    
    // 2. Определяем, какое ELO брать, основываясь на пропе section
    // Если section === "vocabulary", возьмем s.vocabulary_elo
    const eloKey = `${section}_elo` as keyof typeof s;
    const currentElo = (s[eloKey] as number) || s.elo || 0; 

    // 3. Сохраняем данные. 
    // ВАЖНО: используем 's' напрямую для расчетов ниже, а не стейт 'stats'
    setStats(s);
    setSectionElo(currentElo);

    await loadNextTask();
  } catch (error: any) {
    handleSessionError(error);
  } finally {
    setLoading(false);
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
        // ИСПРАВЛЕНО: Полный пропуск fill_blank для всех секций
        if (t.type === "fill_blank") {
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

    let answer: any;

    switch (task.type) {
      case "match_pairs":
        // ИСПРАВЛЕНИЕ 1: Проверяем количество, но формируем ответ на основе task.pairs,
        // чтобы гарантировать ПРАВИЛЬНЫЙ ПОРЯДОК пар, как ожидает сервер.
        if (task.pairs && Object.keys(matches).length !== task.pairs.length) return;
        
        // Мы берем пару из задания (p) и ищем, что пользователь выбрал для p.left
        answer = task.pairs!.map((p) => ({
          left: p.left,
          right: matches[p.left] // Берем выбор пользователя для этого слова
        }));
        break;

      case "sentence_reorder":
        if (sentenceIndices.length === 0) return;
        answer = sentenceIndices;
        break;

      case "single_choice":
      case "definition_match":
        if (selectedOptionIndex === null || !task.options) return;
        
        // ИСПРАВЛЕНИЕ 2: Безопасное извлечение значения.
        // Если options - это массив объектов (как в JSON), берем .choice.
        // Если это массив строк, берем саму строку.
        const selectedOpt = task.options[selectedOptionIndex];
        const answerValue = typeof selectedOpt === 'object' && selectedOpt !== null && 'choice' in selectedOpt 
            ? (selectedOpt as any).choice 
            : selectedOpt;

        answer = answerValue;
        
        if (task.type === "definition_match") answer = [answer]; 
        break;

      case "error_identification":
        if (selectedOptionIndex === null) return;
        answer = selectedOptionIndex; 
        break;

      case "multiple_choice":
        if (selectedIndices.length === 0 || !task.options) return;
        // Здесь тоже может потребоваться .choice, если options - объекты
        answer = selectedIndices.map((i) => {
           const opt = task.options![i];
           return (typeof opt === 'object' && opt !== null && 'choice' in opt) 
             ? (opt as any).choice 
             : opt;
        });
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

      const scoreVal = result.score !== undefined ? Number(result.score) : null;
      let success =
        result.status === "correct" ||
        result.correct === true ||
        result.is_correct === true ||
        (!isNaN(scoreVal) && scoreVal >= 0.5);

      setIsCorrect(success);

      // ОБНОВЛЕНИЕ ЭЛО: Исправлена опечатка newSectionElo -> newElo
      const newStats = await LessonService.getStats();
      const newElo = (newStats.language_data.ratings as any)[section]?.elo || 0;
      const diff = newElo - sectionElo;
      
      if (diff !== 0) {
        setEloChange(newElo - sectionElo);
        setSectionElo(newElo);
        setTimeout(() => setEloChange(null), 3000);
      }
      
      setStats(newStats);

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
    if (isCorrect) return "Excellent! Correct!";
    if (!feedback) return "Wrong answer!";

    const getCorrectPairsText = () => {
    if (!task?.pairs) return "";
    return task.pairs
      .map((p) => `${p.left} — ${p.right}`)
      .join("; ");
  };
    if (task?.type === "match_pairs") {
      return `Wrong answer! Correct pairs: ${getCorrectPairsText()}`;
    }
    const sol = feedback.solution || 
                feedback.correct_answer || 
                (feedback as any).correct_sentence || 
                (feedback as any).correct_conjugation || // Для спряжений
                (task as any).correct_answer;

    if (sol) return `Wrong answer! Correct answer: ${sol}`;

    if (feedback.options) {
      const correctOpts = feedback.options.filter((o) => o.is_correct);
      if (correctOpts.length > 0) {
        return `Wrong answer! Correct answer: ${correctOpts.map((o) => o.choice).join(", ")}`;
      }
    }

    if (feedback.explanation) return `Wrong answer! ${feedback.explanation}`;

    return "Wrong answer!";
  };

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
    
    // 1. Создаем карту эталонных ответов для быстрой сверки: { "слово": "перевод" }
    const correctMap: Record<string, string> = {};
    task.pairs.forEach(p => { correctMap[p.left] = p.right; });

    // Список правых элементов (переводов)
    const rightItems = task.pairs.map((p) => p.right);

    return (
      <div className="ls-match-grid">
        {/* Левая колонка (немецкие слова) */}
        <div className="ls-match-col">
          {task.pairs.map((pair) => {
            const isMatched = !!matches[pair.left];
            const isSelected = selectedLeft === pair.left;
            let extraClass = "";
            
            if (isChecked && isMatched) {
              // Сверяем: то что выбрал юзер (matches[pair.left]) == эталон (correctMap[pair.left])
              extraClass = matches[pair.left] === correctMap[pair.left] ? " correct" : " wrong";
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

        {/* Правая колонка (английские переводы) */}
        <div className="ls-match-col">
          {rightItems.map((rightText, idx) => {
            // Ищем, к какому левому слову юзер привязал этот правый текст
            const leftKey = Object.keys(matches).find(key => matches[key] === rightText);
            const isMatched = !!leftKey;
            let extraClass = "";
            
            if (isChecked && isMatched && leftKey) {
              // Проверяем правильность этой конкретной связи
              extraClass = rightText === correctMap[leftKey] ? " correct" : " wrong";
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

const progressInfo = getProgressInfo(); 
  const bannerClass = isCorrect ? "correct" : "wrong";

  if (loading && !isChecked) return <div className="ls-container"><div className="ls-loading">Loading...</div></div>;
  if (!task) return <div className="ls-container"><div className="ls-loading">No task loaded</div></div>;

  return (
    <div className="ls-container">
      <div className="ls-inner-content">
        <div className="ls-top-bar">
          <div className="ls-pencil-wrapper">
            <div className="ls-pencil-progress">
              <div className="ls-p-eraser"></div>
              <div className="ls-p-metal"></div>
              <div className="ls-p-body-container">
                <div className="ls-p-fill" style={{ 
                                             width: `${progressInfo.percent}%`,
  // Цвета такие же, как в массиве .map на DashboardScreen
  backgroundColor: section === 'reading' ? '#60a5fa' : 
                   section === 'vocabulary' ? '#f472b6' : '#34d399' 
}}>

</div>
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