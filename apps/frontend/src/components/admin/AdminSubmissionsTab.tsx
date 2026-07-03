import React, { useEffect, useState } from 'react';
import { Play, Eye, FileCode, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import type { ISubmission, IProblem } from '@ocj/types';

export const AdminSubmissionsTab: React.FC = () => {
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ISubmission | null>(null);
  
  // Custom Run Code Simulator state
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [testCode, setTestCode] = useState('');
  const [testLanguage, setTestLanguage] = useState<'cpp' | 'java' | 'python'>('cpp');
  const [customInput, setCustomInput] = useState('');
  const [runResult, setRunResult] = useState<any>(null);
  const [runLoading, setRunLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getSubmissions();
      if (res.success && res.data) {
        setSubmissions(res.data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await api.getProblems();
      const items = Array.isArray(res.data) ? res.data : (res.data.items || []);
      setProblems(items);
      if (items.length > 0) setSelectedProblemId(items[0].id || items[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchProblems();
  }, []);

  const handleInspect = async (subId: string) => {
    try {
      const res = await api.getSubmissionDetail(subId);
      if (res.success) {
        setSelectedSub(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lấy thông tin chi tiết');
    }
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await api.runCode({
        problemId: selectedProblemId,
        language: testLanguage,
        code: testCode,
        customInput: customInput || undefined
      });
      if (res.success) {
        setRunResult(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi biên dịch / thực thi');
    } finally {
      setRunLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '#10b981';
      case 'WRONG_ANSWER': return '#ef4444';
      case 'COMPILE_ERROR': return '#f59e0b';
      case 'PENDING': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div className="problems-tab-grid">
      {/* Left side: Submissions List */}
      <div className="prob-admin-card" style={{ flex: 1 }}>
        <h3>Danh Sách Lượt Nộp Bài</h3>
        <div className="prob-list-scroll" style={{ maxHeight: '680px' }}>
          {loading ? (
            <p>Đang tải danh sách bài nộp...</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: '#64748b' }}>Chưa có lượt nộp bài nào trên hệ thống.</p>
          ) : (
            submissions.map((sub, idx) => {
              const subId = sub.id || sub._id;
              return (
                <div key={subId || idx} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title">
                      ID: {subId?.slice(-8)} (Bài: {typeof sub.problemId === 'string' ? sub.problemId.slice(-6) : 'Đang tải'})
                    </span>
                    <div className="prob-item-meta">
                      <span className="diff-pill" style={{ background: 'rgba(255,255,255,0.03)', color: getStatusColor(sub.status) }}>
                        {sub.status}
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        {sub.language?.toUpperCase()}
                      </span>
                      <span className="prob-tag-pill" style={{ fontSize: '0.7rem' }}>
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => handleInspect(subId!)} className="btn-action-icon edit" title="Xem chi tiết & Code">
                    <Eye size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Detailed View or Runner Tool */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {selectedSub && (
          <div className="prob-admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <h3 style={{ borderBottom: 'none', paddingBottom: 0 }}>Lượt Nộp: {selectedSub.id?.slice(-8)}</h3>
              <button onClick={() => setSelectedSub(null)} className="btn-action-icon delete">
                <AlertTriangle size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div><strong>Trạng thái:</strong> <span style={{ color: getStatusColor(selectedSub.status), fontWeight: 700 }}>{selectedSub.status}</span></div>
              <div><strong>Ngôn ngữ:</strong> {selectedSub.language}</div>
              <div><strong>Testcases passed:</strong> {selectedSub.testCasesPassed} / {selectedSub.testCasesTotal}</div>
              
              <div className="prob-form-group">
                <label><FileCode size={14} /> Mã nguồn đã nộp</label>
                <textarea
                  value={selectedSub.code}
                  readOnly
                  className="prob-admin-textarea"
                  style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.8rem', background: '#090d16' }}
                  rows={8}
                />
              </div>

              {selectedSub.errorMessage && (
                <div className="prob-form-group">
                  <label>Thông báo lỗi (Compilation/Runtime Error)</label>
                  <pre style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'pre-wrap' }}>
                    {selectedSub.errorMessage}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom run code simulator panel */}
        <div className="prob-admin-card">
          <h3>Trình Thử Nghiệm Chấm Bài (Run Code Sandbox)</h3>
          <form onSubmit={handleRunTest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="prob-form-group">
              <label>Chọn Bài Tập</label>
              <select
                value={selectedProblemId}
                onChange={e => setSelectedProblemId(e.target.value)}
                className="prob-admin-select"
              >
                {problems.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="prob-form-grid-3" style={{ gridTemplateColumns: '1fr' }}>
              <div className="prob-form-group">
                <label>Ngôn ngữ</label>
                <select
                  value={testLanguage}
                  onChange={e => setTestLanguage(e.target.value as any)}
                  className="prob-admin-select"
                >
                  <option value="cpp">C++ (g++)</option>
                  <option value="java">Java (JDK)</option>
                  <option value="python">Python 3</option>
                </select>
              </div>
            </div>

            <div className="prob-form-group">
              <label><FileCode size={14} /> Mã nguồn thử nghiệm</label>
              <textarea
                placeholder="Nhập code tại đây..."
                value={testCode}
                onChange={e => setTestCode(e.target.value)}
                className="prob-admin-textarea"
                style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.8rem' }}
                rows={6}
                required
              />
            </div>

            <div className="prob-form-group">
              <label>Dữ liệu đầu vào tùy chỉnh (Custom Input - Tùy chọn)</label>
              <textarea
                placeholder="Dòng 1\nDòng 2"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                className="prob-admin-textarea"
                style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.8rem' }}
                rows={2}
              />
            </div>

            <button type="submit" className="btn-prob-primary" disabled={runLoading}>
              <Play size={14} /> {runLoading ? 'Đang chấm...' : 'Thử Nghiệm Chấm Bài'}
            </button>
          </form>

          {runResult && (
            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '8px' }}>Kết quả thử nghiệm:</h4>
              {runResult.map((res: any, index: number) => (
                <div key={index} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '10px', marginBottom: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: res.status?.id === 3 ? '#34d399' : '#f87171' }}>
                      Testcase #{index + 1}: {res.status?.description || 'Done'}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      {res.time}s | {res.memory} KB
                    </span>
                  </div>
                  {res.error ? (
                    <pre style={{ color: '#f87171', margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>{res.error}</pre>
                  ) : (
                    <>
                      <div>Input: <code style={{ color: '#cbd5e1' }}>{res.input}</code></div>
                      <div>Output thực tế: <code style={{ color: '#60a5fa' }}>{res.actualOutput}</code></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
