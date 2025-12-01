import type { FC, ReactNode } from "react";

export type FooterState =
  | "disabled" // серая кнопка, клик игнорится
  | "check" // зелёная "Check"
  | "continue-success" // зелёная "Continue"
  | "continue-error"; // красная "Continue";

interface ExerciseLayoutProps {
  step: number;
  total: number;
  onBack?: () => void;
  onSettingsClick?: () => void;
  title: ReactNode;
  children: ReactNode;
  footerLabel: string;
  footerState: FooterState;
  onFooterClick?: () => void;
}

/**
 * Общий каркас экрана упражнения.
 * Header: back + прогресс + иконка шестерёнки.
 * Body: контент упражнения (children).
 * Footer: липкая кнопка.
 */
export const ExerciseLayout: FC<ExerciseLayoutProps> = ({
  step,
  total,
  onBack,
  onSettingsClick,
  title,
  children,
  footerLabel,
  footerState,
  onFooterClick,
}) => {
  const progressPercent = Math.max(
    0,
    Math.min(100, (step / Math.max(total, 1)) * 100)
  );

  const isDisabled = footerState === "disabled";

  let footerClass = "primary-button exercise-footer-button";
  if (footerState === "continue-error") {
    footerClass += " exercise-footer-button-error";
  } else if (footerState === "continue-success") {
    footerClass += " exercise-footer-button-success";
  }

  return (
    <div className="exercise-layout">
      <header className="exercise-header-bar">
        <button
          type="button"
          className="exercise-header-icon"
          onClick={() => {
            if (!onBack) return;
            // тут пока без модалки, просто вызов
            onBack();
          }}
          aria-label="Back"
        >
          ←
        </button>

        <div className="exercise-header-center">
          <div className="exercise-progress-small">
            <div
              className="exercise-progress-small-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="exercise-progress-small-label">
            {step}/{total}
          </span>
        </div>

        <button
          type="button"
          className="exercise-header-icon"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </header>

      <main className="exercise-layout-main">
        <div className="exercise-layout-inner">
          <div className="exercise-layout-title">{title}</div>
          <div className="exercise-layout-body">{children}</div>
        </div>
      </main>

      <footer className="exercise-layout-footer">
        <button
          type="button"
          className={footerClass}
          disabled={isDisabled}
          onClick={isDisabled ? undefined : onFooterClick}
        >
          {footerLabel}
        </button>
      </footer>
    </div>
  );
};
