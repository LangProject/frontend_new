import { useMemo } from "react";
import { PATH_CONFIGS, getLessonStatuses } from "../lessons/paths";
import "./learningPath.css";

interface Props {
  pathId: string;
  learningLevel: string | null;
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export const LearningPathDetailsScreen = ({
  pathId,
  learningLevel,
  onBack,
  onStartLesson,
}: Props) => {
  const config = PATH_CONFIGS[pathId];

  const statuses = useMemo(() => {
    if (!config) return [];
    return getLessonStatuses(config.lessons);
  }, [config]);

  if (!config) return <div className="centered-content">Path not found</div>;

  const levelText = learningLevel ? `Level ${learningLevel}` : "Level A1";

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
            <div className="path-level-label">
              {levelText} · {config.lessons.length} Lessons
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="path-timeline">
          {config.lessons.map((lesson, index) => {
            const status = statuses[index];
            const isLast = index === config.lessons.length - 1;

            return (
              <div key={lesson.id} className={`path-step path-step-${status}`}>
                {/* ЛЕВАЯ КОЛОНКА: Линия + Иконка */}
                <div className="path-step-left">
                  {/* Линия рисуется, если это не последний урок */}
                  {!isLast && (
                    <div
                      className={`path-line ${
                        status === "completed" ? "active" : ""
                      }`}
                    />
                  )}

                  {/* Сам кружок */}
                  <div
                    className={`path-node ${status}`}
                    onClick={() =>
                      status !== "locked" && onStartLesson(lesson.id)
                    }
                  >
                    {status === "completed"
                      ? "✓"
                      : status === "locked"
                      ? "🔒"
                      : "★"}
                  </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА: Текст + Кнопка */}
                <div className="path-step-content">
                  <div className="path-lesson-title">{lesson.title}</div>
                  <div className="path-lesson-meta">
                    {lesson.tasksCount} tasks
                  </div>

                  {status === "current" && (
                    <button
                      className="path-start-btn"
                      onClick={() => onStartLesson(lesson.id)}
                    >
                      START
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
