import type { FC } from "react";
import "./lesson.css";

interface Props {
  lessonId: number;
  onFinish: () => void;
}

export const LessonScreen: FC<Props> = ({ lessonId, onFinish }) => {
  return (
    <div className="lesson-container">
      <h2>Lesson {lessonId}</h2>
      <p>This is a simple placeholder lesson. Add your tasks later.</p>

      <button className="lesson-finish" onClick={onFinish}>
        Finish lesson ✓
      </button>
    </div>
  );
};
