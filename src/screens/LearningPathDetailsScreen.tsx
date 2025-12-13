// src/screens/LearningPathDetailsScreen.tsx
import type { FC } from "react";
import { PATH_CONFIGS } from "../lessons/paths";
import { getLessonStatuses } from "../lessons/paths";
import "./learningPath.css";

interface Props {
  pathId: string;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export const LearningPathDetailsScreen: FC<Props> = ({
  pathId,
  onBack,
  onStartLesson,
}) => {
  const config = PATH_CONFIGS[pathId];

  if (!config) {
    return <div className="path-card">Lesson not found</div>;
  }

  const statuses = getLessonStatuses(config.lessons);

  return (
    <div className="path-layout">
      <div className="path-card">
        {/* HEADER */}
        <div className="path-header">
          <button className="path-back-btn" onClick={onBack}>
            ←
          </button>

          <div className="path-header-text">
            <div className="path-title">{config.title}</div>
            <div className="path-level-label">{config.levelLabel}</div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="path-timeline">
          {config.lessons.map((lesson, index) => {
            const status = statuses[index];

            return (
              <div className="path-step" key={lesson.id}>
                {index > 0 && (
                  <div
                    className={
                      "path-line " +
                      (status !== "locked" ? "path-line-active" : "")
                    }
                  />
                )}

                <div className={"path-node path-node-" + status}>
                  <span className="path-node-icon">
                    {status === "completed" && "✓"}
                    {status === "current" && "🙂"}
                    {status === "locked" && "🔒"}
                  </span>
                </div>

                <div className="path-step-labels">
                  <div className="path-lesson-title">{lesson.title}</div>
                  <div className="path-lesson-meta">
                    {lesson.tasksCount} tasks
                  </div>

                  {status === "current" && (
                    <button
                      className="path-start-btn"
                      onClick={() => onStartLesson(lesson.id)}
                    >
                      Start {lesson.title}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
