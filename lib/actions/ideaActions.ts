import type { AppSpec, BuildSpec, FollowUp, HistoryItem } from "@/types";

async function postJson<T>(
  url: string,
  body: unknown,
  errorMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export function fetchFollowUp(idea: string, history: HistoryItem[]) {
  return postJson<FollowUp>(
    "/api/follow-up",
    { idea, history },
    "Could not generate a follow-up question.",
  );
}

export function fetchAppSpec(idea: string, history: HistoryItem[]) {
  return postJson<AppSpec>(
    "/api/spec",
    { idea, history },
    "Could not create app plan.",
  );
}

export function fetchBuildSpec(
  idea: string,
  history: HistoryItem[],
  plan: AppSpec,
) {
  return postJson<BuildSpec>(
    "/api/build-spec",
    { idea, history, plan },
    "Could not create build specification.",
  );
}
