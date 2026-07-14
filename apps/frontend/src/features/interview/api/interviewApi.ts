import type { InterviewConfig, InterviewMessage, InterviewReport } from "../types/interview.types";

const TOPIC_LABELS: Record<string, string> = {
  algorithms: "Algorithms & Complexity",
  "data-structures": "Data Structures",
  "system-design": "System Design",
  behavioral: "Behavioral / HR",
  frontend: "Frontend Development",
  backend: "Backend Development",
  database: "Databases & SQL",
};

function buildSystemPrompt(config: InterviewConfig): string {
  return `You are Arya, an expert technical interviewer at a top tech company. You are conducting a ${config.difficulty} difficulty interview on "${TOPIC_LABELS[config.topic]}".

Rules:
- Ask exactly ${config.numQuestions} questions total, one at a time.
- Start by greeting the candidate warmly and asking the first question immediately.
- After each answer, give a brief acknowledgment (1-2 sentences), then move to the next question.
- Label each question like "Question 2/${config.numQuestions}:".
- When all ${config.numQuestions} questions are answered, say thank you and end with the word INTERVIEW_COMPLETE on its own line.
- Be professional but friendly.
- Keep responses concise (2-4 sentences) except the final message.
- Do NOT answer the questions yourself.`;
}

async function callClaude(
  messages: { role: "user" | "assistant"; content: string }[],
  system: string
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Đây là phản hồi từ AI (Mocked do thiếu API key / chặn CORS).");
    }, 1000);
  });
}

export async function startInterview(config: InterviewConfig): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Xin chào! Tôi là Arya, người phỏng vấn của bạn hôm nay. Tôi đã chuẩn bị 3 bài toán. Bạn đã sẵn sàng chưa?`);
    }, 1000);
  });
}

export async function sendAnswer(
  config: InterviewConfig,
  history: InterviewMessage[],
  answer: string
): Promise<string> {
  const messages = history.map((m) => ({
    role: m.role === "interviewer" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));
  messages.push({ role: "user", content: answer });
  return callClaude(messages, buildSystemPrompt(config));
}

export async function generateReport(
  config: InterviewConfig,
  history: InterviewMessage[],
  durationSeconds: number
): Promise<InterviewReport> {
  const transcript = history
    .map((m) => `${m.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: ${m.content}`)
    .join("\n\n");

  const prompt = `Evaluate this technical interview for "${TOPIC_LABELS[config.topic]}" (${config.difficulty}).

TRANSCRIPT:
${transcript}

Return ONLY valid JSON, no markdown fences:
{
  "totalScore": <0-100>,
  "overallFeedback": "<2-3 sentences>",
  "recommendation": "<strong-hire|hire|no-hire>",
  "evaluations": [
    {
      "questionIndex": 0,
      "question": "<question text>",
      "score": <0-10>,
      "feedback": "<specific feedback>",
      "strengths": ["<strength>"],
      "improvements": ["<improvement>"]
    }
  ],
  "skillBreakdown": [
    { "label": "Problem Solving", "score": <0-100> },
    { "label": "Technical Knowledge", "score": <0-100> },
    { "label": "Communication", "score": <0-100> },
    { "label": "Code Quality", "score": <0-100> },
    { "label": "Depth of Answer", "score": <0-100> }
  ]
}`;

  const raw = `
  {
    "totalScore": 75,
    "overallFeedback": "The candidate showed reasonable knowledge (Mocked).",
    "recommendation": "hire",
    "evaluations": [],
    "skillBreakdown": [
      { "label": "Problem Solving", "score": 75 },
      { "label": "Technical Knowledge", "score": 70 },
      { "label": "Communication", "score": 80 },
      { "label": "Code Quality", "score": 75 },
      { "label": "Depth of Answer", "score": 70 }
    ]
  }
  `;

  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    parsed = {
      totalScore: 65,
      overallFeedback: "The candidate showed reasonable knowledge. There is room for improvement.",
      recommendation: "hire",
      evaluations: [],
      skillBreakdown: [
        { label: "Problem Solving", score: 65 },
        { label: "Technical Knowledge", score: 70 },
        { label: "Communication", score: 60 },
        { label: "Code Quality", score: 65 },
        { label: "Depth of Answer", score: 60 },
      ],
    };
  }

  return { ...parsed, config, duration: durationSeconds };
}