import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";
import "./learningPath.css";

// Імпортуємо ваші картинки
import readingIcon from "../assets/reading.jpg";
import vocabIcon from "../assets/vocab.jpg";
import writingIcon from "../assets/writing.jpg";

interface Props {
  uiLanguage: UiLangCode;
  learningLevel: string | null;
  onOpenPath: (topicId: string) => void;
}

export const DashboardScreen = ({
  uiLanguage,
  learningLevel,
  onOpenPath,
}: Props) => {
  const TOPICS = [
    {
      id: "reading",
      title: t(uiLanguage, "dashboard.reading"),
      icon: readingIcon,
      color: "#3b82f6", // Синій
      progress: 0,
    },
    {
      id: "vocabulary",
      title: t(uiLanguage, "dashboard.vocabulary"),
      icon: vocabIcon,
      color: "#8b5cf6", // Фіолетовий
      progress: 20,
    },
    {
      id: "writing",
      title: t(uiLanguage, "dashboard.writing"),
      icon: writingIcon,
      color: "#f97316", // Помаранчевий
      progress: 0,
    },
  ];

  const levelLabel = learningLevel || "A1";

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-simple">
        <h2>{t(uiLanguage, "dashboard.learningPathsTitle")}</h2>
        <div className="info-btn">i</div>
      </div>

      <div className="dashboard-list">
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            className="lp-card-new"
            onClick={() => onOpenPath(topic.id)}
          >
            {/* --- ВЕРХНІЙ РЯД: Іконка | Текст | Стрілка --- */}
            <div className="lp-card-header">
              <div className="lp-header-left">
                {/* Картинка */}
                <div className="lp-icon-box">
                  <img
                    src={topic.icon}
                    alt={topic.title}
                    className="lp-topic-img"
                  />
                </div>

                {/* Текст */}
                <div className="lp-text-container">
                  <div className="lp-title">{topic.title}</div>
                  <div className="lp-level">
                    {t(uiLanguage, "dashboard.level")} {levelLabel}
                  </div>
                </div>
              </div>

              {/* Стрілка */}
              <div className="lp-arrow-btn">›</div>
            </div>

            {/* --- НИЖНІЙ РЯД: Прогрес --- */}
            <div className="lp-progress-section">
              <div className="lp-stats-block">
                <span className="lp-count-text">0/5</span>
                <span className="lp-percent-text">{topic.progress}%</span>
              </div>

              <div className="lp-slider-track">
                {/* Кружечок. Якщо прогрес > 0, робимо його кольоровим (наприклад, сірим або кольором теми) */}
                <div
                  className="lp-slider-knob"
                  style={{
                    left: `${topic.progress}%`,
                    backgroundColor: topic.progress > 0 ? "#6b7280" : "#d1d5db",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка Start Test */}
      <button
        className="start-test-btn-dash"
        onClick={() => onOpenPath("random")}
      >
        {t(uiLanguage, "dashboard.startTest")}
      </button>
    </div>
  );
};
