import React, { FormEvent, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaLayerGroup,
  FaPlus,
  FaRegClock,
  FaRobot,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useCustomRoadmaps, CustomRoadmap } from "../hooks/useCustomRoadmaps";
import { generateRoadmap } from "../api/roadmapApi";
import { mockSavedRoadmaps } from "../data/roadmapMock";
import type {
  RoadmapRequest,
  RoadmapSkillLevel,
  SavedRoadmap,
} from "../types/roadmap.types";

type RoadmapViewMode = "list" | "calendar";
type DailyStatus = "completed" | "pending" | "overdue";

interface DayPlan {
  date: Date;
  label: string;
  sessionLabel: string;
  problems: string[];
  status: DailyStatus;
}

const STORAGE_KEY = "queu.aiRoadmaps";
const DAY_MS = 24 * 60 * 60 * 1000;

const skillOptions: { value: RoadmapSkillLevel; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

const difficultyLabels = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadSavedRoadmaps(): SavedRoadmap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockSavedRoadmaps;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : mockSavedRoadmaps;
  } catch {
    return mockSavedRoadmaps;
  }
}

function saveRoadmaps(roadmaps: SavedRoadmap[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
}

function distributeProblems(roadmap: SavedRoadmap): DayPlan[] {
  const allProblems = roadmap.nodes.flatMap((node) => node.recommendedProblems);
  const totalWeeks = Math.max(
    1,
    roadmap.nodes.reduce((sum, node) => sum + Math.max(1, node.estimatedWeeks), 0)
  );
  const totalDays = Math.max(1, totalWeeks * 7);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, index) => {
    const baseCount = Math.floor(allProblems.length / totalDays);
    const extraDays = allProblems.length % totalDays;
    const start = index * baseCount + Math.min(index, extraDays);
    const count = baseCount + (index < extraDays ? 1 : 0);
    const end = start + count;
    const date = new Date(roadmap.createdAt + index * DAY_MS);
    date.setHours(0, 0, 0, 0);
    const problems = allProblems.slice(start, end);
    const completedCount = problems.filter((problem) =>
      roadmap.completedProblemIds.includes(problem)
    ).length;
    const status: DailyStatus =
      problems.length > 0 && completedCount === problems.length
        ? "completed"
        : date.getTime() < today.getTime()
        ? "overdue"
        : "pending";

    return {
      date,
      label: date.toLocaleDateString("vi-VN", { weekday: "short" }),
      sessionLabel: `Buổi ${index + 1}`,
      problems,
      status,
    };
  });
}

function getProgress(roadmap: SavedRoadmap) {
  const totalProblems = roadmap.nodes.reduce(
    (sum, node) => sum + node.recommendedProblems.length,
    0
  );
  const completed = roadmap.completedProblemIds.length;
  const totalWeeks = roadmap.nodes.reduce(
    (sum, node) => sum + Math.max(1, node.estimatedWeeks),
    0
  );
  const endDate = roadmap.createdAt + Math.max(1, totalWeeks) * 7 * DAY_MS;
  const daysLeft = Math.max(0, Math.ceil((endDate - Date.now()) / DAY_MS));

  return {
    totalProblems,
    completed,
    remaining: Math.max(0, totalProblems - completed),
    daysLeft,
    percent: totalProblems === 0 ? 0 : Math.round((completed / totalProblems) * 100),
  };
}

