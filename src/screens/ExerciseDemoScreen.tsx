// src/screens/ExerciseDemoScreen.tsx
import type { FC } from "react";
import { useState } from "react";
import "./lesson.css";

export type ExerciseType =
  | "single_choice"
  | "multiple_choice"
  | "match_pairs"
  | "definition_match"
  | "translation"
  | "sentence_reorder"
  | "error_correction"
  | "fill_blank"
  | "error_identification"
  | "verb_conjugation";

interface ExerciseDemoScreenProps {
  type: ExerciseType;
  step?: number;
  total?: number;
  onBack?: () => void;
  onComplete?: (result: { correct: boolean }) => void;
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export const ExerciseDemoScreen: FC<ExerciseDemoScreenProps> = ({
  type,
  step = 1,
  total = 10,
  onBack,
  onComplete,
}) => {
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // состояния под разные типы
  const [singleSelected, setSingleSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<number[]>([]);
  const [translationValue, setTranslationValue] = useState(
    "El gato está durmiendo."
  );
  const [reorderSelected, setReorderSelected] = useState<number[]>([]);
  const [errorCorrectionValue, setErrorCorrectionValue] = useState(
    "Yo soy un estudiante."
  );
  const [fillBlankSelected, setFillBlankSelected] = useState<string | null>(
    null
  );
  const [errorIdSelected, setErrorIdSelected] = useState<string | null>(null);
  const [conjugationValue, setConjugationValue] = useState("hablo");
  const [definitionSelected, setDefinitionSelected] = useState<number | null>(
    null
  );
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(
    null
  );
  const [matchPairs, setMatchPairs] = useState<
    { left: string; right: string }[]
  >([]);

  // данные для конкретных мок-заданий
  const singleOptions = ["Casa", "Perro", "Gato", "Auto"];
  const singleCorrectIndex = 2;

  const multiOptions = [
    "Manzana",
    "Pera",
    "Mesa",
    "Plátano",
    "Casa",
    "Naranja",
  ];
  const multiCorrectIndices = [0, 1, 3, 5]; // фрукты

  const reorderWords = ["El", "es", "gato"];
  const reorderCorrectOrder = [0, 2, 1]; // El gato es

  const fillBlankOptions = ["perro", "gato", "casa"];
  const fillBlankCorrect = "gato";

  const errorSentenceWords = ["El", "gatos", "es", "muy", "bonito."];
  const errorCorrectWord = "gatos";

  const definitionOptions = [
    "A small domesticated carnivorous mammal",
    "A large herbivorous mammal",
  ];
  const definitionCorrectIndex = 0;

  const matchLeft = ["Gato", "Perro", "Casa"];
  const matchRight = ["Dog", "Cat", "House"];
  const matchCorrect: Record<string, string> = {
    Gato: "Cat",
    Perro: "Dog",
    Casa: "House",
  };

  const evaluate = (): boolean => {
    switch (type) {
      case "single_choice":
        return singleSelected === singleCorrectIndex;

      case "multiple_choice": {
        const sel = new Set(multiSelected);
        const correct = new Set(multiCorrectIndices);
        if (sel.size !== correct.size) return false;
        for (const idx of correct) if (!sel.has(idx)) return false;
        return true;
      }

      case "translation": {
        const correct = "El gato está durmiendo.";
        return normalize(translationValue) === normalize(correct);
      }

      case "sentence_reorder": {
        if (reorderSelected.length !== reorderWords.length) return false;
        for (let i = 0; i < reorderCorrectOrder.length; i++) {
          if (reorderSelected[i] !== reorderCorrectOrder[i]) return false;
        }
        return true;
      }

      case "error_correction": {
        const correct = "Yo soy un estudiante.";
        return normalize(errorCorrectionValue) === normalize(correct);
      }

      case "fill_blank":
        return fillBlankSelected === fillBlankCorrect;

      case "error_identification":
        return errorIdSelected === errorCorrectWord;

      case "verb_conjugation":
        return normalize(conjugationValue) === normalize("hablo");

      case "definition_match":
        return definitionSelected === definitionCorrectIndex;

      case "match_pairs": {
        // считаем правильным, если все три пары выбраны и совпадают с correct
        if (matchPairs.length !== matchLeft.length) return false;
        for (const p of matchPairs) {
          if (matchCorrect[p.left] !== p.right) return false;
        }
        return true;
      }

      default:
        return true;
    }
  };

  const resetForNext = () => {
    setChecked(false);
    setIsCorrect(null);
    setFeedback(null);
  };

  const footerLabel = !checked ? "Check" : isCorrect ? "Continue" : "Try again";

  const handleFooterClick = () => {
    if (!checked) {
      const ok = evaluate();
      setChecked(true);
      setIsCorrect(ok);
      setFeedback(ok ? "Correct! 🎉" : "Not quite, try again.");
    } else {
      if (isCorrect) {
        resetForNext();
        onComplete?.({ correct: true });
      } else {
        // даём попробовать ещё раз
        resetForNext();
      }
    }
  };

  // ----- выбор для разных типов -----

  const toggleMultiIndex = (idx: number) => {
    setMultiSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleReorderClick = (idx: number) => {
    if (reorderSelected.includes(idx)) return;
    setReorderSelected((prev) => [...prev, idx]);
  };

  const handleReorderReset = () => {
    setReorderSelected([]);
  };

  const handleMatchLeftClick = (word: string) => {
    setMatchSelectedLeft(word);
  };

  const handleMatchRightClick = (word: string) => {
    if (!matchSelectedLeft) return;
    // не даём использовать правое слово дважды
    if (matchPairs.some((p) => p.right === word)) return;
    setMatchPairs((prev) => [
      ...prev.filter((p) => p.left !== matchSelectedLeft),
      { left: matchSelectedLeft, right: word },
    ]);
    setMatchSelectedLeft(null);
  };

  // ----- рендер контента -----

  const renderExerciseContent = () => {
    switch (type) {
      case "single_choice":
        return (
          <>
            <p className="exercise-prompt">
              Choose the correct translation for "Cat"
            </p>
            {singleOptions.map((opt, idx) => {
              const selected = singleSelected === idx;
              const classes = [
                "choice-item",
                selected && "choice-item-selected",
                checked &&
                  isCorrect &&
                  idx === singleCorrectIndex &&
                  "choice-item-correct",
                checked &&
                  !isCorrect &&
                  selected &&
                  idx !== singleCorrectIndex &&
                  "choice-item-wrong",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={opt}
                  type="button"
                  className={classes}
                  onClick={() => !checked && setSingleSelected(idx)}
                >
                  {opt}
                </button>
              );
            })}
          </>
        );

      case "multiple_choice":
        return (
          <>
            <p className="exercise-prompt">Select all words that are fruits</p>
            <div className="choice-grid">
              {multiOptions.map((opt, idx) => {
                const selected = multiSelected.includes(idx);
                const isCorrectIdx = multiCorrectIndices.includes(idx);
                const classes = [
                  "choice-item",
                  selected && "choice-item-selected",
                  checked && isCorrectIdx && "choice-item-correct",
                  checked &&
                    !isCorrect &&
                    selected &&
                    !isCorrectIdx &&
                    "choice-item-wrong",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={opt}
                    type="button"
                    className={classes}
                    onClick={() => !checked && toggleMultiIndex(idx)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        );

      case "translation":
        return (
          <>
            <p className="exercise-prompt">Translate to Spanish</p>
            <div className="sentence-big">The cat is sleeping.</div>
            <textarea
              className="text-input"
              value={translationValue}
              onChange={(e) => setTranslationValue(e.target.value)}
            />
            {checked && !isCorrect && (
              <p className="hint-line">
                Correct answer:{" "}
                <span className="hint-strong">El gato está durmiendo.</span>
              </p>
            )}
          </>
        );

      case "sentence_reorder":
        return (
          <>
            <p className="exercise-prompt">
              Reorder the words to form a sentence
            </p>
            <div className="assembly-area">
              {reorderSelected.length === 0 && (
                <span className="assembly-placeholder">
                  Tap words below to add them here
                </span>
              )}
              {reorderSelected.map((idx) => (
                <span key={idx} className="word-chip word-chip-selected">
                  {reorderWords[idx]}
                </span>
              ))}
            </div>
            <div className="word-bank">
              {reorderWords.map((w, idx) => (
                <button
                  key={w}
                  type="button"
                  className={
                    "word-chip" +
                    (reorderSelected.includes(idx) ? " word-chip-disabled" : "")
                  }
                  onClick={() => !checked && handleReorderClick(idx)}
                >
                  {w}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="secondary-btn small-btn"
              onClick={handleReorderReset}
              disabled={checked}
            >
              Reset order
            </button>
          </>
        );

      case "error_correction":
        return (
          <>
            <p className="exercise-prompt">Rewrite the sentence correctly</p>
            <p className="sentence-big">Yo es un estudiante.</p>
            <input
              className="text-input"
              value={errorCorrectionValue}
              onChange={(e) => setErrorCorrectionValue(e.target.value)}
            />
            {checked && !isCorrect && (
              <p className="hint-line">
                Correct:{" "}
                <span className="hint-strong">Yo soy un estudiante.</span>
              </p>
            )}
          </>
        );

      case "fill_blank":
        return (
          <>
            <p className="exercise-prompt">Fill in the blank</p>
            <p className="sentence-big">
              El{" "}
              <span className="blank-underline">
                {fillBlankSelected ?? "______"}
              </span>{" "}
              es muy bonito.
            </p>
            <div className="word-bank">
              {fillBlankOptions.map((w) => {
                const selected = fillBlankSelected === w;
                const isCorrectWord = w === fillBlankCorrect;
                const classes = [
                  "word-chip",
                  selected && "word-chip-selected",
                  checked && isCorrect && isCorrectWord && "word-chip-correct",
                  checked &&
                    !isCorrect &&
                    selected &&
                    !isCorrectWord &&
                    "word-chip-wrong",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={w}
                    type="button"
                    className={classes}
                    onClick={() => !checked && setFillBlankSelected(w)}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </>
        );

      case "error_identification":
        return (
          <>
            <p className="exercise-prompt">
              Identify the error in this sentence
            </p>
            <p className="sentence-big">
              {errorSentenceWords.map((w) => {
                const selected = errorIdSelected === w;
                const isError = w === errorCorrectWord;
                const classes = [
                  "word-chip",
                  selected && "word-chip-selected",
                  checked && isError && "word-chip-error-correct",
                  checked &&
                    !isCorrect &&
                    selected &&
                    !isError &&
                    "word-chip-error-wrong",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={w + Math.random()}
                    type="button"
                    className={classes}
                    onClick={() => !checked && setErrorIdSelected(w)}
                  >
                    {w}
                  </button>
                );
              })}
            </p>
          </>
        );

      case "verb_conjugation":
        return (
          <>
            <p className="exercise-prompt">Conjugate the verb correctly</p>
            <h2 className="word-big">hablar</h2>
            <p className="tag-row">
              <span className="tag-pill">Present</span>
              <span className="tag-pill">1st person singular</span>
            </p>
            <p className="sentence-big">Yo ______ español.</p>
            <input
              className="text-input"
              value={conjugationValue}
              onChange={(e) => setConjugationValue(e.target.value)}
            />
            {checked && !isCorrect && (
              <p className="hint-line">
                Correct form: <span className="hint-strong">hablo</span>
              </p>
            )}
          </>
        );

      case "definition_match":
        return (
          <>
            <p className="exercise-prompt">Choose the correct definition</p>
            <h2 className="word-big">Gato</h2>
            {definitionOptions.map((opt, idx) => {
              const selected = definitionSelected === idx;
              const isCorrectIdx = idx === definitionCorrectIndex;
              const classes = [
                "choice-item",
                selected && "choice-item-selected",
                checked && isCorrectIdx && "choice-item-correct",
                checked &&
                  !isCorrect &&
                  selected &&
                  !isCorrectIdx &&
                  "choice-item-wrong",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={opt}
                  type="button"
                  className={classes}
                  onClick={() => !checked && setDefinitionSelected(idx)}
                >
                  {opt}
                </button>
              );
            })}
          </>
        );

      case "match_pairs":
        return (
          <>
            <p className="exercise-prompt">
              Match the Spanish words with their English translations
            </p>
            <div className="match-grid">
              <div className="match-column">
                {matchLeft.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={
                      "match-item" +
                      (matchSelectedLeft === w ? " match-item-selected" : "")
                    }
                    onClick={() => !checked && handleMatchLeftClick(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <div className="match-column">
                {matchRight.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={
                      "match-item" +
                      (matchPairs.some((p) => p.right === w)
                        ? " match-item-disabled"
                        : "")
                    }
                    onClick={() => !checked && handleMatchRightClick(w)}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            {matchPairs.length > 0 && (
              <div className="match-result">
                {matchPairs.map((p) => (
                  <div key={p.left + p.right}>
                    {p.left} → {p.right}
                  </div>
                ))}
              </div>
            )}
          </>
        );

      default:
        return <p>Unknown exercise type</p>;
    }
  };

  return (
    <div className="lesson-screen">
      {/* HEADER */}
      <div className="lesson-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
        )}

        <div className="lesson-progress">
          <div className="bar">
            <div
              className="bar-fill"
              style={{ width: `${(step / total) * 100}%` }}
            />
          </div>
          <span className="step-label">
            {step}/{total}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="lesson-content">{renderExerciseContent()}</div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={
            "feedback " + (isCorrect ? "feedback-correct" : "feedback-wrong")
          }
        >
          {feedback}
        </div>
      )}

      {/* FOOTЕР */}
      <div className="lesson-footer">
        <button className="footer-btn" onClick={handleFooterClick}>
          {footerLabel}
        </button>
      </div>
    </div>
  );
};
