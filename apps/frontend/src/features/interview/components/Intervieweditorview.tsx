import React, { useEffect, useRef, useState } from "react";
import type { InterviewSession } from "../types/interview.types";
import { CodeEditorPane } from "../../../components/editor/CodeEditorPane";
import { ConsolePane } from "../../../components/editor/ConsolePane";
import { ProblemDescription } from "../../../components/editor/ProblemDescription";
import { api } from "../../../services/api";

interface Props {
  session: InterviewSession | null;
  onSubmitAnswer: (answer: string) => void;
  isLoading: boolean;
  error: string | null;
  onBack?: () => void;
}

const InterviewEditorView: React.FC<Props> = ({ session, onSubmitAnswer, isLoading, error, onBack }) => {
  const problems = session?.problems || [];
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = problems[problemIndex];

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<'cpp' | 'java' | 'python'>("cpp");

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCodes?.[language] ?? "");
    }
  }, [problem, language]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState<string>("");
  const [submissionId, setSubmissionId] = useState<string>("");

  const handleNextProblem = () => {
    if (problemIndex < problems.length - 1) {
      setProblemIndex((prev) => prev + 1);
    }
  };

  const handlePrevProblem = () => {
    if (problemIndex > 0) {
      setProblemIndex((prev) => prev - 1);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem) return;
    
    // Submit to AI for analysis
    onSubmitAnswer(code);
    
    // Submit to Judge
    setIsSubmitting(true);
    setVerdict("");
    try {
      const res = await api.submitCode({
        problemId: problem.id || problem._id || problem.slug,
        code,
        language,
      });
      if (res.success && res.data) {
        setSubmissionId(res.data.id || res.data._id);
        setVerdict("PENDING"); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mediaSource, setMediaSource] = useState<"none" | "camera" | "screen">("none");
  const [mediaStatus, setMediaStatus] = useState<"idle" | "starting" | "active" | "error">("idle");
  const [mediaError, setMediaError] = useState<string | null>(null);

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMediaSource("none");
    setMediaStatus("idle");
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaStatus("error");
      setMediaError("Trình duyệt không hỗ trợ camera.");
      return;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setMediaStatus("starting");
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMediaSource("camera");
      setMediaStatus("active");
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopMedia();
      });
    } catch (err) {
      setMediaStatus("error");
      setMediaError(
        err instanceof Error ? err.message : "Không thể truy cập camera."
      );
    }
  };

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaStatus("error");
      setMediaError("Trình duyệt không hỗ trợ chia sẻ màn hình.");
      return;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setMediaStatus("starting");
    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMediaSource("screen");
      setMediaStatus("active");
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopMedia();
      });
    } catch (err) {
      setMediaStatus("error");
      setMediaError(
        err instanceof Error ? err.message : "Không thể chia sẻ màn hình."
      );
    }
  };

  const toggleScreenShare = () => {
    if (mediaSource === "screen" && mediaStatus === "active") {
      stopMedia();
    } else {
      startScreenShare();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="font-body text-red-500 text-lg">Lỗi: {error}</span>
        <button onClick={onBack} className="px-4 py-2 bg-charcoal text-white rounded hover:bg-stone/20">Quay lại</button>
      </div>
    );
  }

  if (isLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-8 h-8 border-4 border-t-vermilion border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <span className="font-body text-stone">Đang khởi tạo phỏng vấn... (kết nối với Arya và tải đề bài)</span>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="font-body text-stone">Không tìm thấy bài toán nào trong buổi phỏng vấn.</span>
        <button onClick={onBack} className="px-4 py-2 bg-charcoal text-white rounded hover:bg-stone/20">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="ie-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ie-header shrink-0">
        <div className="ie-header-left">
          <span className="ie-header-icon">{"</>"}</span>
          <span className="ie-header-title">ARYA's mock interview</span>
        </div>
        <div className="ie-header-nav">
          <button className="ie-pill-btn">Problem {problemIndex + 1}/{problems.length}</button>
          <button className="ie-icon-btn" onClick={handlePrevProblem} disabled={problemIndex === 0} title="Bài trước">‹</button>
          <button className="ie-icon-btn" onClick={handleNextProblem} disabled={problemIndex === problems.length - 1} title="Bài tiếp theo">›</button>
        </div>
        <div className="ie-header-right">
          <button className="ie-share-btn" onClick={toggleScreenShare} disabled={mediaStatus === "starting"}>
            {mediaSource === "screen" && mediaStatus === "active" ? "Stop sharing" : mediaStatus === "starting" ? "Đang xử lý…" : "Share screen"}
          </button>
          <button className="ie-icon-btn" onClick={onBack} title="Thoát phỏng vấn">✕</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 p-4 bg-[#0a0a0a]">
        {/* Left Column: Camera + Problem Description */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="h-[250px] shrink-0 bg-ink border border-charcoal shadow-lg rounded-xl overflow-hidden relative">
            {mediaStatus === "active" && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 animate-pulse">● LIVE</span>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                display: mediaStatus === "active" ? "block" : "none",
                width: "100%",
                height: "100%",
                objectFit: mediaSource === "screen" ? "contain" : "cover",
                background: mediaSource === "screen" ? "#000" : undefined,
              }}
            />
            {mediaStatus !== "active" && (
              <div className="flex flex-col gap-2 items-center justify-center h-full w-full text-stone text-sm">
                {mediaStatus === "starting" && <span>Đang khởi động…</span>}
                {mediaStatus === "idle" && (
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-washi border border-charcoal rounded hover:bg-stone/10 transition" onClick={startCamera}>Bật camera</button>
                    <button className="px-4 py-2 bg-washi border border-charcoal rounded hover:bg-stone/10 transition" onClick={startScreenShare}>Chia sẻ màn hình</button>
                  </div>
                )}
                {mediaStatus === "error" && (
                  <div className="flex flex-col gap-2 items-center">
                    <span className="text-red-400">{mediaError ?? "Lỗi camera."}</span>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-washi border border-charcoal rounded hover:bg-stone/10 transition" onClick={startCamera}>Thử bật camera</button>
                      <button className="px-4 py-2 bg-washi border border-charcoal rounded hover:bg-stone/10 transition" onClick={startScreenShare}>Thử chia sẻ màn hình</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {mediaStatus === "active" && (
              <button
                className="absolute bottom-2 right-2 bg-charcoal/50 hover:bg-charcoal text-white rounded-full p-2 z-10 transition-colors"
                onClick={stopMedia}
                title={mediaSource === "screen" ? "Dừng chia sẻ màn hình" : "Tắt camera"}
              >
                ⏻
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto bg-washi border border-charcoal shadow-lg rounded-xl flex flex-col min-h-0">
            <ProblemDescription problem={problem} />
          </div>
        </div>

        {/* Right Column: Code Editor + Console */}
        <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
          <div className="flex-1 bg-ink border border-charcoal shadow-lg min-h-0 rounded-xl overflow-hidden">
            <CodeEditorPane
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={(lang) => setLanguage(lang as any)}
            />
          </div>
          <div className="h-[280px] bg-washi border border-charcoal shadow-lg shrink-0 rounded-xl overflow-hidden">
            <ConsolePane
              problem={problem}
              code={code}
              language={language}
              onSubmit={handleSubmitCode}
              isSubmitting={isSubmitting || isLoading}
              verdict={verdict}
              verdictDetails={{ submissionId }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewEditorView;