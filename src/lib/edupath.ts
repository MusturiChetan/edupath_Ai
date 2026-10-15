// Pure data + transparent rule-based logic. No AI model is involved.
export type Topic = { id: string; name: string; score: number | null };
export type Subject = { id: string; name: string; topics: Topic[] };
export type Profile = {
  name: string;
  course: string;
  branch: string;
  year: string;
  cgpa: number | null;
  interests: string[];
  strengths: string[];
  career: string;
  studyHours: number;
  goal: string;
};
export type Priority = "High" | "Medium" | "Low";
export type Task = {
  id: string;
  day: number;
  title: string;
  topic: string;
  minutes: number;
  priority: Priority;
  skill: string;
  done: boolean;
};
export type Activity = { id: string; text: string; at: number };
export type ChatMsg = { id: string; role: "user" | "bot"; text: string };
export type State = {
  profile: Profile | null;
  subjects: Subject[];
  tasks: Task[];
  activity: Activity[];
  chat: ChatMsg[];
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const INTERESTS = [
  "Electronics", "Programming", "Data", "Design", "Hardware", "Research",
  "Mathematics", "Networking", "AI / ML", "Web", "Robotics", "Writing",
];
export const STRENGTHS = [
  "Problem solving", "Logical thinking", "Creativity", "Communication",
  "Attention to detail", "Hands-on building", "Analysis", "Self-learning",
];

export type Career = {
  id: string;
  title: string;
  overview: string;
  tags: string[];
  strengthTags: string[];
  subjectKeywords: string[];
  skills: string[];
  next: string[];
  project: string;
  roadmap: string[];
};

export const CAREERS: Career[] = [
  {
    id: "embedded", title: "Embedded Systems Engineer",
    overview: "Design firmware and low-level software that runs on microcontrollers inside devices.",
    tags: ["Electronics", "Hardware", "Programming", "Robotics"],
    strengthTags: ["Hands-on building", "Attention to detail", "Logical thinking"],
    subjectKeywords: ["microcontroller", "digital", "c programming", "electronics", "signals"],
    skills: ["C / C++", "Digital electronics", "Microcontrollers"],
    next: ["RTOS basics", "UART / SPI / I2C", "Debugging with a logic analyzer"],
    project: "Temperature logger on an Arduino or STM32 that writes readings to an SD card.",
    roadmap: ["Embedded C refresh", "GPIO & timers", "Serial protocols", "Interrupts", "Mini RTOS project"],
  },
  {
    id: "iot", title: "IoT Engineer",
    overview: "Connect sensors and devices to the cloud and build systems that collect and act on data.",
    tags: ["Electronics", "Networking", "Programming", "Hardware"],
    strengthTags: ["Hands-on building", "Problem solving"],
    subjectKeywords: ["network", "microcontroller", "sensor", "communication"],
    skills: ["Sensors", "Networking basics", "Python or C"],
    next: ["MQTT", "ESP32 Wi-Fi", "Simple cloud dashboards"],
    project: "ESP32 room monitor publishing temperature and humidity over MQTT to a web dashboard.",
    roadmap: ["Sensor interfacing", "ESP32 setup", "MQTT messaging", "Dashboard", "Power optimisation"],
  },
  {
    id: "software", title: "Software Developer",
    overview: "Build applications and services, working with code, version control and teams.",
    tags: ["Programming", "Web", "Mathematics"],
    strengthTags: ["Problem solving", "Logical thinking", "Self-learning"],
    subjectKeywords: ["data structures", "programming", "algorithms", "database", "oop"],
    skills: ["One programming language", "Data structures", "Git"],
    next: ["Algorithms practice", "A web framework", "Testing basics"],
    project: "A personal task tracker web app with login-free local storage and filters.",
    roadmap: ["DSA fundamentals", "Git workflow", "Build a CRUD app", "Write tests", "Deploy a project"],
  },
  {
    id: "data", title: "Data Analyst",
    overview: "Turn raw data into insights using spreadsheets, SQL, statistics and visualisation.",
    tags: ["Data", "Mathematics", "AI / ML"],
    strengthTags: ["Analysis", "Attention to detail", "Communication"],
    subjectKeywords: ["statistics", "probability", "database", "mathematics", "sql"],
    skills: ["Spreadsheets", "Basic statistics"],
    next: ["SQL queries", "Python with pandas", "Charts that tell a story"],
    project: "Analyse a public dataset (e.g. city weather) and publish a 1-page findings report.",
    roadmap: ["Statistics refresh", "SQL basics", "pandas", "Visualisation", "Portfolio report"],
  },
  {
    id: "uiux", title: "UI/UX Designer",
    overview: "Research user needs and design clear, usable interfaces for digital products.",
    tags: ["Design", "Web", "Writing"],
    strengthTags: ["Creativity", "Communication", "Attention to detail"],
    subjectKeywords: ["design", "graphics", "web"],
    skills: ["Visual sense", "Empathy for users"],
    next: ["Figma", "User interviews", "Design systems"],
    project: "Redesign your college notice board app and test it with five classmates.",
    roadmap: ["Design principles", "Figma basics", "User research", "Prototyping", "Case study"],
  },
  {
    id: "research", title: "Research / Higher Studies",
    overview: "Pursue an MTech, MS or PhD path and contribute to deep technical problems.",
    tags: ["Research", "Mathematics", "AI / ML", "Writing"],
    strengthTags: ["Analysis", "Self-learning", "Logical thinking"],
    subjectKeywords: ["mathematics", "signals", "theory", "physics"],
    skills: ["Strong fundamentals", "Reading papers"],
    next: ["Entrance exam syllabus", "Technical writing", "A small literature review"],
    project: "Replicate one result from a published paper in your field and write it up.",
    roadmap: ["Core subject revision", "Exam practice", "Read 3 papers", "Mini replication", "Write report"],
  },
  {
    id: "ml", title: "Machine Learning Engineer",
    overview: "Build and deploy models that learn from data to make predictions.",
    tags: ["AI / ML", "Data", "Programming", "Mathematics"],
    strengthTags: ["Analysis", "Problem solving", "Self-learning"],
    subjectKeywords: ["probability", "linear algebra", "statistics", "programming"],
    skills: ["Python", "Linear algebra"],
    next: ["scikit-learn", "Model evaluation", "Data cleaning"],
    project: "Train a simple classifier on a public dataset and explain its mistakes.",
    roadmap: ["Math for ML", "Python & numpy", "Classic models", "Evaluation", "Mini project"],
  },
];

export type TopicStatus = "attention" | "review" | "strong" | "nodata";
// Transparent rule: <50 needs attention, 50–69 review, ≥70 strong, blank = no data.
export function topicStatus(score: number | null): TopicStatus {
  if (score === null || Number.isNaN(score)) return "nodata";
  if (score < 50) return "attention";
  if (score < 70) return "review";
  return "strong";
}
export const STATUS_LABEL: Record<TopicStatus, string> = {
  attention: "Needs attention", review: "Review", strong: "Strong", nodata: "No data yet",
};

export function subjectAverage(s: Subject): number | null {
  const v = s.topics.map((t) => t.score).filter((x): x is number => x !== null);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
}

export function weakTopics(subjects: Subject[]) {
  return subjects
    .flatMap((s) => s.topics.map((t) => ({ ...t, subject: s.name })))
    .filter((t) => t.score !== null && t.score < 70)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
}

export type CareerMatch = { career: Career; points: number; reasons: string[] };
// Transparent rule: +2 per shared interest, +1 per shared strength,
// +3 if it's the preferred direction, +1 per strong related subject.
export function matchCareers(profile: Profile | null, subjects: Subject[]): CareerMatch[] {
  return CAREERS.map((career) => {
    const reasons: string[] = [];
    let points = 0;
    if (profile) {
      const i = career.tags.filter((t) => profile.interests.includes(t));
      if (i.length) { points += i.length * 2; reasons.push(`You're interested in ${i.join(", ")}`); }
      const s = career.strengthTags.filter((t) => profile.strengths.includes(t));
      if (s.length) { points += s.length; reasons.push(`Uses your strengths: ${s.join(", ")}`); }
      if (profile.career === career.id) { points += 3; reasons.push("Matches your preferred direction"); }
    }
    const strong = subjects.filter((sub) => {
      const avg = subjectAverage(sub);
      return avg !== null && avg >= 70 && career.subjectKeywords.some((k) => sub.name.toLowerCase().includes(k));
    });
    if (strong.length) { points += strong.length; reasons.push(`Good scores in ${strong.map((x) => x.name).join(", ")}`); }
    return { career, points, reasons };
  }).sort((a, b) => b.points - a.points);
}

export function generateTasks(profile: Profile, subjects: Subject[]): Task[] {
  const weak = weakTopics(subjects);
  const top = matchCareers(profile, subjects)[0]?.career;
  const daily = Math.max(30, Math.round(profile.studyHours * 60));
  const tasks: Task[] = [];
  for (let d = 0; d < 7; d++) {
    const w = weak.length ? weak[d % weak.length] : null;
    if (w) {
      const attention = topicStatus(w.score) === "attention";
      tasks.push({
        id: uid(), day: d,
        title: attention ? `Rebuild basics: ${w.name}` : `Practice problems: ${w.name}`,
        topic: `${w.subject} · ${w.name}`,
        minutes: Math.round(daily * 0.6), priority: attention ? "High" : "Medium",
        skill: `Closes a gap in ${w.subject} (scored ${w.score}%)`, done: false,
      });
    }
    if (top) {
      const step = top.roadmap[d % top.roadmap.length] ?? top.title;
      tasks.push({
        id: uid(), day: d, title: step, topic: top.title,
        minutes: Math.round(daily * (w ? 0.4 : 1)), priority: d === 6 ? "Low" : "Medium",
        skill: `Builds toward ${top.title}`, done: false,
      });
    }
  }
  return tasks;
}

export const DEMO_PROFILE: Profile = {
  name: "Aarav (demo)", course: "BTech", branch: "Electronics & Communication", year: "3rd year · Sem 5",
  cgpa: 7.4, interests: ["Electronics", "Programming", "Hardware"],
  strengths: ["Hands-on building", "Logical thinking"], career: "embedded", studyHours: 2,
  goal: "Get comfortable with microcontroller programming before my internship.",
};
export const DEMO_SUBJECTS: Subject[] = [
  { id: uid(), name: "Microcontrollers", topics: [
    { id: uid(), name: "Interrupts", score: 42 }, { id: uid(), name: "Timers", score: 58 }, { id: uid(), name: "GPIO", score: 81 } ] },
  { id: uid(), name: "Signals & Systems", topics: [
    { id: uid(), name: "Fourier transform", score: 47 }, { id: uid(), name: "Convolution", score: 66 }, { id: uid(), name: "Z-transform", score: null } ] },
  { id: uid(), name: "C Programming", topics: [
    { id: uid(), name: "Pointers", score: 61 }, { id: uid(), name: "Structs", score: 78 } ] },
];

export const EMPTY_STATE: State = { profile: null, subjects: [], tasks: [], activity: [], chat: [] };

// Rule-based guidance responder. Replace with an API call later (same signature).
export async function guidanceReply(q: string, s: State): Promise<string> {
  await new Promise((r) => setTimeout(r, 600));
  const t = q.toLowerCase();
  const weak = weakTopics(s.subjects);
  const top = matchCareers(s.profile, s.subjects).slice(0, 3);
  if (t.includes("embedded")) {
    const c = CAREERS[0]!;
    return `Beginner embedded roadmap:\n${c.roadmap.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nStarter project: ${c.project}`;
  }
  if (t.includes("weak") || t.includes("improve")) {
    if (!weak.length) return "I don't see any topics under 70% yet. Add topic scores on the Weak Topics page and I'll suggest revision steps.";
    return `Your lowest topics right now:\n${weak.slice(0, 3).map((w) => `• ${w.name} (${w.subject}) — ${w.score}%`).join("\n")}\n\nTry: re-read the basics for 20 minutes, solve 5 graded problems, then explain it out loud in your own words. Re-test after 3 days.`;
  }
  if (t.includes("career") || t.includes("suit")) {
    if (!s.profile) return "Complete onboarding first so I can compare careers against your interests.";
    return `Based on the matching rules (interests, strengths, preferred direction):\n${top.map((m) => `• ${m.career.title} — ${m.points} pts`).join("\n")}\n\nThese are suggestions to explore, not guarantees.`;
  }
  if (t.includes("week") || t.includes("next") || t.includes("study")) {
    const pending = s.tasks.filter((x) => !x.done);
    if (!pending.length) return s.tasks.length ? "You've completed every task this week. Regenerate your roadmap from the Roadmap page." : "You don't have a roadmap yet. Generate one from onboarding or the Roadmap page.";
    return `Next up:\n${pending.slice(0, 3).map((p) => `• ${DAYS[p.day]}: ${p.title} (${p.minutes} min)`).join("\n")}`;
  }
  return "I can help with: what to study next, improving weak topics, which careers fit your interests, or a beginner embedded systems roadmap. Try one of the suggestions below.";
}
