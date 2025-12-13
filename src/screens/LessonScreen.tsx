// src/screens/LessonScreen.tsx
import type { FC } from "react";
import { LessonEngine } from "../lessons/LessonEngine";
import "./lesson.css";

interface Props {
  lessonId: string;
  onFinish: () => void;
}

export const LessonScreen: FC<Props> = ({ lessonId, onFinish }) => {
  return (
    <div className="lesson-screen">
      <div className="lesson-card">
        <LessonEngine
          lessonId={lessonId}
          renderWelcome={({ step, totalSteps, onContinue }) => (
            <>
              <div className="lesson-progress">
                <div
                  className="lesson-progress-bar"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>

              <div className="lesson-step-counter">
                {step}/{totalSteps}
              </div>

              <h1 className="lesson-title">
                Welcome to {lessonId.replace(/_/g, " ")}
              </h1>

              <button className="lesson-primary-btn" onClick={onContinue}>
                Continue
              </button>
            </>
          )}
          renderExercise={({
            step,
            totalSteps,
            question,
            options,
            selectedOption,
            onSelect,
            onCheck,
            isCorrect,
          }) => (
            <>
              <div className="lesson-progress">
                <div
                  className="lesson-progress-bar"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>

              <div className="lesson-step-counter">
                {step}/{totalSteps}
              </div>

              <h2 className="lesson-question">{question}</h2>

              <div className="lesson-options">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    className={
                      "lesson-option-btn" +
                      (selectedOption === opt.id
                        ? " lesson-option-selected"
                        : "")
                    }
                    onClick={() => onSelect(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                className="lesson-primary-btn"
                disabled={!selectedOption}
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
            </>
          )}
          renderFinish={() => (
            <>
              <h2 className="lesson-title">Lesson completed 🎉</h2>

              <button className="lesson-primary-btn" onClick={onFinish}>
                Back to path
              </button>
            </>
          )}
        />
      </div>
    </div>
  );
};
