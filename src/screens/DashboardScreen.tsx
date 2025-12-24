import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";
import "./learningPath.css"; // Подключаем обновленные стили

interface Props {
  uiLanguage: UiLangCode;
  learningLanguageCode: string | null;
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
      icon: "📖",
      color: "#1cb0f6",
      bgColor: "#ddf4ff",
    },
    {
      id: "vocabulary",
      title: t(uiLanguage, "dashboard.vocabulary"),
      icon: "🅰️",
      color: "#8965cc",
      bgColor: "#f4ebff",
    },
    {
      id: "writing",
      title: t(uiLanguage, "dashboard.writing"),
      icon: "📝",
      color: "#ff9600",
      bgColor: "#fff5dd",
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-simple">
        <h2>{t(uiLanguage, "dashboard.selectTopic")}</h2>
        <div className="info-btn">i</div>
      </div>

      <div className="dashboard-list">
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            className="lp-card-new"
            onClick={() => onOpenPath(topic.id)}
          >
            <div
              className="lp-icon-box"
              style={{ color: topic.color, backgroundColor: topic.bgColor }}
            >
              {topic.icon}
            </div>

            <div className="lp-text-block">
              <div className="lp-title">{topic.title}</div>
              <div className="lp-level">Level {learningLevel || "A1"}</div>
            </div>

            <div className="lp-arrow-btn">›</div>
          </div>
        ))}
      </div>

      {/* Кнопка Start Test внизу */}
      <button className="start-test-btn" onClick={() => onOpenPath("random")}>
        {t(uiLanguage, "dashboard.startTest")}
      </button>
    </div>
  );
};
