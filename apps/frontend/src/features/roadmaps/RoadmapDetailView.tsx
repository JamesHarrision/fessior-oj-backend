import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { IRoadmap, IRoadmapSession } from '@ocj/types';
import { message, Switch, Popconfirm } from 'antd';
import { ArrowLeft, Share2, Trash2, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import { format, isSameDay, startOfWeek, addDays, getMonth, getYear } from 'date-fns';

export function RoadmapDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<IRoadmapSession | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const fetchRoadmap = async () => {
    if (!id) return;
    try {
      const res = await api.getRoadmapDetail(id);
      if (res.success) {
        setRoadmap(res.data);
        
        // Auto select first incomplete session, or first session
        if (res.data.phases?.length > 0) {
          let found = false;
          for (const phase of res.data.phases) {
            for (const session of phase.sessions || []) {
              if (!session.is_completed) {
                setSelectedSession(session as any);
                if (session.date) setCurrentMonthDate(new Date(session.date));
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (!found) {
            setSelectedSession(res.data.phases[0].sessions?.[0] as any);
          }
        }
      } else {
        message.error('Không tìm thấy lộ trình');
        navigate('/roadmaps');
      }
    } catch (err) {
      message.error('Lỗi khi tải lộ trình');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const handleToggleComplete = async (session: IRoadmapSession) => {
    try {
      const res = await api.updateRoadmapSession(session.id, { is_completed: !session.is_completed });
      if (res.success) {
        message.success(session.is_completed ? 'Đã bỏ đánh dấu hoàn thành' : 'Đã đánh dấu hoàn thành');
        fetchRoadmap(); // Refresh
      }
    } catch (err) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const res = await api.deleteRoadmap(id);
      if (res.success) {
        message.success('Đã xóa lộ trình');
        navigate('/roadmaps');
      }
    } catch (err) {
      message.error('Không thể xóa lộ trình');
    }
  };

  const handleShareToggle = async (checked: boolean) => {
    if (!id) return;
    try {
      const res = await api.toggleRoadmapShare(id, checked);
      if (res.success) {
        message.success(checked ? 'Đã bật chia sẻ public' : 'Đã tắt chia sẻ public');
        setRoadmap(prev => prev ? { ...prev, is_shared: checked } : null);
      }
    } catch (err) {
      message.error('Không thể thay đổi trạng thái chia sẻ');
    }
  };

  // Extract all sessions
  const allSessions = useMemo(() => {
    if (!roadmap) return [];
    const sessions: IRoadmapSession[] = [];
    roadmap.phases?.forEach(p => {
      p.sessions?.forEach(s => sessions.push(s));
    });
    return sessions;
  }, [roadmap]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startDate = startOfWeek(new Date(getYear(currentMonthDate), getMonth(currentMonthDate), 1), { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 35; i++) { // 5 weeks
      days.push(addDays(startDate, i));
    }
    return days;
  }, [currentMonthDate]);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-charcoal/30 w-1/4" />
      <div className="h-64 bg-charcoal/30 w-full" />
    </div>;
  }

  if (!roadmap) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/roadmaps')}
            className="p-2 text-stone hover:text-linen hover:bg-charcoal/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-linen flex items-center gap-2">
              {roadmap.title}
              {roadmap.is_shared && <Share2 size={16} className="text-stone" />}
            </h1>
            <p className="text-stone text-sm">{roadmap.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-stone">
            <span className="font-medium">Public Share:</span>
            <Switch 
              checked={roadmap.is_shared} 
              onChange={handleShareToggle}
              className="bg-charcoal [&.ant-switch-checked]:bg-vermilion"
            />
          </div>
          <Popconfirm
            title="Xóa lộ trình?"
            description="Bạn có chắc muốn xóa lộ trình này không? Hành động này không thể hoàn tác."
            onConfirm={handleDelete}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-stone hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </Popconfirm>
        </div>
      </div>

      {/* ── Main Layout: Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar & Selected Session */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Calendar Widget */}
          <div className="bg-washi border border-charcoal p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <CalendarIcon className="text-vermilion" size={20} />
                Lịch Học Tập
              </h2>
              <div className="flex gap-2 text-sm font-bold font-display uppercase tracking-wider text-stone">
                <button 
                  onClick={() => setCurrentMonthDate(prev => new Date(getYear(prev), getMonth(prev) - 1, 1))}
                  className="hover:text-linen"
                >
                  Prev
                </button>
                <span className="text-linen w-24 text-center">
                  {format(currentMonthDate, 'MMMM yyyy')}
                </span>
                <button 
                  onClick={() => setCurrentMonthDate(prev => new Date(getYear(prev), getMonth(prev) + 1, 1))}
                  className="hover:text-linen"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-charcoal/50 border border-charcoal/50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="bg-washi py-2 text-center text-xs font-bold text-stone uppercase">
                  {day}
                </div>
              ))}
              {calendarDays.map(date => {
                const isCurrentMonth = getMonth(date) === getMonth(currentMonthDate);
                const sessionForDay = allSessions.find(s => s.date && isSameDay(new Date(s.date), date));
                const isSelected = selectedSession && sessionForDay?.id === selectedSession.id;

                return (
                  <div 
                    key={date.toISOString()} 
                    onClick={() => sessionForDay && setSelectedSession(sessionForDay as any)}
                    className={`
                      min-h-[80px] bg-washi p-2 relative transition-colors
                      ${!isCurrentMonth ? 'opacity-30' : ''}
                      ${sessionForDay ? 'cursor-pointer hover:bg-charcoal/20' : ''}
                      ${isSelected ? 'ring-1 ring-inset ring-vermilion bg-charcoal/30' : ''}
                    `}
                  >
                    <span className={`text-sm ${sessionForDay ? 'font-bold text-linen' : 'text-stone'}`}>
                      {format(date, 'd')}
                    </span>
                    {sessionForDay && (
                      <div className={`
                        absolute bottom-2 left-2 right-2 text-[10px] leading-tight truncate px-1.5 py-0.5
                        ${sessionForDay.is_completed ? 'bg-green-500/20 text-green-400' : 'bg-vermilion/20 text-vermilion'}
                      `}>
                        {sessionForDay.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Session Detail */}
          {selectedSession && (
            <div className="bg-washi border border-charcoal p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-vermilion text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    {selectedSession.date ? format(new Date(selectedSession.date), 'EEEE, MMMM d, yyyy') : 'No Date'}
                    <Popconfirm
                      title="Đổi ngày học"
                      description={
                        <div className="mt-2">
                          <input 
                            type="date" 
                            className="border border-charcoal bg-ink text-linen p-1 text-sm rounded w-full"
                            id="reschedule-date"
                            defaultValue={selectedSession.date ? format(new Date(selectedSession.date), 'yyyy-MM-dd') : ''}
                          />
                        </div>
                      }
                      onConfirm={async () => {
                        const input = document.getElementById('reschedule-date') as HTMLInputElement;
                        if (input && input.value) {
                          try {
                            const res = await api.updateRoadmapSession(selectedSession.id, { date: input.value });
                            if (res.success) {
                              message.success('Đã dời lịch học');
                              fetchRoadmap();
                            }
                          } catch (e) {
                            message.error('Lỗi khi đổi ngày');
                          }
                        }
                      }}
                    >
                      <button className="text-stone hover:text-vermilion transition-colors border border-charcoal hover:border-vermilion px-2 py-0.5 rounded text-[10px]">
                        Dời lịch
                      </button>
                    </Popconfirm>
                  </div>
                  <h3 className="font-display font-bold text-2xl text-linen">{selectedSession.title}</h3>
                  <p className="text-stone mt-2">{selectedSession.description}</p>
                </div>
                <button
                  onClick={() => handleToggleComplete(selectedSession)}
                  className={`flex items-center gap-2 px-4 py-2 font-display font-bold uppercase text-xs transition-colors border ${
                    selectedSession.is_completed 
                      ? 'bg-green-500/10 border-green-500 text-green-500 hover:bg-green-500/20' 
                      : 'border-charcoal text-stone hover:text-linen hover:border-stone'
                  }`}
                >
                  {selectedSession.is_completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  {selectedSession.is_completed ? 'Hoàn thành' : 'Đánh dấu xong'}
                </button>
              </div>

              <div className="space-y-3 mt-6">
                <h4 className="text-sm font-bold text-stone uppercase tracking-wider mb-4">Bài Tập Khuyến Nghị</h4>
                {selectedSession.problems?.length ? (
                  selectedSession.problems.map(sp => (
                    <div key={sp.mongo_problem_id} className="flex items-center justify-between p-4 bg-ink border border-charcoal hover:border-stone transition-colors group cursor-pointer" onClick={() => navigate(`/solve/${sp.problem?.slug || sp.mongo_problem_id}`)}>
                      <div className="flex flex-col">
                        <span className="font-bold text-linen group-hover:text-vermilion transition-colors">
                          {sp.problem?.title || sp.mongo_problem_id}
                        </span>
                        <span className="text-xs text-stone mt-1">{sp.problem?.difficulty || 'N/A'}</span>
                      </div>
                      <div className="text-stone group-hover:text-linen">
                        Làm bài &rarr;
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone text-sm italic">Không có bài tập cho ngày này.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Progress Sidebar */}
        <div className="space-y-6">
          <div className="bg-washi border border-charcoal p-6">
            <h3 className="font-display font-bold text-lg mb-6">Tiến Độ Lộ Trình</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-charcoal before:to-transparent">
              {roadmap.phases?.map((phase, idx) => {
                const phaseSessions = phase.sessions || [];
                const completedPhase = phaseSessions.length > 0 && phaseSessions.every(s => s.is_completed);
                const isActivePhase = phaseSessions.some(s => s.id === selectedSession?.id);

                return (
                  <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 bg-ink shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-colors ${
                      completedPhase ? 'border-green-500 text-green-500' : 
                      isActivePhase ? 'border-vermilion text-vermilion' : 'border-charcoal text-stone'
                    }`}>
                      {completedPhase ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                    </div>
                    
                    <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded border transition-colors ${
                      isActivePhase ? 'bg-charcoal/30 border-vermilion' : 'bg-ink border-charcoal'
                    }`}>
                      <h4 className={`text-sm font-bold ${isActivePhase ? 'text-vermilion' : 'text-linen'}`}>{phase.title}</h4>
                      <p className="text-xs text-stone mt-1">{phaseSessions.filter(s=>s.is_completed).length}/{phaseSessions.length} sessions</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
