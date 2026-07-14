import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useReport } from "../hooks/useReport";
import { AttachmentUpload } from "./AttachmentUpload";

const ISSUE_TYPE_OPTIONS = [
  "Lỗi hiển thị",
  "Lỗi chấm bài",
  "Lỗi tài khoản",
  "Góp ý tính năng",
  "Khác",
];

export const ReportForm: React.FC = () => {
  const {
    issueType,
    setIssueType,
    relatedUrl,
    setRelatedUrl,
    description,
    setDescription,
    setAttachments,
    showIssueOptions,
    setShowIssueOptions,
    isSubmitting,
    handleCancel,
    handleSubmit,
  } = useReport();

  return (
    <form className="bg-washi border border-charcoal p-8 rounded-xl flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* 1. Ô Issue Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone uppercase tracking-wide">Issue type</label>
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-ink border border-charcoal rounded-xl px-4 py-3 text-linen focus:outline-none focus:border-vermilion transition-colors"
            placeholder="Chọn hoặc nhập loại lỗi bạn gặp phải..."
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            onFocus={() => setShowIssueOptions(true)}
            onBlur={() => setTimeout(() => setShowIssueOptions(false), 150)}
          />
          <button type="button" className="absolute right-3 text-stone hover:text-vermilion" aria-label="Send">
            <FaPaperPlane />
          </button>

          {showIssueOptions && (
            <ul className="absolute top-full left-0 right-0 mt-2 bg-washi border border-charcoal rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {ISSUE_TYPE_OPTIONS.filter((opt) =>
                opt.toLowerCase().includes(issueType.toLowerCase())
              ).map((opt) => (
                <li
                  key={opt}
                  onMouseDown={() => setIssueType(opt)}
                  className="px-4 py-2 hover:bg-ink cursor-pointer text-linen"
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-stone mt-1">
          <HiOutlineUserCircle />
          <span>Hint</span>
        </div>
      </div>

      {/* 2. Ô Related Problem URL */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone uppercase tracking-wide">Related problem URL</label>
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-ink border border-charcoal rounded-xl px-4 py-3 text-linen focus:outline-none focus:border-vermilion transition-colors"
            placeholder="Dán đường dẫn (URL) của bài tập hoặc trang bị lỗi vào đây..."
            value={relatedUrl}
            onChange={(e) => setRelatedUrl(e.target.value)}
          />
          <button type="button" className="absolute right-3 text-stone hover:text-vermilion" aria-label="Send">
            <FaPaperPlane />
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone mt-1">
          <HiOutlineUserCircle />
          <span>Hint</span>
        </div>
      </div>

      {/* 3. Ô Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-stone uppercase tracking-wide">Description</label>
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-ink border border-charcoal rounded-xl px-4 py-3 text-linen focus:outline-none focus:border-vermilion transition-colors"
            placeholder="Mô tả chi tiết các bước xảy ra lỗi hoặc mong muốn của bạn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="button" className="absolute right-3 text-stone hover:text-vermilion" aria-label="Send">
            <FaPaperPlane />
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone mt-1">
          <HiOutlineUserCircle />
          <span>Hint</span>
        </div>
      </div>

      <AttachmentUpload onChange={(files) => setAttachments(files)} />

      <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-charcoal">
        <button type="button" className="px-6 py-2 rounded-xl text-stone hover:bg-ink transition-colors" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="px-6 py-2 rounded-xl bg-vermilion text-white hover:bg-vermilion-hover transition-colors font-semibold" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};