// src/screens/ExerciseDemoScreen.tsx
import "./lesson.css";

interface ChoiceOption {
  id: string;
  label: string;
  correct?: boolean;
}

interface Props {
  question?: string;
  options?: ChoiceOption[];
  selectedOption?: string | null;
  onSelect?: (optionId: string) => void;
  onCheck?: () => void;
  isCorrect?: boolean | null;
}

export const ExerciseDemoScreen = ({
  question,
  options,
  selectedOption,
  onSelect,
  onCheck,
  isCorrect,
}: Props) => {
  // 🛡️ ЗАЩИТА ОТ КРАША
  if (!question || !options || !Array.isArray(options)) {
    return (
      <div className="lesson-card">
        <div className="lesson-feedback error">Exercise data is not ready</div>
      </div>
    );
  }

  return (
    <div className="lesson-card">
      <h2 className="lesson-question">{question}</h2>

      <div className="lesson-options">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;

          let stateClass = "";
          if (isCorrect !== null && isCorrect !== undefined) {
            if (opt.correct) stateClass = "correct";
            else if (isSelected) stateClass = "wrong";
          } else if (isSelected) {
            stateClass = "selected";
          }

          return (
            <button
              key={opt.id}
              className={`lesson-option-btn ${stateClass}`}
              onClick={() => onSelect?.(opt.id)}
              disabled={isCorrect !== null && isCorrect !== undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        className="lesson-primary-btn"
        disabled={!selectedOption || isCorrect !== null}
        onClick={onCheck}
      >
        Check
      </button>

      {isCorrect === true && (
        <div className="lesson-feedback success">Correct!</div>
      )}
      {isCorrect === false && (
        <div className="lesson-feedback error">Try again</div>
      )}
    </div>
  );
};
