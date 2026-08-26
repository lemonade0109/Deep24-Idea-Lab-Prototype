"use client";

import type { AppPlanScreenProps } from "@/types";
import { BrandRow } from "./BrandRow";

export function AppPlanScreen({
  spec,
  isLoading,
  error,
  onBack,
  onRegenerate,
  onContinue,
}: AppPlanScreenProps) {
  return (
    <main className="page-shell">
      <section className="hero spec-screen" aria-labelledby="spec-title">
        <BrandRow compact />
        <button className="back-button" type="button" onClick={onBack}>
          ← Back to answers
        </button>
        <div className="spec-heading">
          <div className="completion-pill">
            Requirements ready <strong>100%</strong>
          </div>
          <p className="eyebrow">HERE&apos;S WHAT I THINK YOU NEED</p>
          <h1 id="spec-title" className="spec-name">
            {spec.name}
          </h1>
          <p className="spec-tagline">{spec.tagline}</p>
        </div>
        <div className="spec-meta-grid">
          <div className="spec-card">
            <span>Purpose</span>
            <p>{spec.purpose}</p>
          </div>
          <div className="spec-card">
            <span>Built for</span>
            <p>{spec.targetUser}</p>
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>What your app will do</span>
            <small>{spec.features.length} core features</small>
          </div>
          <div className="feature-list">
            {spec.features.map((feature, index) => (
              <div className="feature-item" key={feature}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="spec-section">
          <div className="spec-section-title">
            <span>Suggested screens</span>
          </div>
          <div className="screen-chips">
            {spec.screens.map((screen) => (
              <span key={screen}>{screen}</span>
            ))}
          </div>
        </div>
        <div className="spec-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
          >
            {isLoading ? "Rethinking..." : "Regenerate"}
          </button>
          <button
            className="continue-button spec-continue"
            type="button"
            onClick={onContinue}
            disabled={isLoading}
          >
            {isLoading ? "Preparing handoff..." : "Looks good →"}
          </button>
        </div>
        <p className="next-screen-note centered-note">
          Approve this plan to generate a structured handoff for a coding agent.
        </p>
        {error ? (
          <p className="error-message" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
