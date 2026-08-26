import { HistoryItem, FollowUp, Blueprint } from "@/types";
import { NextResponse } from "next/server";

function fallbackBlueprint(idea: string, history: HistoryItem[]): Blueprint {
  const text =
    `${idea} ${history.map((item) => item.answer).join(" ")}`.toLowerCase();

  if (/watch|shop|store|business|customer|order|inventory|sell/.test(text)) {
    return {
      purpose:
        history.length >= 1
          ? "Help a small business manage its day-to-day sales workflow."
          : "Clarifying the main business workflow.",
      targetUser: "Small business owner",
      features:
        history.length >= 1
          ? [
              "Inventory tracking",
              "Customer orders",
              ...(history.length >= 2 ? ["Payment tracking"] : []),
            ]
          : [],
      screens:
        history.length >= 2
          ? [
              "Dashboard",
              "Products",
              "Orders",
              ...(history.length >= 3 ? ["Customers", "Sales"] : []),
            ]
          : [],
      missing:
        history.length >= 3
          ? ["Final confirmation"]
          : history.length === 2
            ? ["What happens after an order"]
            : ["Main workflow", "Key actions"],
    };
  }

  if (/study|learn|school|exam|student|flashcard/.test(text)) {
    return {
      purpose:
        history.length >= 1
          ? "Help a learner organize study material and make progress easier to track."
          : "Clarifying the learning outcome.",
      targetUser: "Student or independent learner",
      features:
        history.length >= 1
          ? [
              "Study workflow",
              ...(history.length >= 2 ? ["Material import"] : []),
              ...(history.length >= 3 ? ["Progress tracking"] : []),
            ]
          : [],
      screens:
        history.length >= 2
          ? ["Home", "Study", ...(history.length >= 3 ? ["Progress"] : [])]
          : [],
      missing:
        history.length >= 3
          ? ["Final confirmation"]
          : ["Preferred study flow", "Progress feedback"],
    };
  }

  if (/workout|fitness|gym|exercise|run|training/.test(text)) {
    return {
      purpose:
        history.length >= 1
          ? "Help a user plan, track, and improve their fitness routine."
          : "Clarifying the fitness goal.",
      targetUser: "Individual fitness user",
      features:
        history.length >= 1
          ? [
              "Workout workflow",
              ...(history.length >= 2 ? ["Progress history"] : []),
              ...(history.length >= 3 ? ["Next-step guidance"] : []),
            ]
          : [],
      screens:
        history.length >= 2
          ? ["Today", "Workouts", ...(history.length >= 3 ? ["Progress"] : [])]
          : [],
      missing:
        history.length >= 3
          ? ["Final confirmation"]
          : ["Tracking needs", "Post-workout outcome"],
    };
  }

  return {
    purpose:
      history.length >= 1
        ? `Turn the idea “${idea.slice(0, 80)}${idea.length > 80 ? "…" : ""}” into a focused product workflow.`
        : "Clarifying the main outcome.",
    targetUser:
      history.length >= 2
        ? history[1]?.answer || "Primary user still being clarified"
        : "Still being clarified",
    features: history
      .slice(0, 3)
      .map((item) => item.answer)
      .filter(Boolean),
    screens: history.length >= 2 ? ["Home", "Main workflow"] : [],
    missing:
      history.length >= 3
        ? ["Final confirmation"]
        : ["Primary workflow", "Important constraints"],
  };
}

function fallbackQuestion(idea: string, history: HistoryItem[]): FollowUp {
  const normalized =
    `${idea} ${history.map((item) => item.answer).join(" ")}`.toLowerCase();
  const step = history.length;
  const completeness = [30, 56, 78, 92][Math.min(step, 3)];
  const blueprint = fallbackBlueprint(idea, history);

  if (step >= 3) {
    return {
      question: "I have enough to shape your app idea.",
      options: [],
      helper: "Next, we'll turn your answers into a clear app plan.",
      readyForSpec: true,
      completeness,
      blueprint,
    };
  }

  const withMeta = (
    item: Omit<FollowUp, "completeness" | "blueprint">,
  ): FollowUp => ({ ...item, completeness, blueprint });

  if (
    /watch|shop|store|business|customer|order|inventory|sell/.test(normalized)
  ) {
    const businessQuestions = [
      {
        question:
          "What part of running your business do you most want this app to help with?",
        options: [
          "Keeping track of stock",
          "Managing customer orders",
          "Tracking payments",
          "Keeping customer information",
          "Something else",
        ],
        helper: "Pick the biggest pain point first. We can add the rest later.",
      },
      {
        question: "How do customers usually place their orders?",
        options: [
          "WhatsApp",
          "Instagram",
          "Website",
          "Physical store",
          "A mix of these",
        ],
        helper:
          "This helps us understand where the app needs to fit into your current workflow.",
      },
      {
        question: "What should happen after an order is recorded?",
        options: [
          "Update stock automatically",
          "Track payment status",
          "Save customer details",
          "Show it on a sales dashboard",
          "All of these",
        ],
        helper: "Choose the outcome that would save you the most work.",
      },
    ];
    return withMeta(
      businessQuestions[Math.min(step, businessQuestions.length - 1)],
    );
  }

  if (/study|learn|school|exam|student|flashcard/.test(normalized)) {
    const questions = [
      {
        question: "What should the app help you do when you study?",
        options: [
          "Remember information",
          "Practice with quizzes",
          "Organize my notes",
          "Plan study sessions",
          "Something else",
        ],
        helper: "Choose the outcome that matters most to you.",
      },
      {
        question: "Where would your study material usually come from?",
        options: [
          "PDFs",
          "Typed notes",
          "Web links",
          "Photos of notes",
          "A mix of these",
        ],
        helper: "This tells us what the app needs to accept as input.",
      },
      {
        question: "How would you like the app to show your progress?",
        options: [
          "Quiz scores",
          "Topics completed",
          "Study streak",
          "Weak areas",
          "All of these",
        ],
        helper: "Pick the feedback that would be most useful.",
      },
    ];
    return withMeta(questions[Math.min(step, questions.length - 1)]);
  }

  const genericQuestions = [
    {
      question: "What is the main problem you want this app to solve for you?",
      options: [
        "Save me time",
        "Help me stay organized",
        "Track something important",
        "Automate a repetitive task",
        "Something else",
      ],
      helper:
        "Choose the closest answer. The next question can get more specific.",
    },
    {
      question: "Who would use this app most often?",
      options: [
        "Just me",
        "Customers",
        "A small team",
        "Students or learners",
        "Other people",
      ],
      helper:
        "Knowing the main user helps us decide what the experience should prioritize.",
    },
    {
      question:
        "What is the most important thing a user should be able to do inside the app?",
      options: [
        "Create something",
        "Track something",
        "Find information",
        "Get recommendations",
        "Manage a workflow",
      ],
      helper: "Pick the single action that would make the app worth using.",
    },
  ];

  return withMeta(
    genericQuestions[Math.min(step, genericQuestions.length - 1)],
  );
}

