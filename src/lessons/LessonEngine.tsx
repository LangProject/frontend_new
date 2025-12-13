// src/lessons/LessonEngine.tsx
import { useState } from "react";
import { markLessonCompleted } from "../store/progressStore";
import { ExerciseDemoScreen } from "../screens/ExerciseDemoScreen";
import "../screens/lesson.css";

interface Props {
  lessonId: string;
  onFinish: () => void;
}

export const LessonEngine = ({ lessonId, onFinish }: Props) => {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="lesson-finish">
        <h2>Lesson completed 🎉</h2>
        <button
          className="primary-btn"
          onClick={() => {
            markLessonCompleted(lessonId);
            onFinish();
          }}
        >
          Back to path
        </button>
      </div>
    );
  }

  return (
    <ExerciseDemoScreen lessonId={lessonId} onFinish={() => setDone(true)} />
  );
};
