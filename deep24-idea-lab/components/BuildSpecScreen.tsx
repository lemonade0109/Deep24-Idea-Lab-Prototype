"use client";

import { AppSpec, BuildSpec } from "@/types";
import { BrandRow } from "./BrandRow";

type BuildSpecScreenProps = {
  spec: AppSpec;
  buildSpec: BuildSpec;
  isLoading: boolean;
  error: string;
  copyStatus: "idle" | "copied" | "failed";
  onBack: () => void;
  onRegenerate: () => void;
  onCopyAgentPrompt: () => void;
  onStartOver: () => void;
};

export function BuildSpecScreen({
  spec,
  buildSpec,
  isLoading,
  error,
  copyStatus,
  onBack,
  onRegenerate,
  onCopyAgentPrompt,
  onStartOver,
}: BuildSpecScreenProps) {
  return (
    <main className="page-shell">
      <section
        className="hero build-spec-screen"
        aria-labelledby="build-spec-title"
      >
        <BrandRow compact />
        <button className="back-button" type="button" onClick={onBack}>
          ← Back to app plan
        </button>
        <div className="spec-heading">
          <p className="eyebrow">CODING-AGENT-READY SPECIFICATION</p>
          <h1 id="build-spec-title" className="spec-name">
            {spec.name}
          </h1>
          <p className="spec-tagline">
            Your idea has been translated into a structured handoff a coding
            agent can build from.
          </p>
        </div>
        <div className="handoff-status">
          <span className="ready-dot">✓</span>
          <div>
            <strong>Ready for agent handoff</strong>
            <p>{buildSpec.productSummary}</p>
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>User stories</span>
          </div>
          <div className="feature-list">
            {buildSpec.userStories.map((story, i) => (
              <div className="feature-item" key={story}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{story}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>Data model</span>
          </div>
          <div className="entity-grid">
            {buildSpec.dataEntities.map((entity) => (
              <div className="entity-card" key={entity.name}>
                <strong>{entity.name}</strong>
                <p>{entity.fields.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>Screen requirements</span>
          </div>
          <div className="screen-detail-list">
            {buildSpec.screenDetails.map((screen) => (
              <div className="screen-detail" key={screen.name}>
                <strong>{screen.name}</strong>
                <p>{screen.purpose}</p>
                <small>{screen.actions.join(" · ")}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>Definition of done</span>
          </div>
          <div className="criteria-list">
            {buildSpec.acceptanceCriteria.map((item) => (
              <div key={item}>
                <span>✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="agent-prompt-card">
          <div className="spec-section-title">
            <span>Agent handoff prompt</span>
            <small>Ready to copy</small>
          </div>
          <p>{buildSpec.agentPrompt}</p>
        </div>
        <div className="final-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            {isLoading ? "Regenerating..." : "Regenerate spec"}
          </button>
          <button
            className="continue-button spec-continue"
            type="button"
            onClick={onCopyAgentPrompt}
          >
            {copyStatus === "copied"
              ? "Copied ✓"
              : copyStatus === "failed"
                ? "Copy failed"
                : "Copy agent prompt"}
          </button>
        </div>
        <button
          className="start-over-button"
          type="button"
          onClick={onStartOver}
        >
          Start a new idea
        </button>
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
