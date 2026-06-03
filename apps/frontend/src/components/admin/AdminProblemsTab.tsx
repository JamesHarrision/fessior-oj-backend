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
        // Trigger page refresh (we can call location.reload() or let parent state update)
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
      <div className="admin-section-grid">
        {/* Left Side: Create Problem & Tags Management */}
        <div className="admin-left-col">
          <form onSubmit={onSubmit} className="admin-form-card glass-card">
            <h3>Tạo Đề Bài Mới</h3>
            <input
              type="text"
              placeholder="Tên bài tập..."
              value={probTitle}
              onChange={(e) => setProbTitle(e.target.value)}
              required
              className="glass-input"
            />
            <textarea
              placeholder="Mô tả đề bài..."
              value={probDesc}
              onChange={(e) => setProbDesc(e.target.value)}
              required
              className="glass-input"
              rows={5}
            />
            <select
              value={probDiff}
              onChange={(e: any) => setProbDiff(e.target.value)}
              className="glass-select"
            >
              <option value="EASY">Dễ (Easy)</option>
              <option value="MEDIUM">Trung bình (Medium)</option>
              <option value="HARD">Khó (Hard)</option>
            </select>
            <button type="submit" className="btn-admin-submit glass-button">
              <Plus size={16} /> Tạo bài tập
            </button>
          </form>

          {/* Tags management */}
          <div className="admin-form-card glass-card tags-admin-card">
            <h3>Quản Lý Thẻ Nhãn (Tags)</h3>
            <div className="tags-admin-list">
              {tags.map((t) => (
                <span key={t.id || t.slug} className="tag-admin-pill" style={{ borderColor: t.color }}>
                  {t.name}
                </span>
              ))}
            </div>

            <form onSubmit={handleCreateTag} className="tag-create-row">
              <input
                type="text"
                placeholder="Nhập tên tag mới..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="glass-input"
                style={{ marginBottom: 0 }}
              />
              <button type="submit" className="btn-admin-submit glass-button" style={{ marginTop: 0 }}>
                Thêm Tag
              </button>
            </form>
            {tagError && <p className="error-msg" style={{ fontSize: '0.8rem', marginTop: '8px' }}>{tagError}</p>}
          </div>
        </div>

        {/* Right Side: List Problems */}
        <div className="admin-list-card glass-card">
          <h3>Danh Sách Đề Bài</h3>
          <div className="admin-scroll-list">
            {problems.map((p) => {
              const probId = p.id || p.mongo_problem_id || (p as any)._id;
              return (
                <div key={probId} className="admin-list-item">
                  <div className="admin-list-item-info">
                    <span style={{ fontWeight: 600 }}>{p.title}</span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className={`diff-pill diff-${p.difficulty?.toLowerCase()}`}>
                        {p.difficulty}
                      </span>
                      {p.timeLimit && (
                        <span className="meta-badge" style={{ fontSize: '0.7rem' }}>
                          {p.timeLimit} ms
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="admin-list-item-actions">
                    <button
                      onClick={() => openEditModal(p)}
                      className="btn-admin-edit"
                      title="Chỉnh sửa bài tập & Testcases"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(probId || '')}
                      className="btn-admin-delete"
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
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            {/* Modal Header */}
            <div className="modal-header">
              <h3>Chỉnh Sửa Bài Tập: {editingProblem.title}</h3>
              <button onClick={() => setEditingProblem(null)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab-btn ${modalTab === 'info' ? 'active' : ''}`}
                onClick={() => setModalTab('info')}
              >
                <FileText size={16} /> Đề bài & Cấu hình
              </button>
              <button
                className={`modal-tab-btn ${modalTab === 'code' ? 'active' : ''}`}
                onClick={() => setModalTab('code')}
              >
                <Code size={16} /> starterCodes
              </button>
              <button
                className={`modal-tab-btn ${modalTab === 'testcases' ? 'active' : ''}`}
                onClick={() => setModalTab('testcases')}
              >
                <CheckSquare size={16} /> Testcases ({testcases.length})
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="modal-content-scroll">
              {modalTab === 'info' && (
                <div className="settings-form">
                  <div className="settings-input-group">
                    <label>Tên bài tập</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="settings-field-input"
                      required
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Mô tả bài tập (HTML/Markdown)</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="settings-field-input"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="settings-form-grid">
                    <div className="settings-input-group">
                      <label>Độ khó</label>
                      <select
                        value={editDiff}
                        onChange={(e: any) => setEditDiff(e.target.value)}
                        className="settings-field-input"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <div className="settings-input-group">
                      <label><Watch size={14} /> Giới hạn thời gian (ms)</label>
                      <input
                        type="number"
                        value={editTimeLimit}
                        onChange={(e) => setEditTimeLimit(Number(e.target.value))}
                        className="settings-field-input"
                      />
                    </div>

                    <div className="settings-input-group">
                      <label><HardDrive size={14} /> Giới hạn bộ nhớ (MB)</label>
                      <input
                        type="number"
                        value={editMemoryLimit}
                        onChange={(e) => setEditMemoryLimit(Number(e.target.value))}
                        className="settings-field-input"
                      />
                    </div>
                  </div>

                  {/* Assign tags */}
                  <div className="settings-input-group">
                    <label><Tag size={14} /> Gán Thẻ Nhãn (Tags)</label>
                    <div className="tag-selection-grid">
                      {tags.map((t) => {
                        const isChecked = editSelectedTags.includes(t.id || t._id);
                        return (
                          <label key={t.id || t.slug} className={`tag-checkbox-label ${isChecked ? 'checked' : ''}`}>
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
                <div className="settings-form">
                  <div className="settings-input-group">
                    <label>Mã nguồn C++ mẫu</label>
                    <textarea
                      value={editCppCode}
                      onChange={(e) => setEditCppCode(e.target.value)}
                      className="settings-field-input"
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      rows={6}
                      placeholder="// C++ Starter code"
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Mã nguồn Java mẫu</label>
                    <textarea
                      value={editJavaCode}
                      onChange={(e) => setEditJavaCode(e.target.value)}
                      className="settings-field-input"
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      rows={6}
                      placeholder="// Java Starter code"
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Mã nguồn Python mẫu</label>
                    <textarea
                      value={editPythonCode}
                      onChange={(e) => setEditPythonCode(e.target.value)}
                      className="settings-field-input"
                      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                      rows={6}
                      placeholder="# Python Starter code"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'testcases' && (
                <div className="testcases-panel">
                  {/* Create Testcase Form */}
                  <form onSubmit={handleAddTestcase} className="testcase-form">
                    <h4>Thêm Testcase Mới</h4>
                    <div className="testcase-row-inputs">
                      <div className="settings-input-group">
                        <label>Dữ liệu đầu vào (Input)</label>
                        <textarea
                          placeholder="Ví dụ: 2 7 11 15\n9"
                          value={newTcInput}
                          onChange={(e) => setNewTcInput(e.target.value)}
                          className="settings-field-input"
                          style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label>Kết quả mong muốn (Output)</label>
                        <textarea
                          placeholder="Ví dụ: 0 1"
                          value={newTcOutput}
                          onChange={(e) => setNewTcOutput(e.target.value)}
                          className="settings-field-input"
                          style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <label className="testcase-checkbox">
                        <input
                          type="checkbox"
                          checked={newTcIsExample}
                          onChange={(e) => setNewTcIsExample(e.target.checked)}
                        />
                        Dùng làm Testcase mẫu (Hiển thị cho học sinh)
                      </label>
                      <button type="submit" className="btn-admin-submit glass-button" style={{ marginTop: 0 }}>
                        <Plus size={14} /> Thêm Testcase
                      </button>
                    </div>
                  </form>

                  {tcError && <div className="alert-message error-msg">{tcError}</div>}
                  {tcSuccess && <div className="alert-message success-msg">{tcSuccess}</div>}

                  {/* Testcases list */}
                  <div className="testcases-list-container">
                    <h4>Danh Sách Testcases Đang Có</h4>
                    {tcLoading ? (
                      <p>Đang tải testcases...</p>
                    ) : testcases.length === 0 ? (
                      <p className="no-sessions-txt">Chưa có testcase nào cho bài tập này.</p>
                    ) : (
                      testcases.map((tc, index) => {
                        const tcId = tc.id || tc._id;
                        return (
                          <div key={tcId || index} className="testcase-item-card">
                            <div className="testcase-details">
                              <span className={`tc-type-badge ${tc.isExample ? 'sample' : 'hidden'}`}>
                                {tc.isExample ? 'TESTCASE MẪU' : 'TESTCASE ẨN'}
                              </span>
                              <div className="tc-io-preview">
                                <div>
                                  <span>Input:</span>
                                  <div className="io-box">{tc.input}</div>
                                </div>
                                <div>
                                  <span>Output:</span>
                                  <div className="io-box">{tc.output}</div>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteTestcase(tcId)}
                              className="btn-admin-delete"
                              style={{ marginLeft: '12px' }}
                              title="Xóa testcase này"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button onClick={() => setEditingProblem(null)} className="btn-admin-submit glass-button" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                Hủy
              </button>
              <button onClick={handleSaveProblemEdit} className="btn-action-primary blue" style={{ marginTop: 0 }}>
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
