# Deep24 Idea Lab

A small product exploration inspired by Deep24's idea-to-app workflow.

Non-technical users often know _what_ they want to build but describe it too vaguely for a coding agent to act on. This prototype adds a lightweight requirements-intelligence layer in front of that gap: it interviews the user with a few context-aware questions, turns the answers into a plain-English app plan, and then produces a structured, coding-agent-ready specification.

> This is a narrow, independent exploration — not an attempt to recreate Deep24.

## How it works

1. **Describe your idea** — the user types a short, plain-English description of the app they want.
2. **Answer a few follow-up questions** — each question is generated from the original idea plus every previous answer, so the interview adapts as it goes. It ends automatically once there's enough context (max ~3 questions).
3. **Review the app plan** — the conversation is turned into a human-readable plan: purpose, target user, core features, and suggested screens.
4. **Get the agent handoff** — once the plan is approved, the app generates a structured specification (user stories, data entities, screen requirements, acceptance criteria) plus a self-contained prompt that can be copied straight into a coding agent.

## Tech stack

- **[Next.js](https://nextjs.org)** (App Router) + **TypeScript** — UI and API routes
- **React 19**
- **[Gemini API](https://ai.google.dev)** — powers the follow-up questions, app plan, and build spec generation, with rule-based fallbacks if the API is unavailable

## Project structure

```
app/
  page.tsx              # Screen orchestration and state
  api/
    follow-up/route.ts   # Generates the next interview question
    spec/route.ts        # Turns idea & answers into an app plan
    build-spec/route.ts  # Turns the app plan into an agent-ready spec
components/              # One component per screen (idea form, question, plan, build spec)
lib/
  actions/                # Client-side fetch wrappers for the API routes
  helpers/                # Small pure helper functions
types/                    # Shared TypeScript types
```

## Getting started

### Prerequisites

- Node.js 18.18+
- A [Gemini API key](https://aistudio.google.com/apikey)

### Setup

```bash
npm install
```

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash   # optional, defaults to gemini-2.5-flash
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint the project
```

## Notes

- If `GEMINI_API_KEY` is missing or the request fails, each API route falls back to a rule-based response so the demo flow still works end-to-end.
- The interview logic is intentionally kept short (max 3 questions) to keep the flow fast for a demo.

## 60-second demo script

**0–8 sec**
“Deep24 lets people describe an app and have agents build it. I explored what happens when the user knows what they want, but doesn’t know how to specify it clearly.”

**8–18 sec**
Type: “I want an app to manage my watch business.”

“Instead of sending that vague request directly to a coding agent, Idea Lab identifies the biggest missing requirement.”

**18–35 sec**
Answer the generated questions.

“The questions aren’t hardcoded. Each one uses the original idea plus the previous answers, and the interview stays intentionally short.”

**35–48 sec**
Show the generated app plan.

“Once it has enough context, it turns the conversation into a plain-English plan that the user can approve before anything gets built.”

**48–60 sec**
Show the coding-agent specification and Copy Agent Prompt button.

“After approval, it generates the structured handoff: user stories, data entities, screen requirements, acceptance criteria, and a self-contained agent prompt. The goal is to reduce ambiguity before an autonomous build starts.”

## Demo tips

- Use one clean example all the way through.
- Keep the recording under 90 seconds.
- Show the AI-generated questions changing based on your answers.
- Do not spend time explaining Gemini or implementation details unless asked.
- Finish on the coding-agent handoff screen.
