import { useState, type FC } from "react";
import { PrimaryButton } from "../components/PrimaryButton";

const LEVELS = [
  { code: "a1", label: "A1", bandColor: "#66D977" }, // dark green
  { code: "a2", label: "A2", bandColor: "#BBE66A" }, // dark lime
  { code: "b1", label: "B1", bandColor: "#F5E369" }, // dark yellow
  { code: "b2", label: "B2", bandColor: "#F8B665" }, // dark orange
  { code: "c1", label: "C1", bandColor: "#F38968" }, // darker orange
  { code: "c2", label: "C2", bandColor: "#E85B5B" }, // dark red
];

type LevelMode = "select" | "test";

interface ChooseLevelScreenProps {
  selectedLevel: string | null;
  learningLanguageCode: string | null;
  onChangeLevel: (code: string) => void;
  onContinue: () => void;
  onStartTest: () => void;
}

export const ChooseLevelScreen: FC<ChooseLevelScreenProps> = ({
  selectedLevel,
  learningLanguageCode,
  onChangeLevel,
  onContinue,
  onStartTest,
}) => {
  const [mode, setMode] = useState<LevelMode>("select");

  const languageName =
    {
      en: "English",
      de: "German",
      es: "Spanish",
      fr: "French",
      pl: "Polish",
    }[learningLanguageCode ?? "en"] || "English";

  const selectedIndex = LEVELS.findIndex((l) => l.code === selectedLevel);
  const hasSelection = selectedIndex >= 0;

  return (
    <>
      {/* SELECT / TEST TOGGLE */}
      <div className="level-mode-toggle">
        <button
          type="button"
          className={
            "level-mode-toggle-button" +
            (mode === "select" ? " level-mode-toggle-button-active" : "")
          }
          onClick={() => setMode("select")}
        >
          Select My Level
        </button>

        <button
          type="button"
          className={
            "level-mode-toggle-button" +
            (mode === "test" ? " level-mode-toggle-button-active" : "")
          }
          onClick={() => setMode("test")}
        >
          Take a Test
        </button>
      </div>

      {mode === "select" && (
        <>
          <div className="page-title">How well do you know {languageName}?</div>
          <p className="page-subtitle">
            Choose your current level to get the right exercises.
          </p>

          {/* LEVEL BUTTONS */}
          <div className="level-chips-row">
            {LEVELS.map((level) => {
              const selected = level.code === selectedLevel;

              const bgColor = selected ? level.bandColor : "#ffffff";
              const borderColor = selected ? level.bandColor : "#e5e7eb";
              const textColor = "#111827";

              return (
                <button
                  key={level.code}
                  type="button"
                  className={
                    "level-chip" + (selected ? " level-chip-selected" : "")
                  }
                  onClick={() => onChangeLevel(level.code)}
                  style={{
                    backgroundColor: bgColor,
                    borderColor,
                    color: textColor,
                  }}
                >
                  {level.label}
                </button>
              );
            })}
          </div>

          {/* PROGRESS BAR — FILLED BY LEVEL */}
          <div className="level-band">
            {LEVELS.map((level, index) => {
              const isFilled = selectedIndex >= 0 && index <= selectedIndex;

              return (
                <div
                  key={level.code}
                  className={
                    "level-band-segment" +
                    (isFilled ? " level-band-segment-filled" : "")
                  }
                  style={
                    isFilled ? { backgroundColor: level.bandColor } : undefined
                  }
                ></div>
              );
            })}
          </div>

          <PrimaryButton
            disabled={!hasSelection}
            onClick={onContinue}
            aria-disabled={!hasSelection}
          >
            Continue
          </PrimaryButton>
        </>
      )}

      {/* LEVEL TEST MODE */}
      {mode === "test" && (
        <>
          <div className="page-title">Don&apos;t know your level?</div>
          <p className="page-subtitle">
            Find your level in a few quick questions.
          </p>

          <PrimaryButton onClick={onStartTest}>Take a quick test</PrimaryButton>
        </>
      )}
    </>
  );
};
