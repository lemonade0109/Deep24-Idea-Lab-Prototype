"use client";

import { EXAMPLE_IDEAS, formatExampleLabel } from "@/lib/helpers/ideaExamples";
import { BrandRow } from "./BrandRow";

type IdeaFormScreenProps = {
  idea: string;
  isLoading: boolean;
  error: string;
  onIdeaChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function IdeaFormScreen({
  idea,
  isLoading,
  error,
  onIdeaChange,
  onSubmit,
}: IdeaFormScreenProps) {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <BrandRow />

        <div className="intro-copy">
          <p className="eyebrow">IDEA → BUILD SPEC</p>
          <h1 id="page-title">What do you want to build?</h1>
          <p className="subtitle">
            Describe your idea in plain English. You don&apos;t need to know
            anything about coding.
          </p>
        </div>

        <form className="idea-form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="idea">
            Describe the app you want to build
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(event) => onIdeaChange(event.target.value)}
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
              {EXAMPLE_IDEAS.map((example) => (
                <button
                  className="example-chip"
                  key={example}
                  type="button"
                  onClick={() => onIdeaChange(example)}
                >
                  {formatExampleLabel(example)}
                </button>
              ))}
            </div>
          </div>

          <button
            className="continue-button"
            type="submit"
            disabled={idea.trim().length < 8 || isLoading}
          >
            {isLoading ? "Understanding your idea..." : "Continue →"}
          </button>

          {idea.trim().length > 0 && idea.trim().length < 8 ? (
            <p className="hint-message">
              Add a little more detail so I can ask a useful question.
            </p>
          ) : null}
          {error ? (
            <p className="error-message" role="alert">
              {error}
            </p>
          ) : null}
        </form>
        <p className="prototype-footer">
          Independent product exploration inspired by Deep24’s idea-to-app
          workflow.
        </p>
      </section>
    </main>
  );
}
