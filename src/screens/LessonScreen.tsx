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
  const [sectionElo, setSectionElo] = useState<number>(0);
  const [eloChange, setEloChange] = useState<number | null>(null);
  const [shuffledLeft, setShuffledLeft] = useState<any[]>([]);
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  const getProgressInfo = () => {
    const sortedLevels = Object.entries(ELO_THRESHOLDS).sort((a, b) => a[1] - b[1]);
    const currentElo = sectionElo;
    let start = 0;
    let end = sortedLevels[0][1];

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
    
    let percent = (gained / range) * 100;
    if (percent < 5) percent = 5;
    if (percent > 100) percent = 100;

    return {
      percent,
      label: `${currentElo} / ${end}`
    };
  };

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
    const s = await LessonService.getStats();
    
    const eloKey = `${section}_elo` as keyof typeof s;
    const currentElo = (s[eloKey] as number) || s.elo || 0; 

    setStats(s);
    setSectionElo(currentElo);

    await loadNextTask();
  } catch (error: any) {
    handleSessionError(error);
  } finally {
    setLoading(false);
  }
};


const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const normalizeText = (text: string | undefined | null) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // удаляем знаки препинания
    .replace(/\s{2,}/g, " ")    // убираем двойные пробелы
    .trim();
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
    // 1. Получаем задачу (используем только один вызов)
    const taskData = await LessonService.getNextTask(section);

    if (taskData) {
      // Пропуск определенных типов, если это нужно по логике
      if (taskData.type === "fill_blank") {
        await loadNextTask();
        return;
      }

      // 2. Логика для ПАР (перемешивание)
      if (taskData.type === "match_pairs" && (taskData as any).pairs) {
        const originalPairs = (taskData as any).pairs;
        // Перемешиваем левую колонку
        setShuffledLeft([...originalPairs].sort(() => Math.random() - 0.5));
        // Перемешиваем правую колонку
        const rights = originalPairs.map((p: any) => p.right);
        setShuffledRight([...rights].sort(() => Math.random() - 0.5));
      }

      // 3. Логика для ОПРЕДЕЛЕНИЙ
      if (taskData.type === "definition_match" && (taskData as any).definitions) {
        (taskData as ExtendedTask).definitions = (taskData as any).definitions;
        taskData.options = (taskData as any).definitions.map((d: any) =>
          typeof d === 'object' ? d.definition : d
        );
      }

      // 4. Устанавливаем задачу в стейт
      setTask(taskData as ExtendedTask);
      
    } else {
      alert("No more tasks available!");
      onBack();
    }
  } catch (error: any) {
    console.error("Load Task Error:", error);
    if (typeof handleSessionError === 'function') {
      handleSessionError(error);
    }
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
    setShuffledLeft([]);
    setShuffledRight([]);
  };

 const handleCheck = async () => {
  if (!task) return;

  let answer: any;

  // 1. Формирование ответа в зависимости от типа задачи
  switch (task.type) {
    case "match_pairs":
      if (!task.pairs || Object.keys(matches).length !== task.pairs.length) return;
      answer = Object.entries(matches).map(([left, right]) => ({ left, right }));
      break;

    case "sentence_reorder":
      if (sentenceIndices.length === 0) return;
      answer = sentenceIndices;
      break;

    // СТАЛО:
case "single_choice":
  if (selectedOptionIndex === null || !task.options) return;
  const optSC = task.options[selectedOptionIndex];
  answer = typeof optSC === 'object' && optSC !== null && 'choice' in optSC 
      ? (optSC as any).choice 
      : optSC;
  break;

case "definition_match":
  if (selectedOptionIndex === null || !task.options) return;
  const optDM = task.options[selectedOptionIndex];
  const valDM = typeof optDM === 'object' && optDM !== null && 'definition' in optDM 
      ? (optDM as any).definition // или .choice, проверьте как в вашей задаче
      : optDM;
  
  // Ключевое изменение: оборачиваем в массив [ ], так как сервер ждет list
  answer = [valDM]; 
  break;

    case "multiple_choice":
      if (selectedIndices.length === 0 || !task.options) return;
      answer = selectedIndices.map(i => {
         const opt = task.options![i];
         return (typeof opt === 'object' && opt !== null && 'choice' in opt) 
           ? (opt as any).choice : opt;
      });
      break;

    case "error_identification":
      if (selectedOptionIndex === null) return;
      answer = selectedOptionIndex; 
      break;
            
    case "translation":
    case "fill_gap":
    case "conjugation":
    default:
      if (!textInput.trim()) return;
      answer = textInput.trim();
      break;
  }
    
  console.log("📤 SENDING ANSWER:", answer);
  setLoading(true);

  try {
    const result = await LessonService.submitAnswer({
      exercise_id: task.id,
      type: task.type,
      answer,
    });

    console.log("📥 SERVER RESPONSE:", result);
    if (!result) return;

    // --- ЛОГИКА ОПРЕДЕЛЕНИЯ УСПЕХА (SUCCESS) ---
    const scoreVal = result.score !== undefined ? Number(result.score) : null;
    let isCorrectResp = 
      result.is_correct === true || 
      result.correct === true || 
      result.status === "correct" ||
      (scoreVal !== null && scoreVal >= 0.5);

if (task.type === "multiple_choice") {
      const serverOptions = result.options; 
      
      if (Array.isArray(serverOptions) && Array.isArray(answer)) {
        // Берем правильные ответы из ответа сервера
        const correctAnswers = serverOptions
          .filter((opt: any) => opt.is_correct === true)
          .map((opt: any) => normalizeText(opt.choice || opt.definition));

        // Берем ответы пользователя
        const userAnswers = answer.map((a: any) => normalizeText(a));

        // Проверяем количество
        const isLengthEqual = correctAnswers.length === userAnswers.length;
        
        // Проверяем, что все выбранные есть в списке правильных
        const allSelectedAreCorrect = userAnswers.every((userAns: string) => 
          correctAnswers.includes(userAns)
        );

        // Если совпадает количество И содержание — верно. Иначе — ошибка.
        if (isLengthEqual && allSelectedAreCorrect) {
           isCorrectResp = true;
        } else {
           isCorrectResp = false;
        }
      }
    }



      if (!isCorrectResp && (task.type === "conjugation" || task.type === "verb_conjugation")) {
  const userClean = normalizeText(textInput); 
  // Берем правильный ответ из разных возможных полей сервера
  const serverCorrect = normalizeText(
    result.correct_conjugation || 
    result.correct_answer || 
    result.solution
  );

  if (userClean && serverCorrect && userClean === serverCorrect) {
    isCorrectResp = true; 
  }
}

// Автопроверка для поиска ошибок (Error Identification) по слову
if (!isCorrectResp && task.type === "error_identification") {
  const sentenceWords = task.sentence.split(' ');
  const clickedWord = sentenceWords[answer]; // answer здесь это индекс из switch
  const targetWord = result.error_word;

  console.log("📝 Checking Word:", { clickedWord, targetWord });

  if (clickedWord && targetWord && normalizeText(clickedWord) === normalizeText(targetWord)) {
    isCorrectResp = true;
  }
}

if (!isCorrectResp && task.type === "match_pairs") {
  const userPairs = answer; // Массив {left, right}
  const correctPairs = result.pairs; // Массив из ответа сервера

  if (Array.isArray(userPairs) && Array.isArray(correctPairs)) {
    // Проверяем, что каждая пара пользователя есть в списке правильных пар сервера
    const allMatchesCorrect = userPairs.every(uPair => 
      correctPairs.some(cPair => 
        normalizeText(uPair.left) === normalizeText(cPair.left) &&
        normalizeText(uPair.right) === normalizeText(cPair.right)
      )
    );

    if (allMatchesCorrect && userPairs.length === correctPairs.length) {
      isCorrectResp = true;
    }
  }
}
    // Дополнительная проверка для переводов (Soft Check)
    if (!isCorrectResp && task.type === "translation") {
      const userClean = normalizeText(textInput); 
      const serverClean = normalizeText(result.correct_translation || result.correct_sentence || result.solution);
      if (userClean && serverClean && userClean === serverClean) {
        isCorrectResp = true; 
      }
    }

    // Дополнительная проверка для определений и опций
    if (!isCorrectResp) {
      const items = result.options || result.definitions;
      if (Array.isArray(items)) {
        const correctItem = items.find((o: any) => o.is_correct === true);
        if (correctItem) {
          const correctText = correctItem.choice || correctItem.definition;
          const userAnsStr = normalizeText(String(Array.isArray(answer) ? answer[0] : answer));
          if (userAnsStr === normalizeText(correctText)) {
            isCorrectResp = true;
          }
        }
      }
    }

    // --- ОБНОВЛЕНИЕ UI ---
    setFeedback(result);
    setIsCorrect(isCorrectResp);
    setIsChecked(true);

    // --- ОБНОВЛЕНИЕ СТАТИСТИКИ (ELO) ---
    try {
      const newStats = await LessonService.getStats();
      if (newStats) {
        const newElo = newStats?.language_data?.ratings?.[section]?.elo || newStats?.elo || 0;
        if (sectionElo > 0) { 
          const diff = newElo - sectionElo;
          if (diff !== 0) {
            setEloChange(diff);
            setSectionElo(newElo);
            setTimeout(() => setEloChange(null), 3000);
          }
        } else {
          setSectionElo(newElo);
        }
        setStats(newStats);
      }
    } catch (statsError) {
      console.warn("⚠️ Stats update failed:", statsError);
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
    if (isCorrect) return "Excellent! Correct!";

    // --- 1. ПРОВЕРКА ОТВЕТА ОТ СЕРВЕРА (FEEDBACK) ---
    // Именно здесь лежит правильный ответ для definition_match
    
    // [FIX] Ищем правильный ответ в массиве definitions, который пришел от БЭКА
    if (feedback && (feedback as any).definitions) {
       const defs = (feedback as any).definitions;
       // Ищем элемент, у которого is_correct === true
       const correctItem = defs.find((d: any) => d.is_correct === true);
       if (correctItem) {
          return `Wrong answer! Correct: ${correctItem.definition}`;
       }
    }

    // Проверяем стандартные поля ответа
    const sol = feedback?.solution || 
                feedback?.correct_answer || 
                (feedback as any)?.correct_sentence || 
                (feedback as any)?.correct_conjugation ||
                (feedback as any).correct_translation;
    
    if (sol) return `Wrong answer! Correct: ${sol}`;

    // Если ответ пришел в виде options (старый формат)
    if (feedback?.options) {
      const correctOpts = feedback.options.filter((o) => o.is_correct);
      if (correctOpts.length > 0) {
        return `Wrong answer! Correct: ${correctOpts.map((o) => o.choice || o.definition).join(", ")}`;
      }
    }

    // [FIX] Sentence Reorder: Собираем предложение сами, так как оно известно заранее
    if (task?.type === "sentence_reorder" && feedback) {
       const fb = feedback as any;
       
       // Проверяем, пришел ли порядок и слова в ответе сервера
       if (fb.correct_order && fb.words) {
           const correctSentence = fb.correct_order
             .map((idx: number) => fb.words[idx])
             .join(" ");
           return `Wrong answer! Correct: ${correctSentence}`;
       }
    }


    


    // Match Pairs: Ответ известен заранее
    if (task?.type === "match_pairs" && task.pairs) {
       const pairsText = task.pairs.map((p) => `${p.left} — ${p.right}`).join("; ");
       return `Wrong answer! Pairs: ${pairsText}`;
    }

    // Translation: Ответ известен заранее
    if (task?.type === "translation") {
       // Берем то, что есть: или correct_translation (как в JSON), или старые поля
       const answer = task.correct_translation || task.translation || task.sentence;
       
       if (answer) {
          return `Wrong answer! Correct: ${answer}`;
       }
    }

    // Если есть объяснение ошибки
    if (feedback?.explanation) return `Wrong answer! ${feedback.explanation}`;

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
  if (!task?.pairs || !shuffledLeft.length) return null;
  
  const correctMap: Record<string, string> = {};
  task.pairs.forEach(p => { correctMap[p.left] = p.right; });

  return (
    <div className="ls-match-grid">
      {/* Левая колонка - используем перемешанный массив */}
      <div className="ls-match-col">
        {shuffledLeft.map((pair) => {
          const isMatched = !!matches[pair.left];
          const isSelected = selectedLeft === pair.left;
          let extraClass = "";
          
          if (isChecked && isMatched) {
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

      {/* Правая колонка - используем перемешанный массив строк */}
      <div className="ls-match-col">
        {shuffledRight.map((rightText, idx) => {
          const leftKey = Object.keys(matches).find(key => matches[key] === rightText);
          const isMatched = !!leftKey;
          let extraClass = "";
          
          if (isChecked && isMatched && leftKey) {
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
        
  // --- ИСПРАВЛЕННЫЙ РЕНДЕР ОДИНОЧНОГО ВЫБОРА (для Single Choice и Definition Match) ---
 const renderSingleChoice = () => {
  return (
    <div className="ls-options-grid">
      {(task?.options || []).map((opt, idx) => {
        let cls = "ls-option-card";
        
        if (isChecked) {
          let isThisOptionCorrect = false;
          const optNorm = normalizeText(opt);

          // 1. Проверяем definitions из ответа сервера (Твой случай!)
          if ((feedback as any)?.definitions) {
             const defs = (feedback as any).definitions;
             // Находим, является ли текущий текст (opt) правильным
             const match = defs.find((d: any) => 
                normalizeText(d.definition) === optNorm && d.is_correct === true
             );
             if (match) isThisOptionCorrect = true;
          }
          
          // 2. Стандартная проверка options
          else if (feedback?.options) {
            isThisOptionCorrect = feedback.options.find((o) => 
               normalizeText(o.choice || o.definition) === optNorm && o.is_correct
            ) !== undefined;
          } 
          // 3. Простая проверка по строке
          else {
            const correctText = (feedback as any)?.solution || (feedback as any)?.correct_answer;
            if (correctText && normalizeText(correctText) === optNorm) {
              isThisOptionCorrect = true;
            }
          }

          if (isThisOptionCorrect) cls += " correct";
          else if (selectedOptionIndex === idx) cls += " wrong";
        } else if (selectedOptionIndex === idx) {
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
};
const renderMultipleChoice = () => {
    const toggle = (i: number) => {
      if (isChecked) return;
      setSelectedIndices((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    };

    return (
      <div className="ls-options-grid">
        {(task?.options || []).map((opt: any, idx) => {
          // Определяем текст опции
          let textLabel = "";
          if (typeof opt === "string") {
            textLabel = opt;
          } else if (opt && typeof opt === "object") {
            textLabel = opt.choice || opt.definition || "";
          }

          const isSel = selectedIndices.includes(idx);
          let cls = "ls-option-card";
          
          // 🔥 ИСПРАВЛЕННАЯ ЛОГИКА СТИЛЕЙ 🔥
          if (isChecked) {
             let isThisOptionCorrect = false;
             const optNorm = normalizeText(textLabel);

             // Проверка: является ли эта опция правильной (по ответу сервера)
             if (feedback?.options) {
               isThisOptionCorrect = feedback.options.find((o) => 
                 normalizeText(o.choice || o.definition) === optNorm && o.is_correct
               ) !== undefined;
             } 
             
             if (isThisOptionCorrect) {
                 // Это ПРАВИЛЬНЫЙ вариант
                 if (isSel) {
                     cls += " correct"; // Выбран -> Зеленый
                 } else {
                     cls += " wrong";   // НЕ выбран -> Красный (как ты просил)
                 }
             } else {
                 // Это НЕПРАВИЛЬНЫЙ вариант
                 if (isSel) {
                     cls += " wrong";   // Выбран по ошибке -> Красный
                 }
             }
             
          } else if (isSel) {
             cls += " selected";
          }
          
          return (
            <button key={idx} className={cls} onClick={() => toggle(idx)}>
              {textLabel}
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
  const bannerClass = isCorrect ? "ls-banner-success" : "ls-banner-error";

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
                  backgroundColor: section === 'reading' ? '#60a5fa' : 
                                   section === 'vocabulary' ? '#f472b6' : '#34d399' 
                }}></div>
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