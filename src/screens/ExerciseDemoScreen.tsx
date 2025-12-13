// src/screens/ExerciseDemoScreen.tsx
import { useState } from "react";
import { LESSONS_DATA } from "../lessons/lessonsData";
import "./lesson.css";

interface Props {
  lessonId: string;
  onFinish: () => void;
}

export const ExerciseDemoScreen = ({ lessonId, onFinish }: Props) => {
  const lesson = LESSONS_DATA[lessonId];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!lesson) {
    return <div className="lesson-card">Lesson not found</div>;
  }

  const exercise = lesson.exercises[step];

  const next = () => {
    setSelected(null);
    setShowResult(false);

    if (step + 1 >= lesson.exercises.length) {
      onFinish();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="lesson-card">
      <div className="lesson-progress">
        {step + 1}/{lesson.exercises.length}
      </div>

      {/* INFO */}
      {exercise.type === "info" && (
        <>
          <h2>{exercise.text}</h2>
          <button className="primary-btn" onClick={next}>
            Continue
          </button>
        </>
      )}

      {/* CHOICE */}
      {exercise.type === "choice" && (
        <>
          <h2>{exercise.question}</h2>

          <div className="options">
            {exercise.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${
                  showResult
                    ? i === exercise.correctIndex
                      ? "correct"
                      : i === selected
                      ? "wrong"
                      : ""
                    : selected === i
                    ? "selected"
                    : ""
                }`}
                onClick={() => !showResult && setSelected(i)}
              >
                {opt}
              </button>
            ))}
          </div>

          {!showResult ? (
            <button
              className="primary-btn"
              disabled={selected === null}
              onClick={() => setShowResult(true)}
            >
              Check
            </button>
          ) : (
            <button className="primary-btn" onClick={next}>
              Continue
            </button>
          )}
        </>
      )}
    </div>
  );
};
