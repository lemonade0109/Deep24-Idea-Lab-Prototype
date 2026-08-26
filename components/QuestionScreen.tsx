"use client";

import { FollowUp, HistoryItem } from "@/types";
import { BrandRow } from "./BrandRow";

type QuestionScreenProps = {
  followUp: FollowUp;
  submittedIdea: string;
  history: HistoryItem[];
  selectedOption: string;
  customAnswer: string;
  isLoading: boolean;
  error: string;
  onGoBack: () => void;
  onSelectOption: (option: string) => void;
  onCustomAnswerChange: (value: string) => void;
  onAnswer: () => void;
  onCreateAppPlan: () => void;
};

export function QuestionScreen({
  followUp,
  submittedIdea,
  history,
  selectedOption,
  customAnswer,
  isLoading,
  error,
  onGoBack,
  onSelectOption,
  onCustomAnswerChange,
  onAnswer,
  onCreateAppPlan,
}: QuestionScreenProps) {
  const answerReady =
    selectedOption &&
    (selectedOption !== "Something else" || customAnswer.trim());

  return (
    <main className="page-shell">
      <section
        className="hero question-screen"
        aria-labelledby="question-title"
      >
        <BrandRow compact />

        <div className="interview-topbar">
          <button className="back-button" type="button" onClick={onGoBack}>
            ← Edit idea
          </button>
          {!followUp.readyForSpec ? (
            <span className="step-count">
              Question {history.length + 1} of 3
            </span>
          ) : null}
        </div>

        <div className="idea-context">
          <span>Your idea</span>
          <p>“{submittedIdea}”</p>
        </div>

        {history.length > 0 ? (
          <div className="answer-summary" aria-label="Previous answers">
            {history.map((item, index) => (
              <div
                className="answer-summary-item"
                key={`${item.question}-${index}`}
              >
                <span>{index + 1}</span>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        ) : null}

        {followUp.readyForSpec ? (
          <div className="ready-card">
            <div className="ready-icon" aria-hidden="true">
              ✓
            </div>
            <p className="eyebrow">ENOUGH TO MOVE FORWARD</p>
            <h1 id="question-title" className="question-title">
              {followUp.question}
            </h1>
            <p className="subtitle question-helper">{followUp.helper}</p>
            <button
              className="continue-button"
              type="button"
              onClick={onCreateAppPlan}
              disabled={isLoading}
            >
              {isLoading ? "Creating your app plan..." : "Create app plan →"}
            </button>
            <p className="next-screen-note">
              Next, we’ll turn this conversation into a clear app plan.
            </p>
          </div>
        ) : (
          <>
            <div className="question-copy">
              <p className="eyebrow">LET'S MAKE IT CLEARER</p>
              <h1 id="question-title" className="question-title">
                {followUp.question}
              </h1>
              <p className="subtitle question-helper">
                {followUp.helper ??
                  "Choose the answer that best matches what you have in mind."}
              </p>
            </div>

            <div
              className="option-grid"
              role="radiogroup"
              aria-label={followUp.question}
            >
              {followUp.options.map((option) => {
                const active = selectedOption === option;
                return (
                  <button
                    className={`answer-option${active ? " active" : ""}`}
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelectOption(option)}
                  >
                    <span>{option}</span>
                    <span className="option-indicator" aria-hidden="true">
                      {active ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedOption === "Something else" ? (
              <div className="custom-answer-wrap">
                <label htmlFor="custom-answer">
                  Tell us in your own words
                </label>
                <input
                  id="custom-answer"
                  value={customAnswer}
                  onChange={(event) =>
                    onCustomAnswerChange(event.target.value)
                  }
                  placeholder="Type your answer..."
                  maxLength={180}
                  autoFocus
                />
              </div>
            ) : null}

            <button
              className="continue-button"
              type="button"
              disabled={!answerReady || isLoading}
              onClick={onAnswer}
            >
              {isLoading
                ? "Thinking about your answer..."
                : history.length >= 2
                  ? "Finish →"
                  : "Continue →"}
            </button>

            {error ? (
              <p className="error-message" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
