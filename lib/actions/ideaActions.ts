import { AppSpec, BuildSpec, FollowUp, HistoryItem } from "@/types";

export async function fetchFollowUp(
  idea: string,
  history: HistoryItem[],
): Promise<FollowUp> {
  const response = await fetch("/api/follow-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, history }),
  });

  if (!response.ok) {
    throw new Error("Could not generate a follow-up question.");
  }

  return (await response.json()) as FollowUp;
}

export async function fetchAppSpec(
  idea: string,
  history: HistoryItem[],
): Promise<AppSpec> {
  const response = await fetch("/api/spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, history }),
  });

  if (!response.ok) {
    throw new Error("Could not create app plan.");
  }

  return (await response.json()) as AppSpec;
}

export async function fetchBuildSpec(
  idea: string,
  history: HistoryItem[],
  plan: AppSpec,
): Promise<BuildSpec> {
  const response = await fetch("/api/build-spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, history, plan }),
  });

  if (!response.ok) {
    throw new Error("Could not create build specification.");
  }

  return (await response.json()) as BuildSpec;
}
