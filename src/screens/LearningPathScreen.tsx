// src/screens/LearningPathDetailsScreen.tsx
import type { FC } from "react";
import { PATH_CONFIGS } from "../lessons/paths.ts";

type LessonStatus = "completed" | "current" | "locked";

interface LearningPathDetailsScreenProps {
  pathId: string; // "reading", "vocabulary", ...
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export const LearningPathDetailsScreen: FC<LearningPathDetailsScreenProps> = ({
  pathId,
  onBack,
  onStartLesson,
}) => {
  const config = PATH_CONFIGS[pathId];

  if (!config) {
    return (
      <div className="path-screen">
        <div className="path-card">
          <div className="path-header">
            <button className="back-btn" onClick={onBack}>
              ←
            </button>
            <h2 className="path-title">Path not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const statuses: LessonStatus[] = config.lessons.map((_, index) => {
    // сюда вставляем логику getLessonStatus из пункта 2
    // для краткости вызову хелпер:
    return getLessonStatus(config.lessons, index);
  });

  const currentIndex = statuses.findIndex((s) => s === "current");
  const currentLesson = currentIndex >= 0 ? config.lessons[currentIndex] : null;

  return (
    <div className="path-screen">
      <div className="path-card">
        {/* Header */}
        <div className="path-header">
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
          <h2 className="path-title">{config.title}</h2>
        </div>

        <div className="path-subtitle">{config.levelLabel}</div>

        {/* Вертикальный путь */}
        <div className="path-timeline">
          {config.lessons.map((lesson, index) => {
            const status = statuses[index];
            const isCurrent = status === "current";
            const isCompleted = status === "completed";

            return (
              <div key={lesson.id} className="path-step">
                {/* линия между кружками */}
                {index > 0 && (
                  <div
                    className={`path-line ${
                      isCompleted ? "path-line-active" : ""
                    }`}
                  />
                )}

                {/* сам кружок */}
                <div className={`path-node path-node-${status}`}>
                  {isCompleted ? "✓" : isCurrent ? "🙂" : "🔒"}
                </div>

                {/* подпись урока */}
                <div className="path-labels">
                  <div className="path-lesson-title">{lesson.title}</div>
                  <div className="path-lesson-meta">
                    {lesson.tasksCount} tasks
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* большая зелёная кнопка Start lesson */}
        {currentLesson && (
          <button
            className="path-start-btn"
            onClick={() => onStartLesson(currentLesson.id)}
          >
            Start {currentLesson.title}
          </button>
        )}
      </div>
    </div>
  );
};
