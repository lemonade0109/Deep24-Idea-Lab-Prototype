"use client";

import React from "react";
import { AppSpec, BuildSpec, FollowUp, HistoryItem } from "@/types";
import {
  fetchAppSpec,
  fetchBuildSpec,
  fetchFollowUp,
} from "@/lib/actions/ideaActions";
import { IdeaFormScreen } from "@/components/IdeaFormScreen";
import { QuestionScreen } from "@/components/QuestionScreen";
import { AppPlanScreen } from "@/components/AppPlanScreen";
import { BuildSpecScreen } from "@/components/BuildSpecScreen";

export default function Home() {
  const [idea, setIdea] = React.useState("");
  const [submittedIdea, setSubmittedIdea] = React.useState("");
  const [followUp, setFollowUp] = React.useState<FollowUp | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedOption, setSelectedOption] = React.useState("");
  const [customAnswer, setCustomAnswer] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [spec, setSpec] = React.useState<AppSpec | null>(null);
  const [buildSpec, setBuildSpec] = React.useState<BuildSpec | null>(null);
  const [copyStatus, setCopyStatus] = React.useState<
    "idle" | "copied" | "failed"
  >("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedIdea = idea.trim();
    if (!trimmedIdea || isLoading) return;

    setError("");
    setIsLoading(true);
    setSubmittedIdea(trimmedIdea);
    setHistory([]);

    try {
      const data = await fetchFollowUp(trimmedIdea, []);
      setFollowUp(data);
    } catch {
      setError("We couldn't understand that idea just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAnswer() {
    if (!followUp || isLoading) return;
    const answer =
      selectedOption === "Something else"
        ? customAnswer.trim()
        : selectedOption;
    if (!answer) return;

    const nextHistory = [...history, { question: followUp.question, answer }];
    setError("");
    setIsLoading(true);

    try {
      const data = await fetchFollowUp(submittedIdea, nextHistory);
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
      const data = await fetchAppSpec(submittedIdea, history);
      setSpec(data);
    } catch {
      setError("We couldn't create your app plan just yet. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createBuildSpecHandler() {
    if (!spec || isLoading) return;
    setError("");
    setIsLoading(true);
    try {
      const data = await fetchBuildSpec(submittedIdea, history, spec);
      setBuildSpec(data);
    } catch {
      setError(
        "We couldn't create the build specification just yet. Please try again.",
      );
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
      <BuildSpecScreen
        spec={spec}
        buildSpec={buildSpec}
        isLoading={isLoading}
        error={error}
        copyStatus={copyStatus}
        onBack={() => setBuildSpec(null)}
        onRegenerate={createBuildSpecHandler}
        onCopyAgentPrompt={copyAgentPrompt}
        onStartOver={resetPrototype}
      />
    );
  }

  if (spec) {
    return (
      <AppPlanScreen
        spec={spec}
        isLoading={isLoading}
        error={error}
        onBack={() => setSpec(null)}
        onRegenerate={createAppPlan}
        onContinue={createBuildSpecHandler}
      />
    );
  }

  if (followUp) {
    return (
      <QuestionScreen
        followUp={followUp}
        submittedIdea={submittedIdea}
        history={history}
        selectedOption={selectedOption}
        customAnswer={customAnswer}
        isLoading={isLoading}
        error={error}
        onGoBack={goBack}
        onSelectOption={(option) => {
          setSelectedOption(option);
          if (option !== "Something else") setCustomAnswer("");
        }}
        onCustomAnswerChange={setCustomAnswer}
        onAnswer={handleAnswer}
        onCreateAppPlan={createAppPlan}
      />
    );
  }

  return (
    <IdeaFormScreen
      idea={idea}
      isLoading={isLoading}
      error={error}
      onIdeaChange={setIdea}
      onSubmit={handleSubmit}
    />
  );
}
