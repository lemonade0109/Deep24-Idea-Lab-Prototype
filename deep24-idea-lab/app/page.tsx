"use client";

import { FormEvent, useState } from "react";

type FollowUp = {
  question: string;
  options: string[];
  helper?: string;
};

const examples = [
  "I want an app to help me study.",
  "I need something to track customer orders.",
  "I want a tool that helps me plan workouts.",
];

export default function Home() {
  const [idea, setIdea] = useState("");
  const [submittedIdea, setSubmittedIdea] = useState("");
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedIdea = idea.trim();
    if (!trimmedIdea || isLoading) return;

    setError("");
    setIsLoading(true);
    setSubmittedIdea(trimmedIdea);

    try {
      const response = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmedIdea }),
      });

      if (!response.ok) {
        throw new Error("Could not generate a follow-up question.");
      }

      const data = (await response.json()) as FollowUp;
      setFollowUp(data);
    } catch {
      setError("We couldn't understand that idea just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function goBack() {
    setFollowUp(null);
    setSelectedOption("");
    setError("");
  }

  if (followUp) {
    return (
      <main className="page-shell">
        <section className="hero question-screen" aria-labelledby="question-title">
          <div className="brand-row compact-brand">
            <span className="brand-mark" aria-hidden="true">D24</span>
            <span className="brand-name">Deep24 Idea Lab</span>
          </div>

          <button className="back-button" type="button" onClick={goBack}>
            ← Edit idea
          </button>

          <div className="idea-context">
            <span>Your idea</span>
            <p>“{submittedIdea}”</p>
          </div>

          <div className="question-copy">
            <p className="eyebrow">LET'S MAKE IT CLEARER</p>
            <h1 id="question-title" className="question-title">{followUp.question}</h1>
            <p className="subtitle question-helper">
              {followUp.helper ?? "Choose the answer that best matches what you have in mind."}
            </p>
          </div>

          <div className="option-grid" role="radiogroup" aria-label={followUp.question}>
            {followUp.options.map((option) => {
              const active = selectedOption === option;
              return (
                <button
                  className={`answer-option${active ? " active" : ""}`}
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedOption(option)}
                >
                  <span>{option}</span>
                  <span className="option-indicator" aria-hidden="true">{active ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>

          <button className="continue-button" type="button" disabled={!selectedOption}>
            Continue →
          </button>

          {selectedOption ? (
            <div className="prototype-note" role="status">
              <strong>Screen 2 is working.</strong>
              <span>Next, this answer will help the AI decide the next best question.</span>
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden="true">D24</span>
          <span className="brand-name">Deep24 Idea Lab</span>
        </div>

        <div className="intro-copy">
          <p className="eyebrow">IDEA → BUILD SPEC</p>
          <h1 id="page-title">What do you want to build?</h1>
          <p className="subtitle">
            Describe your idea in plain English. You don&apos;t need to know anything about coding.
          </p>
        </div>

        <form className="idea-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="idea">
            Describe the app you want to build
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="I want an app that helps me manage my watch business..."
            maxLength={500}
          />

          <div className="form-meta">
            <span>Describe the outcome, not the tech.</span>
            <span>{idea.length}/500</span>
          </div>

          <div className="examples-block">
            <p>Try an example</p>
            <div className="example-list">
              {examples.map((example) => (
                <button
                  className="example-chip"
                  key={example}
                  type="button"
                  onClick={() => setIdea(example)}
                >
                  {example.replace(/^I (want|need) (an app|something|a tool) (that )?/i, "")}
                </button>
              ))}
            </div>
          </div>

          <button className="continue-button" type="submit" disabled={!idea.trim() || isLoading}>
            {isLoading ? "Understanding your idea..." : "Continue →"}
          </button>

          {error ? <p className="error-message" role="alert">{error}</p> : null}
        </form>
      </section>
    </main>
  );
}
