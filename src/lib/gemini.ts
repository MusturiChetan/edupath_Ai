export type AcademicContext = {
  profile?: {
    course?: string;
    branch?: string;
    year?: string;
    interests?: string[];
    strengths?: string[];
    career?: string;
  };
  subjects: Array<{
    name: string;
    topics: Array<{ name: string; score: number | null }>;
  }>;
  pendingTasks: Array<{ day: number; title: string; minutes: number }>;
};
