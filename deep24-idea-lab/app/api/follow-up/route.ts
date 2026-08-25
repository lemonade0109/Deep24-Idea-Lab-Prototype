import { NextResponse } from "next/server";

type FollowUp = {
  question: string;
  options: string[];
  helper: string;
};

function fallbackQuestion(idea: string): FollowUp {
  const normalized = idea.toLowerCase();

  if (/watch|shop|store|business|customer|order|inventory|sell/.test(normalized)) {
    return {
      question: "What part of running your business do you most want this app to help with?",
      options: [
        "Keeping track of stock",
        "Managing customer orders",
        "Tracking payments",
        "Keeping customer information",
        "Something else",
      ],
      helper: "Pick the biggest pain point first. We can add the rest later.",
    };
  }

  if (/study|learn|school|exam|student|flashcard/.test(normalized)) {
    return {
      question: "What should the app help you do when you study?",
      options: [
        "Remember information",
        "Practice with quizzes",
        "Organize my notes",
        "Plan study sessions",
        "Something else",
      ],
      helper: "Choose the outcome that matters most to you.",
    };
  }

  if (/workout|fitness|gym|exercise|run|training/.test(normalized)) {
    return {
      question: "What would make this fitness app most useful to you?",
      options: [
        "Create workout plans",
        "Track workouts",
        "Measure progress",
        "Keep me consistent",
        "Something else",
      ],
      helper: "Start with the job you want the app to do best.",
    };
  }

  return {
    question: "What is the main problem you want this app to solve for you?",
    options: [
      "Save me time",
      "Help me stay organized",
      "Track something important",
      "Automate a repetitive task",
      "Something else",
    ],
    helper: "Choose the closest answer. The next question can get more specific.",
  };
}

function extractJson(text: string): FollowUp | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<FollowUp>;

    if (
      typeof parsed.question === "string" &&
      Array.isArray(parsed.options) &&
      parsed.options.length >= 3 &&
      parsed.options.every((item) => typeof item === "string")
    ) {
      return {
        question: parsed.question,
        options: parsed.options.slice(0, 5),
        helper:
          typeof parsed.helper === "string"
            ? parsed.helper
            : "Choose the answer that best matches what you have in mind.",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { idea?: unknown };
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";

  if (!idea) {
    return NextResponse.json({ error: "Idea is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackQuestion(idea));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: [
          {
            role: "system",
            content:
              "You are the requirements-intelligence layer for an AI app builder. The user gives a rough app idea. Ask exactly ONE high-value follow-up question that removes the biggest ambiguity. Do not ask technical questions. Make it easy for a non-technical person. Return only valid JSON with keys: question (string), options (array of 4 or 5 short strings), helper (one short string). Include 'Something else' as the final option when appropriate.",
          },
          {
            role: "user",
            content: `App idea: ${idea}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      output?: Array<{
        content?: Array<{ type?: string; text?: string }>;
      }>;
    };

    const text =
      data.output
        ?.flatMap((item) => item.content ?? [])
        .find((item) => item.type === "output_text")?.text ?? "";

    const generated = extractJson(text);
    return NextResponse.json(generated ?? fallbackQuestion(idea));
  } catch {
    // Keep the prototype usable during demos even if the model is unavailable.
    return NextResponse.json(fallbackQuestion(idea));
  }
}
