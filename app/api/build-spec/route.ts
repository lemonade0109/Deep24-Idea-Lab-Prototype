import { NextResponse } from "next/server";
import { AppPlan, BuildSpec, HistoryItem } from "../../../types";

function fallback(plan: AppPlan): BuildSpec {
  const entities = [
    { name: "User", fields: ["id", "name", "createdAt"] },
    {
      name: "Item",
      fields: ["id", "title", "status", "createdAt", "updatedAt"],
    },
  ];
  return {
    productSummary: `${plan.name} is for ${plan.targetUser}. ${plan.purpose}`,
    userStories: plan.features
      .slice(0, 5)
      .map(
        (f) =>
          `As a user, I want to ${f.charAt(0).toLowerCase()}${f.slice(1)} so I can complete the app's main job.`,
      ),
    dataEntities: entities,
    screenDetails: plan.screens.slice(0, 6).map((name) => ({
      name,
      purpose: `Support the ${name.toLowerCase()} part of the workflow.`,
      actions: [
        "View relevant information",
        "Create or update data when needed",
      ],
    })),
    acceptanceCriteria: [
      "A user can complete the main workflow without technical knowledge.",
      "The interface clearly reflects the approved product plan.",
      "Core data persists between sessions.",
      "Empty, loading and error states are handled clearly.",
      "The app works on desktop and common mobile widths.",
    ],
    agentPrompt: `Build ${plan.name}, ${plan.tagline} The target user is ${plan.targetUser}. The purpose is: ${plan.purpose} Core features: ${plan.features.join("; ")}. Required screens: ${plan.screens.join(", ")}. Keep the product simple, usable and faithful to this specification.`,
  };
}

function parse(text: string): BuildSpec | null {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const p = JSON.parse(cleaned) as Partial<BuildSpec>;
    if (
      typeof p.productSummary !== "string" ||
      !Array.isArray(p.userStories) ||
      !Array.isArray(p.dataEntities) ||
      !Array.isArray(p.screenDetails) ||
      !Array.isArray(p.acceptanceCriteria) ||
      typeof p.agentPrompt !== "string"
    )
      return null;
    return {
      productSummary: p.productSummary,
      userStories: p.userStories
        .filter((x): x is string => typeof x === "string")
        .slice(0, 6),
      dataEntities: p.dataEntities
        .filter(
          (x): x is { name: string; fields: string[] } =>
            !!x && typeof x.name === "string" && Array.isArray(x.fields),
        )
        .slice(0, 6)
        .map((x) => ({
          name: x.name,
          fields: x.fields
            .filter((f): f is string => typeof f === "string")
            .slice(0, 8),
        })),
      screenDetails: p.screenDetails
        .filter(
          (x): x is { name: string; purpose: string; actions: string[] } =>
            !!x &&
            typeof x.name === "string" &&
            typeof x.purpose === "string" &&
            Array.isArray(x.actions),
        )
        .slice(0, 6)
        .map((x) => ({
          name: x.name,
          purpose: x.purpose,
          actions: x.actions
            .filter((a): a is string => typeof a === "string")
            .slice(0, 4),
        })),
      acceptanceCriteria: p.acceptanceCriteria
        .filter((x): x is string => typeof x === "string")
        .slice(0, 7),
      agentPrompt: p.agentPrompt,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    idea?: unknown;
    history?: unknown;
    plan?: unknown;
  };
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const history = Array.isArray(body.history)
    ? (body.history as HistoryItem[])
    : [];
  const plan = body.plan as AppPlan | undefined;
  if (
    !idea ||
    idea.length > 500 ||
    history.length > 5 ||
    !plan?.name ||
    !Array.isArray(plan.features) ||
    !Array.isArray(plan.screens)
  )
    return NextResponse.json(
      { error: "Approved plan is required." },
      { status: 400 },
    );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(fallback(plan));

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const interview = history
      .map((x, i) => `Q${i + 1}: ${x.question}\nA${i + 1}: ${x.answer}`)
      .join("\n\n");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        signal: AbortSignal.timeout(12000),
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You convert an approved plain-English app plan into a concise coding-agent-ready product specification. Stay faithful to the user's idea. Do not invent complex integrations or enterprise features. Return only JSON with exactly: productSummary (string), userStories (array of 4-6 strings), dataEntities (array of objects {name, fields:string[]}), screenDetails (array of objects {name,purpose,actions:string[]}), acceptanceCriteria (array of 5-7 testable strings), agentPrompt (one self-contained implementation prompt, 120-220 words).",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Original idea: ${idea}\n\nInterview:\n${interview}\n\nApproved plan:\n${JSON.stringify(plan, null, 2)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      },
    );
    if (!response.ok) throw new Error("Gemini failed");
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      "";
    return NextResponse.json(parse(text) ?? fallback(plan));
  } catch {
    return NextResponse.json(fallback(plan));
  }
}
