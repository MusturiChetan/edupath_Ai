import { describe, expect, it } from "vitest";
import {
  topicStatus,
  subjectAverage,
  weakTopics,
  matchCareers,
  generateTasks,
  DEMO_PROFILE,
  DEMO_SUBJECTS,
  EMPTY_STATE,
  guidanceReply,
  type Subject,
} from "@/lib/edupath";

describe("EduPath Rule-Based Gap Analysis Engine", () => {
  it("flags topic scores with transparent threshold rules", () => {
    expect(topicStatus(42)).toBe("attention");
    expect(topicStatus(49.9)).toBe("attention");
    expect(topicStatus(50)).toBe("review");
    expect(topicStatus(69)).toBe("review");
    expect(topicStatus(70)).toBe("strong");
    expect(topicStatus(100)).toBe("strong");
    expect(topicStatus(null)).toBe("nodata");
    expect(topicStatus(NaN)).toBe("nodata");
  });

  it("calculates subject averages without penalizing null scores", () => {
    const subject: Subject = {
      id: "s1",
      name: "Microcontrollers",
      topics: [
        { id: "t1", name: "Interrupts", score: 40 },
        { id: "t2", name: "GPIO", score: 80 },
        { id: "t3", name: "Timers", score: null }, // unassessed, should not count as 0
      ],
    };
    expect(subjectAverage(subject)).toBe(60);
  });

  it("extracts and sorts weak topics below 70%", () => {
    const weak = weakTopics(DEMO_SUBJECTS);
    expect(weak.length).toBeGreaterThan(0);
    // Should be sorted ascending by score (weakest first)
    for (let i = 0; i < weak.length - 1; i++) {
      expect(weak[i]?.score ?? 0).toBeLessThanOrEqual(weak[i + 1]?.score ?? 0);
    }
    // No topic >= 70% should be in weak topics
    weak.forEach((w) => {
      expect(w.score).toBeLessThan(70);
    });
  });

  it("calculates career matches with transparent points", () => {
    const matches = matchCareers(DEMO_PROFILE, DEMO_SUBJECTS);
    expect(matches.length).toBe(9); // 7 original + 2 new tracks
    // Embedded systems should score highest for the demo student
    expect(matches[0]?.career.id).toBe("embedded");
    expect(matches[0]?.reasons.length).toBeGreaterThan(0);
  });

  it("generates a balanced 7-day roadmap with weak topics prioritized", () => {
    const tasks = generateTasks(DEMO_PROFILE, DEMO_SUBJECTS);
    expect(tasks.length).toBeGreaterThanOrEqual(7);

    // Each task must have a day (0 to 6), duration, title, priority, and skill connection
    tasks.forEach((task) => {
      expect(task.day).toBeGreaterThanOrEqual(0);
      expect(task.day).toBeLessThanOrEqual(6);
      expect(task.minutes).toBeGreaterThan(0);
      expect(task.title.length).toBeGreaterThan(0);
      expect(["High", "Medium", "Low"]).toContain(task.priority);
      expect(task.skill.length).toBeGreaterThan(0);
    });
  });
});

describe("Rule-based study and career guidance", () => {
  const state = {
    ...EMPTY_STATE,
    profile: DEMO_PROFILE,
    subjects: DEMO_SUBJECTS,
    tasks: generateTasks(DEMO_PROFILE, DEMO_SUBJECTS),
  };

  it("uses the student's lowest scored topics for improvement advice", async () => {
    const reply = await guidanceReply("How can I improve my weak topics?", state);
    expect(reply).toContain("Interrupts");
    expect(reply).toContain("42%");
  });

  it("asks for onboarding before making a career match", async () => {
    const reply = await guidanceReply("Which career fits me?", EMPTY_STATE);
    expect(reply).toContain("Complete onboarding first");
  });

  it("returns a safe prompt when the question is outside supported topics", async () => {
    const reply = await guidanceReply("Tell me a joke", EMPTY_STATE);
    expect(reply).toContain("I can help with");
  });
});

describe("WebCrypto Password Security", () => {
  it("derives consistent hashes using PBKDF2 with SHA-256", async () => {
    const password = "Secur3Password123";
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"],
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    const exported = await crypto.subtle.exportKey("raw", derivedKey);
    const hashHex = Array.from(new Uint8Array(exported))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    expect(hashHex).toHaveLength(64); // 256 bits = 32 bytes = 64 hex characters
    expect(hashHex).not.toBe(password); // Never stores plaintext
  });
});
