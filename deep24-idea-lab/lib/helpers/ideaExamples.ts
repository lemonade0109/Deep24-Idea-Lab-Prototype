export const EXAMPLE_IDEAS = [
  "I want an app to help me study.",
  "I need something to track customer orders.",
  "I want a tool that helps me plan workouts.",
];

const EXAMPLE_PREFIX_PATTERN =
  /^I (want|need) (an app|something|a tool) (that )?/i;

export function formatExampleLabel(example: string) {
  return example.replace(EXAMPLE_PREFIX_PATTERN, "");
}
