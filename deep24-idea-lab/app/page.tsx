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

type AppSpec = {
  name: string;
  tagline: string;
  purpose: string;
  targetUser: string;
  features: string[];
  screens: string[];
};

type BuildSpec = {
  productSummary: string;
  userStories: string[];
  dataEntities: { name: string; fields: string[] }[];
  screenDetails: { name: string; purpose: string; actions: string[] }[];
  acceptanceCriteria: string[];
  agentPrompt: string;
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
  const [spec, setSpec] = useState<AppSpec | null>(null);
  const [buildSpec, setBuildSpec] = useState<BuildSpec | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

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

  async function createAppPlan() {
    if (isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: submittedIdea, history }),
      });
      if (!response.ok) throw new Error("Could not create app plan.");
      setSpec((await response.json()) as AppSpec);
    } catch {
      setError("We couldn't create your app plan just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createBuildSpec() {
    if (!spec || isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/build-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: submittedIdea, history, plan: spec }),
      });
      if (!response.ok) throw new Error("Could not create build specification.");
      setBuildSpec((await response.json()) as BuildSpec);
    } catch {
      setError("We couldn't create the build specification just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetPrototype() {
    setIdea("");
    setSubmittedIdea("");
    setFollowUp(null);
    setHistory([]);
    setSelectedOption("");
    setCustomAnswer("");
    setError("");
    setSpec(null);
    setBuildSpec(null);
    setCopyStatus("idle");
  }

  async function copyAgentPrompt() {
    if (!buildSpec) return;
    try {
      await navigator.clipboard.writeText(buildSpec.agentPrompt);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("failed");
    }
  }

  function goBack() {
    setFollowUp(null);
    setHistory([]);
    setSelectedOption("");
    setCustomAnswer("");
    setError("");
    setSpec(null);
    setBuildSpec(null);
  }

  if (buildSpec && spec) {
    return (
      <main className="page-shell">
        <section className="hero build-spec-screen" aria-labelledby="build-spec-title">
          <div className="brand-row compact-brand"><span className="brand-mark" aria-hidden="true">D24</span><span className="brand-name">Deep24 Idea Lab</span><span className="exploration-badge">Product exploration</span></div>
          <button className="back-button" type="button" onClick={() => setBuildSpec(null)}>← Back to app plan</button>
          <div className="spec-heading">
            <p className="eyebrow">CODING-AGENT-READY SPECIFICATION</p>
            <h1 id="build-spec-title" className="spec-name">{spec.name}</h1>
            <p className="spec-tagline">Your idea has been translated into a structured handoff a coding agent can build from.</p>
          </div>
          <div className="handoff-status"><span className="ready-dot">✓</span><div><strong>Ready for agent handoff</strong><p>{buildSpec.productSummary}</p></div></div>
          <div className="spec-section"><div className="spec-section-title"><span>User stories</span></div><div className="feature-list">{buildSpec.userStories.map((story, i) => <div className="feature-item" key={story}><span>{String(i+1).padStart(2,"0")}</span><p>{story}</p></div>)}</div></div>
          <div className="spec-section"><div className="spec-section-title"><span>Data model</span></div><div className="entity-grid">{buildSpec.dataEntities.map(entity => <div className="entity-card" key={entity.name}><strong>{entity.name}</strong><p>{entity.fields.join(" · ")}</p></div>)}</div></div>
          <div className="spec-section"><div className="spec-section-title"><span>Screen requirements</span></div><div className="screen-detail-list">{buildSpec.screenDetails.map(screen => <div className="screen-detail" key={screen.name}><strong>{screen.name}</strong><p>{screen.purpose}</p><small>{screen.actions.join(" · ")}</small></div>)}</div></div>
          <div className="spec-section"><div className="spec-section-title"><span>Definition of done</span></div><div className="criteria-list">{buildSpec.acceptanceCriteria.map(item => <div key={item}><span>✓</span><p>{item}</p></div>)}</div></div>
          <div className="agent-prompt-card"><div className="spec-section-title"><span>Agent handoff prompt</span><small>Ready to copy</small></div><p>{buildSpec.agentPrompt}</p></div>
          <div className="final-actions"><button className="secondary-button" type="button" onClick={createBuildSpec} disabled={isLoading}>{isLoading ? "Regenerating..." : "Regenerate spec"}</button><button className="continue-button spec-continue" type="button" onClick={copyAgentPrompt}>{copyStatus === "copied" ? "Copied ✓" : copyStatus === "failed" ? "Copy failed" : "Copy agent prompt"}</button></div>
          <button className="start-over-button" type="button" onClick={resetPrototype}>Start a new idea</button>
          {error ? <p className="error-message" role="alert">{error}</p> : null}
        </section>
      </main>
    );
  }

  if (spec) {
    return (
      <main className="page-shell">
        <section className="hero spec-screen" aria-labelledby="spec-title">
          <div className="brand-row compact-brand">
            <span className="brand-mark" aria-hidden="true">D24</span>
            <span className="brand-name">Deep24 Idea Lab</span>
          </div>
          <button className="back-button" type="button" onClick={() => setSpec(null)}>← Back to answers</button>
          <div className="spec-heading">
            <p className="eyebrow">HERE'S WHAT I THINK YOU NEED</p>
            <h1 id="spec-title" className="spec-name">{spec.name}</h1>
            <p className="spec-tagline">{spec.tagline}</p>
          </div>
          <div className="spec-meta-grid">
            <div className="spec-card"><span>Purpose</span><p>{spec.purpose}</p></div>
            <div className="spec-card"><span>Built for</span><p>{spec.targetUser}</p></div>
          </div>
          <div className="spec-section">
            <div className="spec-section-title"><span>What your app will do</span><small>{spec.features.length} core features</small></div>
            <div className="feature-list">{spec.features.map((feature, index) => <div className="feature-item" key={feature}><span>{String(index + 1).padStart(2, "0")}</span><p>{feature}</p></div>)}</div>
          </div>
          <div className="spec-section">
            <div className="spec-section-title"><span>Suggested screens</span></div>
            <div className="screen-chips">{spec.screens.map((screen) => <span key={screen}>{screen}</span>)}</div>
          </div>
          <div className="spec-actions">
            <button className="secondary-button" type="button" onClick={createAppPlan} disabled={isLoading}>{isLoading ? "Rethinking..." : "Regenerate"}</button>
            <button className="continue-button spec-continue" type="button" onClick={createBuildSpec} disabled={isLoading}>{isLoading ? "Preparing handoff..." : "Looks good →"}</button>
          </div>
          <p className="next-screen-note centered-note">Approve this plan to generate a structured handoff for a coding agent.</p>
          {error ? <p className="error-message" role="alert">{error}</p> : null}
        </section>
      </main>
    );
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
              <button className="continue-button" type="button" onClick={createAppPlan} disabled={isLoading}>
                {isLoading ? "Creating your app plan..." : "Create app plan →"}
              </button>
              <p className="next-screen-note">Next, we’ll turn this conversation into a clear app plan.</p>
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
          <span className="exploration-badge">Product exploration</span>
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

          <button className="continue-button" type="submit" disabled={idea.trim().length < 8 || isLoading}>
            {isLoading ? "Understanding your idea..." : "Continue →"}
          </button>

          {idea.trim().length > 0 && idea.trim().length < 8 ? <p className="hint-message">Add a little more detail so I can ask a useful question.</p> : null}
          {error ? <p className="error-message" role="alert">{error}</p> : null}
        </form>
        <p className="prototype-footer">Independent product exploration inspired by Deep24’s idea-to-app workflow.</p>
      </section>
    </main>
  );
}
