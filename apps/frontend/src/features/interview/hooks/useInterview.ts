import { useState, useCallback, useRef } from "react";
import type { InterviewConfig, InterviewMessage, InterviewReport, InterviewSession } from "../types/interview.types";
import { startInterview, sendAnswer, generateReport } from "../api/interviewApi";
import { api } from "../../../services/api";

import { problemRepository } from "../../../app/api/client";

function ensureArray<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.items)) return inner.items as T[];
    }
  }
  return [];
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type InterviewPhase = "landing" | "setup" | "session" | "generating-report" | "report";

export function useInterview() {
  const [phase, setPhase] = useState<InterviewPhase>("landing");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const beginInterview = useCallback(async (config: InterviewConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch problems and select 3 random ones using the repository
      let selectedProblems: any[] = [];
      try {
        const rawResponse = await problemRepository.getProblems();
        const allProblems = ensureArray(rawResponse);
        if (allProblems.length > 0) {
          const shuffled = [...allProblems].sort(() => 0.5 - Math.random());
          selectedProblems = shuffled.slice(0, 3);
        } else {
          throw new Error("Empty problems array. Raw response: " + JSON.stringify(rawResponse));
        }
      } catch (err: any) {
        console.error("Failed to fetch problems", err);
        setError(err.message || "Lỗi khi lấy bài toán.");
        setIsLoading(false);
        return;
      }
      
      const firstMsg = await startInterview(config);
      const sess: InterviewSession = {
        id: genId(),
        config,
        problems: selectedProblems,
        messages: [{ id: genId(), role: "interviewer", content: firstMsg, timestamp: Date.now() }],
        currentQuestionIndex: 0,
        isCompleted: false,
        startTime: Date.now(),
      };
      startTimeRef.current = Date.now();
      setSession(sess);
      setPhase("session");
    } catch {
      setError("Không thể bắt đầu phỏng vấn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToSetup = useCallback(() => {
    setPhase("setup");
    beginInterview({
      topic: "algorithms",
      difficulty: "medium",
      numQuestions: 3,
      duration: 60,
    });
  }, [beginInterview]);


  const submitAnswer = useCallback(async (answer: string) => {
    if (!session || isLoading) return;
    setError(null);

    const candidateMsg: InterviewMessage = { id: genId(), role: "candidate", content: answer, timestamp: Date.now() };
    const updatedMsgs = [...session.messages, candidateMsg];
    setSession((prev) => prev ? { ...prev, messages: updatedMsgs } : prev);

    setIsLoading(true);
    try {
      const response = await sendAnswer(session.config, updatedMsgs, answer);
      const isComplete = response.includes("INTERVIEW_COMPLETE");
      const clean = response.replace("INTERVIEW_COMPLETE", "").trim();

      const interviewerMsg: InterviewMessage = { id: genId(), role: "interviewer", content: clean, timestamp: Date.now() };
      const finalMsgs = [...updatedMsgs, interviewerMsg];

      setSession((prev) =>
        prev ? { ...prev, messages: finalMsgs, currentQuestionIndex: prev.currentQuestionIndex + 1, isCompleted: isComplete } : prev
      );

      if (isComplete) {
        setPhase("generating-report");
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const r = await generateReport(session.config, finalMsgs, secs);
        setReport(r);
        setPhase("report");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading]);

  const resetInterview = useCallback(() => {
    setPhase("landing");
    setSession(null);
    setReport(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { phase, session, report, isLoading, error, goToSetup, beginInterview, submitAnswer, resetInterview };
}