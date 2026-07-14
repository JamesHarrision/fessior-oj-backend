import React from "react";
import { useInterview } from "../hooks/useInterview";
import InterviewLanding from "../components/InterviewLanding";
import InterviewEditorView from "../components/Intervieweditorview";

const InterviewPage: React.FC = () => {
  const {
    phase,
    session,
    report,
    isLoading,
    error,
    goToSetup,
    submitAnswer,
    resetInterview,
  } = useInterview();

  if (phase === "landing") {
    return (
      <InterviewLanding
        onStartNow={goToSetup}
        onChatWithArya={() => {
          window.location.href = "/chat";
        }}
      />
    );
  }

  if (phase === "setup" || phase === "session") {
    return (
      <InterviewEditorView
        session={session!}
        onSubmitAnswer={submitAnswer}
        isLoading={isLoading}
        error={error}
        onBack={resetInterview}
      />
    );
  }

  if (phase === "generating-report") {
    return (
      <div className="interview-loading-screen">
        <div className="interview-spinner" />
        <div className="interview-loading-title">Đang phân tích buổi phỏng vấn...</div>
        <div className="interview-loading-sub">
          Arya đang đọc lại toàn bộ câu trả lời và tạo báo cáo chi tiết.
        </div>
      </div>
    );
  }

  if (phase === "report" && report) {
    return (
      <div className="interview-loading-screen">
        <div className="interview-loading-title">Phỏng vấn hoàn tất!</div>
        <div className="interview-loading-sub">Điểm: {report.totalScore} / 100</div>
        <button onClick={resetInterview} style={{ marginTop: 24, padding: "10px 24px", borderRadius: 8, cursor: "pointer" }}>
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return null;
};

export default InterviewPage;