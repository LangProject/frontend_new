import type { FC } from "react";
import { useState } from "react";
import { ExerciseLayout, type FooterState } from "./ExerciseLayout";

export type ExerciseType =
  | "single_choice"
  | "multiple_choice"
  | "match_pairs"
  | "definition_match"
  | "translation"
  | "sentence_reorder"
  | "error_correction"
  | "fill_blank"
  | "error_identification"
  | "verb_conjugation";

// ---------------- MOCK-ДАННЫЕ ---------------- //

const singleChoiceMock = {
  type: "single_choice" as const,
  prompt: "Choose the correct translation for **cat**",
  options: [
    { id: 1, choice: "Perro", is_correct: false },
    { id: 2, choice: "Gato", is_correct: true },
    { id: 3, choice: "Casa", is_correct: false },
    { id: 4, choice: "Auto", is_correct: false },
  ],
};

const multipleChoiceMock = {
  type: "multiple_choice" as const,
  prompt: "Select all words that are fruits",
  category: "fruits",
  options: [
    { id: 1, choice: "Manzana", is_correct: true },
    { id: 2, choice: "Perro", is_correct: false },
    { id: 3, choice: "Naranja", is_correct: true },
    { id: 4, choice: "Casa", is_correct: false },
    { id: 5, choice: "Banana", is_correct: true },
    { id: 6, choice: "Auto", is_correct: false },
  ],
};

const matchPairsMock = {
  type: "match_pairs" as const,
  prompt: "Match the words with their translations",
  pairs: [
    { id: "p1", left: "Gato", right: "Cat" },
    { id: "p2", left: "Perro", right: "Dog" },
    { id: "p3", left: "Casa", right: "House" },
    { id: "p4", left: "Libro", right: "Book" },
  ],
};

const definitionMatchMock = {
  type: "definition_match" as const,
  prompt: "Choose the correct definition for the word:",
  word: "Gato",
  definitions: [
    {
      id: "d1",
      definition: "A small domesticated carnivorous mammal",
      is_correct: true,
    },
    {
      id: "d2",
      definition: "A large herbivorous mammal",
      is_correct: false,
    },
    {
      id: "d3",
      definition: "A flying vehicle that transports people",
      is_correct: false,
    },
  ],
};

const translationMock = {
  type: "translation" as const,
  prompt: "Translate to Spanish",
  source_text: "The cat is sleeping.",
  correct_translations: ["El gato está durmiendo.", "El gato duerme."],
};

const sentenceReorderMock = {
  type: "sentence_reorder" as const,
  prompt: "Reorder the words to form a correct sentence.",
  words: ["muy", "El", "es", "gato", "bonito"],
  correct_order: ["El", "gato", "es", "muy", "bonito"],
};

const errorCorrectionMock = {
  type: "error_correction" as const,
  prompt: "Correct the error in this sentence",
  incorrect_sentence_html: "Yo <span class='error'>es</span> un estudiante.",
  correct_sentence: "Yo soy un estudiante.",
  explanation:
    "The verb 'ser' must be conjugated as 'soy' for first person singular (yo).",
};

const fillBlankMock = {
  type: "fill_blank" as const,
  sentence_parts: ["El ", " es muy bonito."],
  correct_answer: "gato",
  distractors: ["perro", "casa"],
};

const errorIdentificationMock = {
  type: "error_identification" as const,
  prompt: "Identify the error in this sentence",
  sentence_words: [
    { id: 1, text: "El", is_error: false },
    { id: 2, text: "gatos", is_error: true },
    { id: 3, text: "es", is_error: false },
    { id: 4, text: "muy", is_error: false },
    { id: 5, text: "bonito.", is_error: false },
  ],
  explanation: "Should be 'gato' (singular) to agree with 'El'.",
};

const verbConjugationMock = {
  type: "verb_conjugation" as const,
  prompt: "Conjugate the verb correctly",
  verb_infinitive: "hablar",
  tags: ["Present", "First person singular"],
  context_pre: "Yo ",
  context_post: " español.",
  correct_answer: "hablo",
  explanation:
    "The present tense, first person singular form of 'hablar' is 'hablo'.",
};

// ---------------- Сам экран-демо ---------------- //

interface ExerciseDemoScreenProps {
  type: ExerciseType;
  // можно потом пробрасывать onBack/step/total из Dashboard
  step?: number;
  total?: number;
  onBack?: () => void;
}

