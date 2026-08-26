import { HistoryItem, AppSpec } from "@/types";
import { NextResponse } from "next/server";

function fallbackSpec(idea: string, history: HistoryItem[]): AppSpec {
  const text =
    `${idea} ${history.map((x) => x.answer).join(" ")}`.toLowerCase();
  if (/watch|shop|store|business|customer|order|inventory|sell/.test(text)) {
    return {
      name: "ShopFlow",
      tagline: "Keep stock, orders and payments in one simple place.",
      purpose:
        "Help a small business owner manage everyday sales operations without juggling notes and chats.",
      targetUser: "Small retail business owner",
      features: [
        "Track products and available stock",
        "Record and manage customer orders",
        "Track paid and unpaid orders",
        "Save customer details",
        "See a simple daily sales overview",
      ],
      screens: ["Dashboard", "Products", "Orders", "Customers", "Sales"],
    };
  }
  if (/study|learn|school|exam|student/.test(text)) {
    return {
      name: "StudyFlow",
      tagline: "Turn study material into a clear daily learning routine.",
      purpose:
        "Help learners organize material, practice what they know and see where they need more work.",
      targetUser: "Student or independent learner",
      features: [
        "Add study material",
        "Create practice questions",
        "Organize topics",
        "Track learning progress",
        "Highlight weak areas",
      ],
      screens: ["Home", "Library", "Practice", "Progress", "Topics"],
    };
  }
  return {
    name: "MyApp",
    tagline: "A focused app built around the job you need done.",
    purpose: idea,
    targetUser: "The person who described this idea",
    features: history
      .slice(0, 3)
      .map((x) => x.answer)
      .concat(["Simple, focused workflow", "Clear progress overview"])
      .slice(0, 5),
    screens: ["Home", "Main workspace", "Activity", "Settings"],
  };
}

function parseSpec(text: string): AppSpec | null {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const p = JSON.parse(cleaned) as Partial<AppSpec>;
    if (
      typeof p.name === "string" &&
      typeof p.tagline === "string" &&
      typeof p.purpose === "string" &&
      typeof p.targetUser === "string" &&
      Array.isArray(p.features) &&
      Array.isArray(p.screens)
    ) {
      return {
        name: p.name,
        tagline: p.tagline,
        purpose: p.purpose,
        targetUser: p.targetUser,
        features: p.features
          .filter((x): x is string => typeof x === "string")
          .slice(0, 6),
        screens: p.screens
          .filter((x): x is string => typeof x === "string")
          .slice(0, 6),
      };
    }
  } catch {}
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { idea?: unknown; history?: unknown };
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const history = Array.isArray(body.history)
    ? body.history.filter(
        (x): x is HistoryItem =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as HistoryItem).question === "string" &&
          typeof (x as HistoryItem).answer === "string",
      )
    : [];
  if (!idea || idea.length > 500 || history.length > 5)
    return NextResponse.json(
      { error: "Invalid interview data." },
      { status: 400 },
    );
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(fallbackSpec(idea, history));
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const conversation = history
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
                text: "You turn a non-technical user's rough app idea and short interview answers into a concise product plan. Do not add speculative features unrelated to their answers. Use plain English. Give the app a short memorable name. Return only JSON with exactly these keys: name (string), tagline (one sentence), purpose (1-2 sentences), targetUser (short string), features (array of 4-6 concrete user-facing features), screens (array of 4-6 short screen names).",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Original idea: ${idea}\n\nInterview:\n${conversation}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
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
    return NextResponse.json(parseSpec(text) ?? fallbackSpec(idea, history));
  } catch {
    return NextResponse.json(fallbackSpec(idea, history));
  }
}