const RoadmapPage: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<SavedRoadmap[]>(loadSavedRoadmaps);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(
    roadmaps[0]?.id ?? null
  );
  const [viewMode, setViewMode] = useState<RoadmapViewMode>("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<RoadmapRequest, 'goals'>>({
    skillLevel: "BEGINNER",
    focusArea: "",
  });

  const { roadmaps: customRoadmaps, deleteRoadmap } = useCustomRoadmaps();
  const [selectedCustomRoadmap, setSelectedCustomRoadmap] = useState<CustomRoadmap | null>(null);

  const activeRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === activeRoadmapId) ?? roadmaps[0] ?? null,
    [activeRoadmapId, roadmaps]
  );

  const dayPlans = useMemo(
    () => (activeRoadmap ? distributeProblems(activeRoadmap) : []),
    [activeRoadmap]
  );

  const progress = useMemo(
    () =>
      activeRoadmap
        ? getProgress(activeRoadmap)
        : { totalProblems: 0, completed: 0, remaining: 0, daysLeft: 0, percent: 0 },
    [activeRoadmap]
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.skillLevel) {
      setError("Vui lòng chọn trình độ hiện tại.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RoadmapRequest = {
        skillLevel: form.skillLevel,
        focusArea: form.focusArea?.trim() || undefined,
      };
      const response = await generateRoadmap(payload);
      const savedRoadmap: SavedRoadmap = {
        ...response.data,
        id: createId("roadmap"),
        createdAt: Date.now(),
        skillLevel: payload.skillLevel,
        focusArea: form.focusArea || "",
        goals: "",
        completedProblemIds: [],
      };
      const nextRoadmaps = [savedRoadmap, ...roadmaps];

      setRoadmaps(nextRoadmaps);
      saveRoadmaps(nextRoadmaps);
      setActiveRoadmapId(savedRoadmap.id);
      setViewMode("calendar");
      setIsModalOpen(false);
      setForm({ skillLevel: "BEGINNER", focusArea: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo roadmap.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCalendar = (roadmapId: string) => {
    setActiveRoadmapId(roadmapId);
    setViewMode("calendar");
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-toolbar">
        <div className="roadmap-actions">
          <button className="roadmap-icon-btn" type="button" aria-label="Search roadmap">
            <FaSearch />
          </button>
          <div className="roadmap-view-toggle" aria-label="Roadmap view">
            <button
              className={viewMode === "calendar" ? "active" : ""}
              type="button"
              onClick={() => setViewMode("calendar")}
              disabled={!activeRoadmap}
              aria-label="Calendar view"
            >
              <FaCalendarAlt />
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <FaLayerGroup />
            </button>
          </div>
          <button className="roadmap-create-btn" type="button" onClick={() => setIsModalOpen(true)}>
            <FaPlus />
            Tạo mới
          </button>
        </div>
      </div>

      {viewMode === "list" || !activeRoadmap ? (
        <section className="roadmap-list-section">
          <h1 className="roadmap-section-title">Roadmap đã được tạo</h1>
          <div className="roadmap-grid">
            {roadmaps.map((roadmap) => {
              const itemProgress = getProgress(roadmap);
              return (
                <button
                  className="roadmap-card"
                  type="button"
                  key={roadmap.id}
                  onClick={() => openCalendar(roadmap.id)}
                >
                  <FaRobot className="roadmap-card-icon" />
                  <strong>{roadmap.title}</strong>
                  <span>{roadmap.description}</span>
                  <small>{itemProgress.percent}% Complete</small>
                </button>
              );
            })}
          </div>

          {roadmaps.length === 0 && (
            <div className="roadmap-empty">
              <FaRobot />
              <h2>Chưa có roadmap nào</h2>
              <p>Tạo roadmap DSA cá nhân hóa đầu tiên từ trình độ và mục tiêu của bạn.</p>
              <button className="roadmap-create-btn" type="button" onClick={() => setIsModalOpen(true)}>
                <FaPlus />
                Tạo mới
              </button>
            </div>
          )}

          <h2 className="roadmap-section-title mt-8 border-t border-charcoal pt-6">Roadmap tùy chỉnh từ Chat</h2>
          <div className="roadmap-grid">
            {customRoadmaps.map((rm) => (
              <button
                key={rm.id}
                className="roadmap-card relative group"
                type="button"
                onClick={() => setSelectedCustomRoadmap(rm)}
              >
                <FaLayerGroup className="roadmap-card-icon text-vermilion" />
                <strong className="line-clamp-2">{rm.title}</strong>
                <span>Tạo từ Chat Assistant</span>
                <small>{new Date(rm.createdAt).toLocaleDateString('vi-VN')}</small>
                
                <div 
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-stone hover:text-red-500 transition-opacity p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoadmap(rm.id);
                  }}
                  title="Xóa roadmap"
                >
                  <FaTrash size={14} />
                </div>
              </button>
            ))}
          </div>
          {customRoadmaps.length === 0 && (
            <div className="roadmap-empty mt-4 py-8 bg-ink border border-charcoal rounded-lg">
              <FaLayerGroup className="text-stone opacity-50 mb-2" size={24} />
              <p className="text-sm text-stone italic">Chưa có roadmap tùy chỉnh nào được lưu từ Chat.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="roadmap-calendar-layout">
          <div className="roadmap-calendar-card">
            <div className="roadmap-calendar-head">
              <button className="roadmap-today-btn" type="button">
                Hôm nay
              </button>
              <h1>{activeRoadmap.title}</h1>
            </div>
            <p className="roadmap-calendar-desc">{activeRoadmap.description}</p>

            <div className="roadmap-node-strip">
              {activeRoadmap.nodes.map((node) => (
                <article className="roadmap-node-pill" key={node.id}>
                  <span className={`roadmap-difficulty roadmap-difficulty--${node.difficulty.toLowerCase()}`}>
                    {difficultyLabels[node.difficulty]}
                  </span>
                  <strong>{node.title}</strong>
                  <small>{node.estimatedWeeks} tuần</small>
                </article>
              ))}
            </div>

            <div className="roadmap-week-grid">
              {dayPlans.slice(0, 21).map((day, index) => (
                <article className="roadmap-day" key={`${day.date.toISOString()}-${index}`}>
                  <div className="roadmap-day-head">
                    <span>{day.label}</span>
                    <strong>{day.date.getDate()}</strong>
                  </div>
                  <div className={`roadmap-session roadmap-session--${day.status}`}>
                    {day.sessionLabel}
                  </div>
                  {day.problems.length > 0 ? (
                    <div className={`roadmap-problem-count roadmap-problem-count--${day.status}`}>
                      <strong>{day.problems.length}</strong>
                      <span>Bài</span>
                    </div>
                  ) : (
                    <div className="roadmap-rest-day">Nghỉ</div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <aside className="roadmap-progress-card">
            <h2>Tiến độ</h2>
            <div className="roadmap-progress-row">
              <span>Số ngày còn lại</span>
              <strong>{progress.daysLeft} ngày</strong>
            </div>
            <div className="roadmap-progress-row">
              <span>Số bài tập còn lại</span>
              <strong>{progress.remaining} bài tập</strong>
            </div>
            <div className="roadmap-progress-track">
              <span style={{ width: `${progress.percent}%` }} />
            </div>
            <div className="roadmap-legend">
              <span className="roadmap-dot roadmap-dot--green" />
              Số bài tập hoàn thành
            </div>
            <div className="roadmap-legend">
              <span className="roadmap-dot roadmap-dot--blue" />
              Số bài tập theo kế hoạch
            </div>
            <button className="roadmap-secondary-btn" type="button" onClick={() => setViewMode("list")}>
              Quay lại danh sách
            </button>
          </aside>
        </section>
      )}

      {isModalOpen && (
        <div className="roadmap-modal-backdrop" role="presentation">
          <div className="roadmap-modal" role="dialog" aria-modal="true" aria-labelledby="roadmap-modal-title">
            <div className="roadmap-modal-head">
              <div>
                <h2 id="roadmap-modal-title">Tạo roadmap DSA</h2>
                <p>AI sẽ tạo kế hoạch học dựa trên trình độ, chủ đề và mục tiêu của bạn.</p>
              </div>
              <button
                className="roadmap-icon-btn"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close form"
              >
                <FaTimes />
              </button>
            </div>

            <form className="roadmap-form" onSubmit={handleCreate}>
              <label className="roadmap-field">
                <span>Cấp độ</span>
                <select
                  value={form.skillLevel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      skillLevel: event.target.value as RoadmapSkillLevel,
                    }))
                  }
                >
                  {skillOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="roadmap-field">
                <span>Trọng tâm học tập</span>
                <input
                  value={form.focusArea}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, focusArea: event.target.value }))
                  }
                  placeholder="Ví dụ: Recursion, DP, Trees"
                />
              </label>



              {error && <div className="roadmap-form-error">{error}</div>}

              <div className="roadmap-form-actions">
                <button
                  className="roadmap-secondary-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button className="roadmap-create-btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="roadmap-mini-spinner" />
                      Đang tạo
                    </>
                  ) : (
                    <>
                      <FaRegClock />
                      Tạo roadmap
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Roadmap Modal */}
      {selectedCustomRoadmap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 lg:p-8">
          <div className="bg-ink border border-charcoal w-full max-w-4xl max-h-full flex flex-col shadow-2xl rounded-xl overflow-hidden">
            <div className="p-4 border-b border-charcoal bg-washi flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-linen">{selectedCustomRoadmap.title}</h2>
              <button 
                onClick={() => setSelectedCustomRoadmap(null)}
                className="text-stone hover:text-vermilion p-2 transition-colors"
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-ink text-linen markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {selectedCustomRoadmap.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
