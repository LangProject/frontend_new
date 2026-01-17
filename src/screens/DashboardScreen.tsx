import { useEffect, useState } from "react";
import { type UiLangCode } from "../utils/detectUiLanguage";
import { t } from "../i18n";
import { LessonService } from "../api/services/lessonService";
import "./learningPath.css";

import readingIcon from "../assets/icons/reading/reading_256px.png";
import vocabIcon from "../assets/icons/vocabulary/vocabulary_256px.png";
import writingIcon from "../assets/icons/writing/writing_1/writing_1_256px.png";

const ELO_THRESHOLDS: Record<string, number> = {
  A1: 100, A2: 300, B1: 600, B2: 1000, C1: 1400, C2: 1900,
};

interface Props {
  uiLanguage: UiLangCode;
  learningLevel: string | null;
  onOpenPath: (topicId: string) => void;
}

interface DashboardStats {
  elo: number;
  level: string;
  reading_elo: number;
  vocabulary_elo: number;
  writing_elo: number;
}

export const DashboardScreen = ({ uiLanguage, onOpenPath }: Props) => {
  const [stats, setStats] = useState<DashboardStats>({
    elo: 0, level: "A1", reading_elo: 0, vocabulary_elo: 0, writing_elo: 0,
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const s = await LessonService.getStats();
      setStats({
        elo: s.elo || 0,
        level: s.level || "A1",
        reading_elo: s.reading_elo || 0,
        vocabulary_elo: s.vocabulary_elo || 0,
        writing_elo: s.writing_elo || 0,
      });
    } catch (e) { console.error(e); }
  };

  const calculateProgress = (elo: number) => {
    const sorted = Object.entries(ELO_THRESHOLDS).sort((a, b) => a[1] - b[1]);
    let start = 0, end = sorted[0][1], label = "A1";
    for (let i = 0; i < sorted.length; i++) {
      if (elo >= sorted[i][1]) {
        start = sorted[i][1];
        end = sorted[i + 1] ? sorted[i + 1][1] : start + 500;
        label = sorted[i][0];
      } else break;
    }
    const percent = Math.min(Math.max(((elo - start) / (end - start)) * 100, 5), 100);
    return { percent, label: `${elo} / ${end}`, levelLabel: label };
  };

  const renderPencil = (percent: number, label: string, color: string, size: "small" | "large") => (
    <div className={`lp-pencil-wrapper ${size}`}>
      <div className="lp-pencil-progress">
        <div className="lp-p-eraser"></div>
        <div className="lp-p-metal"></div>
        <div className="lp-p-body-container">
          <div className="lp-p-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
          <div className="lp-p-label">{label}</div>
        </div>
        <div className="lp-p-wood"></div>
        <div className="lp-p-lead"></div>
      </div>
    </div>
  );

  const totalInfo = calculateProgress(stats.elo);

  return (
    <div className="lp-container">
      <div className="lp-header">
        {/* ИСПОЛЬЗУЕМ КЛЮЧ dashboard.title ЧТОБЫ НЕ БЫЛО ПОДЧЕРКИВАНИЙ */}
        <h1 className="lp-main-title">
          {t(uiLanguage, "dashboard.title")} {stats.level}
        </h1>
        <p className="lp-subtitle">{t(uiLanguage, "dashboard.subtitle")}</p>
      </div>

      <div className="lp-grid">
        {[
          { id: "reading", title: t(uiLanguage, "dashboard.reading"), icon: readingIcon, elo: stats.reading_elo, color: "#60a5fa" },
          { id: "vocabulary", title: t(uiLanguage, "dashboard.vocabulary"), icon: vocabIcon, elo: stats.vocabulary_elo, color: "#f472b6" },
          { id: "writing", title: t(uiLanguage, "dashboard.writing"), icon: writingIcon, elo: stats.writing_elo, color: "#34d399" },
        ].map((topic) => {
          const prog = calculateProgress(topic.elo);
          return (
            <div key={topic.id} className="lp-card" onClick={() => onOpenPath(topic.id)}>
              <div className="lp-card-top">
                <div className="lp-icon-wrapper"><img src={topic.icon} className="lp-icon" alt="" /></div>
                <div className="lp-info">
                  <div className="lp-title">{topic.title}</div>
                  <div className="lp-level">{t(uiLanguage, "dashboard.level")} <span style={{ color: topic.color }}>{prog.levelLabel}</span></div>
                </div>
                <div className="lp-arrow-btn">›</div>
              </div>
              {renderPencil(prog.percent, prog.label, topic.color, "small")}
            </div>
          );
        })}
      </div>

      {/* ТЕКСТ УДАЛЕН, ОСТАЛСЯ ТОЛЬКО КАРАНДАШ */}
      <div className="lp-total-only-pencil" style={{ marginTop: '40px' }}>
        {renderPencil(totalInfo.percent, `ELO: ${totalInfo.label}`, "#fbbf24", "large")}
      </div>
    </div>
  );
};