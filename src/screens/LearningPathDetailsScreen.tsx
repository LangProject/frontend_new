import { useMemo } from "react";
import { PATH_CONFIGS, getLessonStatuses } from "../lessons/paths";
import "./learningPath.css";

interface Props {
  pathId: string;
  learningLevel: string | null; // 👇 Добавляем проп
  onBack: () => void;
  onStartLesson: (lessonId: string) => void;
}

export const LearningPathDetailsScreen = ({
  pathId,
  learningLevel, // Принимаем уровень
  onBack,
  onStartLesson,
}: Props) => {
  const config = PATH_CONFIGS[pathId];

  const statuses = useMemo(() => {
    if (!config) return [];
    return getLessonStatuses(config.lessons);
  }, [config]);

  if (!config) return <div className="centered-content">Path not found</div>;

  // Формируем строку (например: "Level A1 · 3 Lessons")
  // Вместо того, что жестко прописано в config.levelLabel
  const displayLevelLabel = `Level ${learningLevel || "A1"} · ${
    config.lessons.length
  } Lessons`;

  return (
    <div className="path-layout">
      <div className="path-card">
        <div className="path-header">
          <button className="path-back-btn" onClick={onBack}>
            ←
          </button>
          <div className="path-header-text">
            <div className="path-title">{config.title}</div>

            {/* 👇 Используем динамический уровень */}
            <div className="path-level-label">{displayLevelLabel}</div>
          </div>
        </div>

        <div className="path-timeline">
          {config.lessons.map((lesson, index) => {
            const status = statuses[index];
            const isLast = index === config.lessons.length - 1;

            return (
              <div key={lesson.id} className="path-step">
                {!isLast && (
                  <div
                    className={`path-line ${
                      status === "completed" ? "path-line-active" : ""
                    }`}
                  ></div>
                )}
                <div
                  className={`path-node path-node-${status}`}
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
                <div className="path-step-labels" style={{ marginLeft: 16 }}>
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
