"use client";

import { FormEvent, useState } from "react";

type FollowUp = {
  question: string;
  options: string[];
  helper?: string;
  readyForSpec?: boolean;
};

type HistoryItem = {
  question: string;
  answer: string;
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function getNextQuestion(currentIdea: string, currentHistory: HistoryItem[]) {
    const response = await fetch("/api/follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: currentIdea, history: currentHistory }),
    });

    if (!response.ok) {
      throw new Error("Could not generate a follow-up question.");
    }

    return (await response.json()) as FollowUp;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedIdea = idea.trim();
    if (!trimmedIdea || isLoading) return;

    setError("");
    setIsLoading(true);
    setSubmittedIdea(trimmedIdea);
    setHistory([]);

    try {
      const data = await getNextQuestion(trimmedIdea, []);
      setFollowUp(data);
    } catch {
      setError("We couldn't understand that idea just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnswer() {
    if (!followUp || isLoading) return;
    const answer = selectedOption === "Something else" ? customAnswer.trim() : selectedOption;
    if (!answer) return;

    const nextHistory = [...history, { question: followUp.question, answer }];
    setError("");
    setIsLoading(true);

    try {
      const data = await getNextQuestion(submittedIdea, nextHistory);
      setHistory(nextHistory);
      setFollowUp(data);
      setSelectedOption("");
      setCustomAnswer("");
    } catch {
      setError("We couldn't generate the next question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function goBack() {
    setFollowUp(null);
    setHistory([]);
    setSelectedOption("");
    setCustomAnswer("");
    setError("");
  }

  if (followUp) {
    const answerReady = selectedOption && (selectedOption !== "Something else" || customAnswer.trim());

    return (
      <main className="page-shell">
        <section className="hero question-screen" aria-labelledby="question-title">
          <div className="brand-row compact-brand">
            <span className="brand-mark" aria-hidden="true">D24</span>
            <span className="brand-name">Deep24 Idea Lab</span>
          </div>

          <div className="interview-topbar">
            <button className="back-button" type="button" onClick={goBack}>← Edit idea</button>
            {!followUp.readyForSpec ? <span className="step-count">Question {history.length + 1} of 3</span> : null}
          </div>

          <div className="idea-context">
            <span>Your idea</span>
            <p>“{submittedIdea}”</p>
          </div>

          {history.length > 0 ? (
            <div className="answer-summary" aria-label="Previous answers">
              {history.map((item, index) => (
                <div className="answer-summary-item" key={`${item.question}-${index}`}>
                  <span>{index + 1}</span>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}

          {followUp.readyForSpec ? (
            <div className="ready-card">
              <div className="ready-icon" aria-hidden="true">✓</div>
              <p className="eyebrow">ENOUGH TO MOVE FORWARD</p>
              <h1 id="question-title" className="question-title">{followUp.question}</h1>
              <p className="subtitle question-helper">{followUp.helper}</p>
              <button className="continue-button" type="button" disabled>
                Create app plan →
              </button>
              <p className="next-screen-note">Screen 4 will turn this conversation into the final build specification.</p>
            </div>
          ) : (
            <>
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
                      onClick={() => {
                        setSelectedOption(option);
                        if (option !== "Something else") setCustomAnswer("");
                      }}
                    >
                      <span>{option}</span>
                      <span className="option-indicator" aria-hidden="true">{active ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>

              {selectedOption === "Something else" ? (
                <div className="custom-answer-wrap">
                  <label htmlFor="custom-answer">Tell us in your own words</label>
                  <input
                    id="custom-answer"
                    value={customAnswer}
                    onChange={(event) => setCustomAnswer(event.target.value)}
                    placeholder="Type your answer..."
                    maxLength={180}
                    autoFocus
                  />
                </div>
              ) : null}

              <button className="continue-button" type="button" disabled={!answerReady || isLoading} onClick={handleAnswer}>
                {isLoading ? "Thinking about your answer..." : history.length >= 2 ? "Finish →" : "Continue →"}
              </button>

              {error ? <p className="error-message" role="alert">{error}</p> : null}
            </>
          )}
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
          <p className="subtitle">Describe your idea in plain English. You don&apos;t need to know anything about coding.</p>
        </div>

        <form className="idea-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="idea">Describe the app you want to build</label>
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
                <button className="example-chip" key={example} type="button" onClick={() => setIdea(example)}>
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
