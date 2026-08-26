"use client";

import { BrandRow } from "./BrandRow";
import type { Blueprint, QuestionScreenProps } from "@/types";

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
  const blueprint: Blueprint = followUp.blueprint ?? {
    purpose: "",
    targetUser: "",
    features: [],
    screens: [],
    missing: [],
  };

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
          ) : (
            <span className="step-count">Ready to plan</span>
          )}
        </div>
        <div className="interview-layout">
          <div className="interview-main">
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
            <div
              className="completeness-card"
              aria-label={`Requirements ${followUp.completeness}% complete`}
            >
              <div className="completeness-heading">
                <div>
                  <span>Requirements completeness</span>
                  <strong>{followUp.completeness}%</strong>
                </div>
                <small>
                  {followUp.readyForSpec
                    ? "Enough context to create a strong app plan."
                    : blueprint.missing.length
                      ? `Still learning: ${blueprint.missing.join(" · ")}`
                      : "Learning what matters most."}
                </small>
              </div>
              <div className="progress-track">
                <span style={{ width: `${followUp.completeness}%` }} />
              </div>
            </div>
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
                  {isLoading
                    ? "Creating your app plan..."
                    : "Create app plan →"}
                </button>
                <p className="next-screen-note">
                  Next, we’ll turn this conversation into a clear app plan.
                </p>
              </div>
            ) : (
              <>
                <div className="question-copy">
                  <p className="eyebrow">LET&apos;S MAKE IT CLEARER</p>
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
                    ? "Updating your blueprint..."
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
          </div>
          <aside className="blueprint-panel" aria-label="Live app blueprint">
            <div className="blueprint-header">
              <div>
                <span className="blueprint-dot" /> Live App Blueprint
              </div>
              <small>Updates as you answer</small>
            </div>
            <div className="blueprint-section">
              <span>Purpose</span>
              <p>{blueprint.purpose || "Still being clarified"}</p>
            </div>
            <div className="blueprint-section">
              <span>Target user</span>
              <p>{blueprint.targetUser || "Still being clarified"}</p>
            </div>
            <div className="blueprint-section">
              <span>Core features</span>
              {blueprint.features.length ? (
                <ul>
                  {blueprint.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p className="blueprint-muted">Waiting for more context</p>
              )}
            </div>
            <div className="blueprint-section">
              <span>Suggested screens</span>
              {blueprint.screens.length ? (
                <div className="blueprint-chips">
                  {blueprint.screens.map((screen) => (
                    <b key={screen}>{screen}</b>
                  ))}
                </div>
              ) : (
                <p className="blueprint-muted">Waiting for more context</p>
              )}
            </div>
            {blueprint.missing.length ? (
              <div className="blueprint-missing">
                <span>Still learning</span>
                <p>{blueprint.missing.join(" · ")}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
