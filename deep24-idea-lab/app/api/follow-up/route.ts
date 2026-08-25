import { NextResponse } from "next/server";

type HistoryItem = {
  question: string;
  answer: string;
};

type FollowUp = {
  question: string;
  options: string[];
  helper: string;
  readyForSpec?: boolean;
};

function fallbackQuestion(idea: string, history: HistoryItem[]): FollowUp {
  const normalized = `${idea} ${history.map((item) => item.answer).join(" ")}`.toLowerCase();
  const step = history.length;

  if (step >= 3) {
    return {
      question: "I have enough to shape your app idea.",
      options: [],
      helper: "Next, we'll turn your answers into a clear app plan.",
      readyForSpec: true,
    };
  }

  if (/watch|shop|store|business|customer|order|inventory|sell/.test(normalized)) {
    const businessQuestions: FollowUp[] = [
      {
        question: "What part of running your business do you most want this app to help with?",
        options: ["Keeping track of stock", "Managing customer orders", "Tracking payments", "Keeping customer information", "Something else"],
        helper: "Pick the biggest pain point first. We can add the rest later.",
      },
      {
        question: "How do customers usually place their orders?",
        options: ["WhatsApp", "Instagram", "Website", "Physical store", "A mix of these"],
        helper: "This helps us understand where the app needs to fit into your current workflow.",
      },
      {
        question: "What should happen after an order is recorded?",
        options: ["Update stock automatically", "Track payment status", "Save customer details", "Show it on a sales dashboard", "All of these"],
        helper: "Choose the outcome that would save you the most work.",
      },
    ];
    return businessQuestions[Math.min(step, businessQuestions.length - 1)];
  }

  if (/study|learn|school|exam|student|flashcard/.test(normalized)) {
    const studyQuestions: FollowUp[] = [
      {
        question: "What should the app help you do when you study?",
        options: ["Remember information", "Practice with quizzes", "Organize my notes", "Plan study sessions", "Something else"],
        helper: "Choose the outcome that matters most to you.",
      },
      {
        question: "Where would your study material usually come from?",
        options: ["PDFs", "Typed notes", "Web links", "Photos of notes", "A mix of these"],
        helper: "This tells us what the app needs to accept as input.",
      },
      {
        question: "How would you like the app to show your progress?",
        options: ["Quiz scores", "Topics completed", "Study streak", "Weak areas", "All of these"],
        helper: "Pick the feedback that would keep you most useful and motivated.",
      },
    ];
    return studyQuestions[Math.min(step, studyQuestions.length - 1)];
  }

  if (/workout|fitness|gym|exercise|run|training/.test(normalized)) {
    const fitnessQuestions: FollowUp[] = [
      {
        question: "What would make this fitness app most useful to you?",
        options: ["Create workout plans", "Track workouts", "Measure progress", "Keep me consistent", "Something else"],
        helper: "Start with the job you want the app to do best.",
      },
      {
        question: "What kind of information should the app remember about you?",
        options: ["Workout history", "Weights and reps", "Goals", "Body measurements", "All of these"],
        helper: "This helps define what the app should track over time.",
      },
      {
        question: "What should the app do after each workout?",
        options: ["Show progress", "Suggest the next workout", "Celebrate milestones", "Adjust the plan", "All of these"],
        helper: "Choose the follow-up that would make the app feel most useful.",
      },
    ];
    return fitnessQuestions[Math.min(step, fitnessQuestions.length - 1)];
  }

  const genericQuestions: FollowUp[] = [
    {
      question: "What is the main problem you want this app to solve for you?",
      options: ["Save me time", "Help me stay organized", "Track something important", "Automate a repetitive task", "Something else"],
      helper: "Choose the closest answer. The next question can get more specific.",
    },
    {
      question: "Who would use this app most often?",
      options: ["Just me", "Customers", "A small team", "Students or learners", "Other people"],
      helper: "Knowing the main user helps us decide what the experience should prioritize.",
    },
    {
      question: "What is the most important thing a user should be able to do inside the app?",
      options: ["Create something", "Track something", "Find information", "Get recommendations", "Manage a workflow"],
      helper: "Pick the single action that would make the app worth using.",
    },
  ];

  return genericQuestions[Math.min(step, genericQuestions.length - 1)];
}

function extractJson(text: string): FollowUp | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Partial<FollowUp>;

    if (parsed.readyForSpec === true) {
      return {
        question: typeof parsed.question === "string" ? parsed.question : "I have enough to shape your app idea.",
        options: [],
        helper: typeof parsed.helper === "string" ? parsed.helper : "Next, we'll turn your answers into a clear app plan.",
        readyForSpec: true,
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
        helper: typeof parsed.helper === "string" ? parsed.helper : "Choose the answer that best matches what you have in mind.",
        readyForSpec: false,
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
    return NextResponse.json({ error: "A valid idea is required." }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(fallbackQuestion(idea, history));
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const conversation = history.length
      ? history.map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`).join("\n\n")
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
                text: `You are the requirements-intelligence layer for an AI app builder. The user gives a rough app idea and then answers short follow-up questions. Your job is to ask the ONE next highest-value question that removes the biggest remaining product ambiguity. Never repeat something already answered. Never ask technical implementation questions. Make every question easy for a non-technical person. Keep the interview short: after 3 answered follow-up questions, return readyForSpec=true instead of another question. Before then, return readyForSpec=false. Return only valid JSON. When asking a question, use keys: readyForSpec (false), question (string), options (array of 4 or 5 short strings), helper (one short string). When enough information is collected, use keys: readyForSpec (true), question (short confirmation string), options ([]), helper (one short string). Include 'Something else' as the final option when appropriate.`,
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
            temperature: 0.35,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    const generated = extractJson(text);
    return NextResponse.json(generated ?? fallbackQuestion(idea, history));
  } catch {
    return NextResponse.json(fallbackQuestion(idea, history));
  }
}