export const ExerciseDemoScreen: FC<ExerciseDemoScreenProps> = ({
  type,
  step = 2,
  total = 10,
  onBack,
}) => {
  // общее состояние для кнопки/цвета – просто заглушка
  const [checked, setChecked] = useState(false);

  const getFooterState = (): FooterState => {
    if (!checked) return "check";
    return "continue-success"; // всегда как будто всё ок
  };

  const handleFooterClick = () => {
    if (!checked) {
      setChecked(true);
    } else {
      // Continue – тут пока просто сбрасываем
      setChecked(false);
    }
  };

  // ---- рендер по типу ---- //

  if (type === "single_choice") {
    const mock = singleChoiceMock;
    return (
      <ExerciseLayout
        step={step}
        total={total}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-options">
          {mock.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="exercise-option-button"
            >
              {opt.choice}
            </button>
          ))}
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "multiple_choice") {
    const mock = multipleChoiceMock;
    return (
      <ExerciseLayout
        step={step}
        total={total}
        onBack={onBack}
        title={
          <>
            <b>{mock.prompt}</b>
            <div className="exercise-subtitle">
              Category: <b>{mock.category}</b>
            </div>
          </>
        }
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-grid-2x3">
          {mock.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="exercise-option-button"
            >
              {opt.choice}
            </button>
          ))}
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "match_pairs") {
    const mock = matchPairsMock;
    return (
      <ExerciseLayout
        step={step}
        total={total}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel="(no Check — pairs are auto-checked)"
        footerState="disabled"
      >
        <div className="exercise-match-columns">
          <div className="exercise-match-column">
            {mock.pairs.map((p) => (
              <div key={p.id} className="exercise-match-card">
                {p.left}
              </div>
            ))}
          </div>
          <div className="exercise-match-column">
            {mock.pairs
              .slice()
              .reverse()
              .map((p) => (
                <div key={p.id} className="exercise-match-card">
                  {p.right}
                </div>
              ))}
          </div>
        </div>
        <div className="exercise-hint">
          Pairs are checked instantly when user taps left + right card. Here
          it's just a visual stub.
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "definition_match") {
    const mock = definitionMatchMock;
    return (
      <ExerciseLayout
        step={5}
        total={10}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-word-big">{mock.word}</div>
        <div className="exercise-options">
          {mock.definitions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="exercise-option-button exercise-option-definition"
            >
              {opt.definition}
            </button>
          ))}
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "translation") {
    const mock = translationMock;
    return (
      <ExerciseLayout
        step={6}
        total={10}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-source-sentence">{mock.source_text}</div>
        <textarea
          className="exercise-input"
          placeholder="Type your translation here..."
          rows={3}
        />
        {checked && (
          <div className="exercise-explanation-card">
            <div className="exercise-explanation-title">
              Model translations:
            </div>
            <div className="exercise-explanation-text">
              {mock.correct_translations.join(" / ")}
            </div>
          </div>
        )}
      </ExerciseLayout>
    );
  }

  if (type === "sentence_reorder") {
    const mock = sentenceReorderMock;
    return (
      <ExerciseLayout
        step={7}
        total={10}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-sentence-area">
          <div className="exercise-assembly-label">Assembly area</div>
          <div className="exercise-assembly-box">El gato es muy bonito</div>
        </div>
        <div className="exercise-word-bank">
          {mock.words.map((w, idx) => (
            <button key={idx} className="exercise-word-chip" type="button">
              {w}
            </button>
          ))}
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "error_correction") {
    const mock = errorCorrectionMock;
    return (
      <ExerciseLayout
        step={8}
        total={10}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div
          className="exercise-source-sentence error-highlight"
          dangerouslySetInnerHTML={{
            __html: mock.incorrect_sentence_html.replace(
              "class='error'",
              "class='error-span'"
            ),
          }}
        />
        <input
          className="exercise-input"
          placeholder="Rewrite the sentence correctly..."
        />
        {checked && (
          <div className="exercise-explanation-card">
            <div className="exercise-explanation-title">Correct sentence:</div>
            <div className="exercise-explanation-text">
              {mock.correct_sentence}
            </div>
            <div className="exercise-explanation-title mt-6">Explanation:</div>
            <div className="exercise-explanation-text">{mock.explanation}</div>
          </div>
        )}
      </ExerciseLayout>
    );
  }

  if (type === "fill_blank") {
    const mock = fillBlankMock;
    return (
      <ExerciseLayout
        step={9}
        total={10}
        onBack={onBack}
        title={<b>Fill in the blank</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-source-sentence">
          {mock.sentence_parts[0]}
          <span className="exercise-blank-slot">______</span>
          {mock.sentence_parts[1]}
        </div>
        <div className="exercise-word-bank">
          {[mock.correct_answer, ...mock.distractors].map((w) => (
            <button key={w} className="exercise-word-chip" type="button">
              {w}
            </button>
          ))}
        </div>
      </ExerciseLayout>
    );
  }

  if (type === "error_identification") {
    const mock = errorIdentificationMock;
    return (
      <ExerciseLayout
        step={10}
        total={10}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-word-row">
          {mock.sentence_words.map((w) => (
            <button key={w.id} type="button" className="exercise-word-token">
              {w.text}
            </button>
          ))}
        </div>
        {checked && (
          <div className="exercise-explanation-card">
            <div className="exercise-explanation-title">Explanation:</div>
            <div className="exercise-explanation-text">{mock.explanation}</div>
          </div>
        )}
      </ExerciseLayout>
    );
  }

  if (type === "verb_conjugation") {
    const mock = verbConjugationMock;
    return (
      <ExerciseLayout
        step={11}
        total={11}
        onBack={onBack}
        title={<b>{mock.prompt}</b>}
        footerLabel={checked ? "Continue" : "Check"}
        footerState={getFooterState()}
        onFooterClick={handleFooterClick}
      >
        <div className="exercise-word-big">{mock.verb_infinitive}</div>
        <div className="exercise-tag-row">
          {mock.tags.map((tag) => (
            <span key={tag} className="exercise-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="exercise-context-line">
          {mock.context_pre}
          <input
            className="exercise-inline-input"
            placeholder="..."
            autoComplete="off"
          />
          {mock.context_post}
        </div>

        {checked && (
          <div className="exercise-explanation-card">
            <div className="exercise-explanation-title">Correct answer:</div>
            <div className="exercise-explanation-text">
              {mock.correct_answer}
            </div>
            <div className="exercise-explanation-title mt-6">Explanation:</div>
            <div className="exercise-explanation-text">{mock.explanation}</div>
          </div>
        )}
      </ExerciseLayout>
    );
  }

  // fallback
  return (
    <ExerciseLayout
      step={1}
      total={1}
      title="Exercise preview"
      footerLabel="Check"
      footerState="disabled"
    >
      <div>Unknown exercise type</div>
    </ExerciseLayout>
  );
};
