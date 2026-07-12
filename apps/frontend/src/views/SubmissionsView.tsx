import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Eye, Sparkles } from 'lucide-react';
import { PageHeader, StatusBadge, Pagination as UiPagination } from '@ocj/ui';
import { Spin } from 'antd';

export const SubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.getSubmissions().then(res => {
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
        // Sort by newest first
        const sorted = list.sort((a: any, b: any) => 
          new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
        );
        setSubmissions(sorted);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return submissions.slice(startIndex, startIndex + pageSize);
  }, [submissions, currentPage]);

  const handleViewDetail = async (sub: any) => {
    setSelectedSub(sub);
    setAiFeedback(null);
    try {
      const res = await api.getSubmissionDetail(sub.id || sub._id);
      if (res.success && res.data) {
        setSelectedSub(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestAiFeedback = async () => {
    if (!selectedSub) return;
    setLoadingAi(true);
    setAiFeedback(null);
    try {
      const res = await api.getAIFeedback(selectedSub.id || selectedSub._id);
      if (res.success && res.data) {
        setAiFeedback(res.data.feedback || res.data);
      } else {
        setAiFeedback('AI could not generate feedback at this time. Please try again.');
      }
    } catch (err: any) {
      setAiFeedback(`Error generating feedback: ${err.message || 'Server error'}`);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="!space-y-6">
      <PageHeader
        title="Submission History"
        subtitle="Review your past submissions and track your progress over time."
      />

      {loading ? (
        <div className="!flex !justify-center !py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="!bg-washi !rounded-2xl !border !border-charcoal !overflow-hidden">
          <div className="!overflow-x-auto">
            <table className="!w-full !text-left !border-collapse">
              <thead>
                <tr className="!border-b !border-charcoal !bg-ink/50">
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">ID</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">Problem</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">Language</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">Result</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">Time</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider">Date</th>
                  <th className="!py-4 !px-6 !text-[11px] !font-bold !text-stone !uppercase !tracking-wider !text-center">Action</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-charcoal">
                {paginatedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="!py-12 !text-center !text-stone">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  paginatedSubmissions.map(sub => (
                    <tr key={sub.id || sub._id} className="hover:!bg-ink/30 !transition-colors !duration-200">
                      <td className="!py-4 !px-6 !text-[13px] !font-mono !text-stone">
                        {String(sub.id || sub._id).slice(-6)}
                      </td>
                      <td className="!py-4 !px-6 !text-[14px] !font-semibold !text-linen">
                        {sub.problemId?.title || sub.problem?.title || sub.problemId}
                      </td>
                      <td className="!py-4 !px-6 !text-[13px] !font-mono !text-stone">
                        {sub.language}
                      </td>
                      <td className="!py-4 !px-6">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="!py-4 !px-6 !text-[13px] !text-stone">
                        {sub.executionTime ? `${sub.executionTime}ms` : 'N/A'}
                      </td>
                      <td className="!py-4 !px-6 !text-[13px] !text-stone">
                        {new Date(sub.createdAt || sub.created_at).toLocaleString()}
                      </td>
                      <td className="!py-4 !px-6 !text-center">
                        <button
                          onClick={() => handleViewDetail(sub)}
                          className="!inline-flex !items-center !justify-center !w-8 !h-8 !rounded-lg !bg-charcoal hover:!bg-stone/20 !text-linen !transition-colors !border !border-transparent hover:!border-stone/30"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {submissions.length > 0 && (
            <div className="!px-6 !py-4 !border-t !border-charcoal !flex !justify-end bg-washi">
              <UiPagination
                currentPage={currentPage}
                totalItems={submissions.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {selectedSub && (
        <div className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !bg-ink/80 !backdrop-blur-sm !p-4">
          <div className="!bg-washi !rounded-2xl !border !border-charcoal !w-full !max-w-3xl !shadow-2xl !max-h-[90vh] !flex !flex-col animate-fade-in-up">
            <div className="!px-6 !py-5 !border-b !border-charcoal !flex !items-center !justify-between !bg-ink/30 !rounded-t-2xl">
              <h3 className="!text-lg !font-semibold !text-linen !font-display">
                Submission #{String(selectedSub.id || selectedSub._id).slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedSub(null)}
                className="!text-stone hover:!text-linen !transition-colors !p-1"
              >
                &times;
              </button>
            </div>
            
            <div className="!p-6 !overflow-y-auto !flex-1 !space-y-6">
              <div className="!grid !grid-cols-2 sm:!grid-cols-4 !gap-4 !p-4 !bg-ink !rounded-xl !border !border-charcoal">
                <div>
                  <div className="!text-[11px] !text-stone !uppercase !font-bold !mb-1">Problem</div>
                  <div className="!text-sm !text-linen !font-semibold">
                    {selectedSub.problemId?.title || selectedSub.problem?.title || selectedSub.problemId}
                  </div>
                </div>
                <div>
                  <div className="!text-[11px] !text-stone !uppercase !font-bold !mb-1">Result</div>
                  <div><StatusBadge status={selectedSub.status} /></div>
                </div>
                <div>
                  <div className="!text-[11px] !text-stone !uppercase !font-bold !mb-1">Language</div>
                  <div className="!text-sm !text-linen !font-mono">{selectedSub.language}</div>
                </div>
                <div>
                  <div className="!text-[11px] !text-stone !uppercase !font-bold !mb-1">Difficulty</div>
                  <div className="!text-sm !text-stone">
                    {selectedSub.problemId?.difficulty || selectedSub.problem?.difficulty || 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="!text-sm !font-bold !text-stone !mb-3 !uppercase !tracking-wider">Source Code</h4>
                <pre className="!bg-ink !p-4 !rounded-xl !border !border-charcoal !text-sm !text-linen !font-mono !overflow-x-auto">
                  <code>{selectedSub.code}</code>
                </pre>
              </div>

              <div className="!pt-4 !border-t !border-charcoal">
                <button
                  disabled={loadingAi}
                  onClick={handleRequestAiFeedback}
                  className="!flex !items-center !justify-center !gap-2 !w-full !py-3 !rounded-xl !bg-charcoal hover:!bg-stone/20 !text-linen !font-semibold !transition-all disabled:!opacity-50 disabled:!cursor-not-allowed !border !border-charcoal"
                >
                  <Sparkles size={16} className={loadingAi ? "!animate-pulse" : ""} />
                  {loadingAi ? 'AI is analyzing...' : 'Get AI Feedback (Mock Interview)'}
                </button>

                {aiFeedback && (
                  <div className="!mt-4 !p-5 !bg-ink !rounded-xl !border !border-vermilion/30 !animate-fade-in-up">
                    <h5 className="!flex !items-center !gap-2 !text-vermilion !font-bold !mb-3">
                      <Sparkles size={14} /> AI Feedback
                    </h5>
                    <p className="!text-sm !text-linen !leading-relaxed !whitespace-pre-wrap">{aiFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsView;
