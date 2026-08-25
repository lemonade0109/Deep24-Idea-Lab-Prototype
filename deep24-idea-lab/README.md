# Founder outreach kit

## Short message

Hi Oliver — I’ve been looking closely at Deep24’s idea-to-app direction and built a small product exploration around one problem I think naturally appears in that workflow.

A non-technical user may know the app they want, but describe it too vaguely for a coding agent to build the right thing. I prototyped a lightweight requirements-intelligence layer that asks a few context-aware questions, turns the answers into a human-readable app plan, then produces a structured handoff for a coding agent.

I built the working prototype in Next.js + TypeScript with Gemini handling the requirements reasoning. It’s deliberately narrow rather than an attempt to recreate Deep24.

Demo: [YOUR_DEMO_URL]
GitHub: [YOUR_GITHUB_URL]

I’d love to hear whether this problem lines up with anything you’ve seen while building Deep24.

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