function extractJson(text: string, fallback: FollowUp): FollowUp | null {
  try {
    const fallbackBp: Blueprint = fallback.blueprint ?? {
      purpose: "",
      targetUser: "",
      features: [],
      screens: [],
      missing: [],
    };
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned) as Partial<FollowUp> & {
      blueprint?: Partial<Blueprint>;
    };
    const blueprint: Blueprint = {
      purpose:
        typeof parsed.blueprint?.purpose === "string"
          ? parsed.blueprint.purpose
          : fallbackBp.purpose,
      targetUser:
        typeof parsed.blueprint?.targetUser === "string"
          ? parsed.blueprint.targetUser
          : fallbackBp.targetUser,
      features: Array.isArray(parsed.blueprint?.features)
        ? parsed.blueprint.features
            .filter((item): item is string => typeof item === "string")
            .slice(0, 6)
        : fallbackBp.features,
      screens: Array.isArray(parsed.blueprint?.screens)
        ? parsed.blueprint.screens
            .filter((item): item is string => typeof item === "string")
            .slice(0, 6)
        : fallbackBp.screens,
      missing: Array.isArray(parsed.blueprint?.missing)
        ? parsed.blueprint.missing
            .filter((item): item is string => typeof item === "string")
            .slice(0, 4)
        : fallbackBp.missing,
    };
    const rawCompleteness: number =
      typeof parsed.completeness === "number"
        ? parsed.completeness
        : (fallback.completeness ?? 90);
    const completeness = Math.max(
      20,
      Math.min(
        parsed.readyForSpec === true ? 95 : 90,
        Math.round(rawCompleteness),
      ),
    );

    if (parsed.readyForSpec === true) {
      return {
        question:
          typeof parsed.question === "string"
            ? parsed.question
            : "I have enough to shape your app idea.",
        options: [],
        helper:
          typeof parsed.helper === "string"
            ? parsed.helper
            : "Next, we'll turn your answers into a clear app plan.",
        readyForSpec: true,
        completeness,
        blueprint,
      };
    }

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
        readyForSpec: false,
        completeness,
        blueprint,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { idea?: unknown; history?: unknown };
  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const history = Array.isArray(body.history)
    ? body.history.filter(
        (item): item is HistoryItem =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as HistoryItem).question === "string" &&
          typeof (item as HistoryItem).answer === "string",
      )
    : [];

  if (!idea || idea.length > 500) {
    return NextResponse.json(
      { error: "A valid idea is required." },
      { status: 400 },
    );
  }

  const fallback = fallbackQuestion(idea, history);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json(fallback);

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const conversation = history.length
      ? history
          .map(
            (item, index) =>
              `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`,
          )
          .join("\n\n")
      : "No follow-up questions have been answered yet.";

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
                text: `You are the requirements-intelligence layer for an AI app builder. Ask the ONE next highest-value question that removes the biggest remaining product ambiguity. Never repeat answered information and never ask technical implementation questions. Keep the interview to a maximum of 3 answered follow-up questions. Every response must ALSO estimate requirements completeness and update a live app blueprint from only what the user has actually told you. Do not invent unsupported details. Completeness should rise naturally as useful context is gathered, stay below 96 until the user approves the final plan, and generally move from roughly 25-40% initially toward 85-95% when ready. Return only valid JSON with keys: readyForSpec (boolean), question (string), options (array of 4-5 short strings, or [] when ready), helper (short string), completeness (number), blueprint ({ purpose: string, targetUser: string, features: string[], screens: string[], missing: string[] }). Use concise plain English. If something is not yet known, say \"Still being clarified\" or leave the relevant array empty. Include 'Something else' as the final option when appropriate.`,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Original app idea: ${idea}\n\nConversation so far:\n${conversation}\n\nAnswered follow-up count: ${history.length}`,
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

    if (!response.ok)
      throw new Error(`Gemini request failed: ${response.status}`);
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("") ?? "";
    return NextResponse.json(extractJson(text, fallback) ?? fallback);
  } catch {
    return NextResponse.json(fallback);
  }
}
