export type HistoryItem = { question: string; answer: string };
export type AppPlan = {
  name: string;
  tagline: string;
  purpose: string;
  targetUser: string;
  features: string[];
  screens: string[];
};
export type BuildSpec = {
  productSummary: string;
  userStories: string[];
  dataEntities: { name: string; fields: string[] }[];
  screenDetails: { name: string; purpose: string; actions: string[] }[];
  acceptanceCriteria: string[];
  agentPrompt: string;
};

export type Blueprint = {
  purpose: string;
  targetUser: string;
  features: string[];
  screens: string[];
  missing: string[];
};

export type FollowUp = {
  question: string;
  options: string[];
  helper: string;
  readyForSpec?: boolean;
  completeness?: number;
  blueprint?: Blueprint;
};

export type AppSpec = {
  name: string;
  tagline: string;
  purpose: string;
  targetUser: string;
  features: string[];
  screens: string[];
};
