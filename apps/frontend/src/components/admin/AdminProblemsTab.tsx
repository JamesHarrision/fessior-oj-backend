import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, FileText, Code, CheckSquare, Trash2, Tag, Watch, HardDrive } from 'lucide-react';
import { api } from '../../services/api';
import type { IProblem } from '@ocj/types';
import './AdminProblemsTab.css';

interface AdminProblemsTabProps {
  probTitle: string;
  setProbTitle: (val: string) => void;
  probDesc: string;
  setProbDesc: (val: string) => void;
  probDiff: 'EASY' | 'MEDIUM' | 'HARD';
  setProbDiff: (val: 'EASY' | 'MEDIUM' | 'HARD') => void;
  onSubmit: (e: React.FormEvent) => void;
  problems: IProblem[];
  onDelete: (id: string) => void;
}

export const AdminProblemsTab: React.FC<AdminProblemsTabProps> = ({
  probTitle,
  setProbTitle,
  probDesc,
  setProbDesc,
  probDiff,
  setProbDiff,
  onSubmit,
  problems,
  onDelete,
}) => {
  // Tags state
  const [tags, setTags] = useState<any[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [tagError, setTagError] = useState('');

  // Editing Problem state
  const [editingProblem, setEditingProblem] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'info' | 'code' | 'testcases'>('info');

  // Edit fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDiff, setEditDiff] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [editTimeLimit, setEditTimeLimit] = useState(2000);
  const [editMemoryLimit, setEditMemoryLimit] = useState(256);
  const [editCppCode, setEditCppCode] = useState('');
  const [editJavaCode, setEditJavaCode] = useState('');
  const [editPythonCode, setEditPythonCode] = useState('');
  const [editSelectedTags, setEditSelectedTags] = useState<string[]>([]);
  
  // Testcases management state
  const [testcases, setTestcases] = useState<any[]>([]);
  const [tcLoading, setTcLoading] = useState(false);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcIsExample, setNewTcIsExample] = useState(false);
  const [tcError, setTcError] = useState('');
  const [tcSuccess, setTcSuccess] = useState('');

  const fetchTags = async () => {
    try {
      const res = await api.getProblemTags();
      if (res.success && res.data) {
        setTags(res.data);
      }
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError('');
    if (!newTagName.trim()) return;

    try {
      const res = await api.createTag({ name: newTagName.trim() });
      if (res.success) {
        setNewTagName('');
        fetchTags();
      }
    } catch (err: any) {
      setTagError(err.message || 'Lỗi khi tạo tag.');
    }
  };

  const openEditModal = async (problem: any) => {
    setEditingProblem(problem);
    setModalTab('info');
    setEditTitle(problem.title || '');
    setEditDesc(problem.description || '');
    setEditDiff(problem.difficulty || 'EASY');
    setEditTimeLimit(problem.timeLimit || 2000);
    setEditMemoryLimit(problem.memoryLimit || 256);
    
    const codes = problem.starterCodes || {};
    setEditCppCode(codes.cpp || '');
    setEditJavaCode(codes.java || '');
    setEditPythonCode(codes.python || '');

    const selectedIds = problem.tags ? problem.tags.map((t: any) => t.id || t._id || t) : [];
    setEditSelectedTags(selectedIds);
    setTestcases([]);
    setTcError('');
    setTcSuccess('');

    // Fetch testcases for this problem
    const probId = problem.id || problem.mongo_problem_id || problem._id;
    if (probId) {
      setTcLoading(true);
      try {
        const tcRes = await api.getTestcases(probId);
        if (tcRes.success && tcRes.data) {
          setTestcases(tcRes.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải testcases:', err);
      } finally {
        setTcLoading(false);
      }
    }
  };

  const handleSaveProblemEdit = async () => {
    if (!editingProblem) return;
    const probId = editingProblem.id || editingProblem.mongo_problem_id || editingProblem._id;
    if (!probId) return;

    try {
      const res = await api.updateProblem(probId, {
        title: editTitle,
        description: editDesc,
        difficulty: editDiff,
        timeLimit: Number(editTimeLimit),
        memoryLimit: Number(editMemoryLimit),
        starterCodes: {
          cpp: editCppCode,
          java: editJavaCode,
          python: editPythonCode,
        },
        tags: editSelectedTags,
      });

      if (res.success) {
        alert('Cập nhật bài tập thành công!');
        setEditingProblem(null);
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu thông tin bài tập');
    }
  };

  const handleAddTestcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setTcError('');
    setTcSuccess('');
    const probId = editingProblem?.id || editingProblem?.mongo_problem_id || editingProblem?._id;
    if (!probId) return;

    try {
      const res = await api.addTestcase(probId, {
        input: newTcInput,
        output: newTcOutput,
        isExample: newTcIsExample,
      });
      if (res.success) {
        setNewTcInput('');
        setNewTcOutput('');
        setNewTcIsExample(false);
        setTcSuccess('Đã thêm testcase mới!');
        
        // Reload testcases list
        const tcRes = await api.getTestcases(probId);
        if (tcRes.success && tcRes.data) {
          setTestcases(tcRes.data);
        }
      }
    } catch (err: any) {
      setTcError(err.message || 'Lỗi thêm testcase.');
    }
  };

  const handleDeleteTestcase = async (tcId: string) => {
    if (!window.confirm('Xóa testcase này?')) return;
    setTcError('');
    setTcSuccess('');
    try {
      const res = await api.deleteTestcase(tcId);
      if (res.success) {
        setTestcases(prev => prev.filter(t => t.id !== tcId && t._id !== tcId));
        setTcSuccess('Đã xóa testcase thành công.');
      }
    } catch (err: any) {
      setTcError(err.message || 'Lỗi xóa testcase.');
    }
  };

  const handleToggleTagSelection = (tagId: string) => {
    setEditSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <>
      <div className="problems-tab-grid">
        {/* Left Side: Create Problem & Tags Management */}
        <div className="problems-tab-form-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form onSubmit={onSubmit} className="prob-admin-card">
            <h3>Tạo Đề Bài Mới</h3>
            <input
              type="text"
              placeholder="Tên bài tập..."
              value={probTitle}
              onChange={(e) => setProbTitle(e.target.value)}
              required
              className="prob-admin-input"
            />
            <textarea
              placeholder="Mô tả đề bài..."
              value={probDesc}
              onChange={(e) => setProbDesc(e.target.value)}
              required
              className="prob-admin-textarea"
              rows={5}
            />
            <select
              value={probDiff}
              onChange={(e: any) => setProbDiff(e.target.value)}
              className="prob-admin-select"
            >
              <option value="EASY">Dễ (Easy)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HARD">Khó (Hard)</option>
            </select>
            <button type="submit" className="btn-prob-primary">
              <Plus size={16} /> Tạo bài tập
            </button>
          </form>

          {/* Tags management */}
          <div className="prob-admin-card tags-manager-card">
            <h3>Quản Lý Thẻ Nhãn (Tags)</h3>
            <div className="tags-pill-container">
              {tags.map((t) => (
                <span key={t.id || t.slug} className="prob-tag-pill" style={{ borderColor: t.color }}>
                  {t.name}
                </span>
              ))}
            </div>

            <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Nhập tên tag mới..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="prob-admin-input"
              />
              <button type="submit" className="btn-prob-primary" style={{ whiteSpace: 'nowrap' }}>
                Thêm Tag
              </button>
            </form>
            {tagError && <p className="error-msg" style={{ fontSize: '0.8rem', color: '#f87171' }}>{tagError}</p>}
          </div>
        </div>

        {/* Right Side: List Problems */}
        <div className="prob-admin-card">
          <h3>Danh Sách Đề Bài</h3>
          <div className="prob-list-scroll">
            {problems.map((p) => {
              const probId = p.id || p.mongo_problem_id || (p as any)._id;
              return (
                <div key={probId} className="prob-item-row">
                  <div className="prob-item-details">
                    <span className="prob-item-title">{p.title}</span>
                    <div className="prob-item-meta">
                      <span className={`diff-pill diff-${p.difficulty?.toLowerCase()}`}>
                        {p.difficulty}
                      </span>
                      {p.timeLimit && (
                        <span className="prob-tag-pill" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {p.timeLimit} ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="action-btn-container">
                    <button
                      onClick={() => openEditModal(p)}
                      className="btn-action-icon edit"
                      title="Chỉnh sửa bài tập & Testcases"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(probId || '')}
                      className="btn-action-icon delete"
                      title="Xóa bài tập"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Problem Overlay Modal */}
      {editingProblem && (
        <div className="problems-modal-overlay">
          <div className="problems-modal-card">
            {/* Modal Header */}
            <div className="problems-modal-header">
              <h3>Chỉnh Sửa Bài Tập: {editingProblem.title}</h3>
              <button onClick={() => setEditingProblem(null)} className="problems-modal-close">
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="problems-modal-tabs">
              <button
                className={`problems-modal-tab-btn ${modalTab === 'info' ? 'active' : ''}`}
                onClick={() => setModalTab('info')}
              >
                <FileText size={16} /> Đề bài & Cấu hình
              </button>
              <button
                className={`problems-modal-tab-btn ${modalTab === 'code' ? 'active' : ''}`}
                onClick={() => setModalTab('code')}
              >
                <Code size={16} /> starterCodes
              </button>
              <button
                className={`problems-modal-tab-btn ${modalTab === 'testcases' ? 'active' : ''}`}
                onClick={() => setModalTab('testcases')}
              >
                <CheckSquare size={16} /> Testcases ({testcases.length})
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="problems-modal-content">
              {modalTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="prob-form-group">
                    <label>Tên bài tập</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="prob-admin-input"
                      required
                    />
                  </div>

                  <div className="prob-form-group">
                    <label>Mô tả bài tập (HTML / Markdown)</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="prob-admin-textarea"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="prob-form-grid-3">
                    <div className="prob-form-group">
                      <label>Độ khó</label>
                      <select
                        value={editDiff}
                        onChange={(e: any) => setEditDiff(e.target.value)}
                        className="prob-admin-select"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <div className="prob-form-group">
                      <label><Watch size={14} /> Giới hạn thời gian (ms)</label>
                      <input
                        type="number"
                        value={editTimeLimit}
                        onChange={(e) => setEditTimeLimit(Number(e.target.value))}
                        className="prob-admin-input"
                      />
                    </div>

                    <div className="prob-form-group">
                      <label><HardDrive size={14} /> Giới hạn bộ nhớ (MB)</label>
                      <input
                        type="number"
                        value={editMemoryLimit}
                        onChange={(e) => setEditMemoryLimit(Number(e.target.value))}
                        className="prob-admin-input"
                      />
                    </div>
                  </div>

                  {/* Assign tags */}
                  <div className="prob-form-group">
                    <label><Tag size={14} /> Gán Thẻ Nhãn (Tags)</label>
                    <div className="tag-selector-grid">
                      {tags.map((t) => {
                        const isChecked = editSelectedTags.includes(t.id || t._id);
                        return (
                          <label key={t.id || t.slug} className={`tag-checkbox-pill ${isChecked ? 'selected' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleTagSelection(t.id || t._id)}
                              style={{ display: 'none' }}
                            />
                            {t.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'code' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="prob-form-group">
                    <label>Mã nguồn C++ mẫu</label>
                    <textarea
                      value={editCppCode}
                      onChange={(e) => setEditCppCode(e.target.value)}
                      className="prob-admin-textarea"
                      style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.85rem' }}
                      rows={5}
                      placeholder="// C++ Starter code"
                    />
                  </div>

                  <div className="prob-form-group">
                    <label>Mã nguồn Java mẫu</label>
                    <textarea
                      value={editJavaCode}
                      onChange={(e) => setEditJavaCode(e.target.value)}
                      className="prob-admin-textarea"
                      style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.85rem' }}
                      rows={5}
                      placeholder="// Java Starter code"
                    />
                  </div>

                  <div className="prob-form-group">
                    <label>Mã nguồn Python mẫu</label>
                    <textarea
                      value={editPythonCode}
                      onChange={(e) => setEditPythonCode(e.target.value)}
                      className="prob-admin-textarea"
                      style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.85rem' }}
                      rows={5}
                      placeholder="# Python Starter code"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'testcases' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Create Testcase Form */}
                  <form onSubmit={handleAddTestcase} className="tc-admin-form">
                    <h4>Thêm Testcase Mới</h4>
                    <div className="tc-admin-form-inputs">
                      <div className="prob-form-group">
                        <label>Dữ liệu đầu vào (Input)</label>
                        <textarea
                          placeholder="Ví dụ: 2 7 11 15\n9"
                          value={newTcInput}
                          onChange={(e) => setNewTcInput(e.target.value)}
                          className="prob-admin-textarea"
                          style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.8rem' }}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="prob-form-group">
                        <label>Kết quả mong muốn (Output)</label>
                        <textarea
                          placeholder="Ví dụ: 0 1"
                          value={newTcOutput}
                          onChange={(e) => setNewTcOutput(e.target.value)}
                          className="prob-admin-textarea"
                          style={{ fontFamily: 'Fira Code, Courier New, monospace', fontSize: '0.8rem' }}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <div className="tc-checkbox-row">
                      <label className="tc-checkbox-label">
                        <input
                          type="checkbox"
                          checked={newTcIsExample}
                          onChange={(e) => setNewTcIsExample(e.target.checked)}
                        />
                        Dùng làm Testcase mẫu (Hiển thị cho học sinh)
                      </label>
                      <button type="submit" className="btn-prob-primary" style={{ padding: '8px 16px' }}>
                        <Plus size={14} /> Thêm Testcase
                      </button>
                    </div>
                  </form>

                  {tcError && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{tcError}</div>}
                  {tcSuccess && <div style={{ color: '#34d399', fontSize: '0.85rem' }}>{tcSuccess}</div>}

                  {/* Testcases list */}
                  <div>
                    <h4 className="tc-list-header">Danh Sách Testcases Đang Có</h4>
                    {tcLoading ? (
                      <p>Đang tải testcases...</p>
                    ) : testcases.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Chưa có testcase nào cho bài tập này.</p>
                    ) : (
                      <div className="tc-list-scroll">
                        {testcases.map((tc, index) => {
                          const tcId = tc.id || tc._id;
                          return (
                            <div key={tcId || index} className="tc-item-row">
                              <div className="tc-item-meta">
                                <span className={`tc-item-badge ${tc.isExample ? 'sample' : 'hidden'}`}>
                                  {tc.isExample ? 'TESTCASE MẪU' : 'TESTCASE ẨN'}
                                </span>
                                <div className="tc-io-wrapper">
                                  <div>
                                    <span>Input:</span>
                                    <div className="tc-io-box">{tc.input}</div>
                                  </div>
                                  <div>
                                    <span>Output:</span>
                                    <div className="tc-io-box">{tc.output}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleDeleteTestcase(tcId)}
                                className="btn-action-icon delete"
                                style={{ marginLeft: '12px' }}
                                title="Xóa testcase này"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="problems-modal-footer">
              <button onClick={() => setEditingProblem(null)} className="btn-prob-secondary">
                Hủy
              </button>
              <button onClick={handleSaveProblemEdit} className="btn-prob-primary">
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
