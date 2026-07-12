import React, { useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';

/* =====================================================
   ReportForm — Ink & Vermillion
   Props unchanged: { targetId, targetType, onClose }
   ===================================================== */

interface ReportFormProps {
  targetId: string;
  targetType: string;
  onClose: () => void;
}

const REPORT_TYPES = [
  { key: 'BUG', label: 'Lỗi kỹ thuật' },
  { key: 'TYPO', label: 'Lỗi chính tả' },
  { key: 'CHEATING', label: 'Gian lận' },
  { key: 'OTHERS', label: 'Khác' },
];

export const ReportForm: React.FC<ReportFormProps> = ({ onClose }) => {
  const [type, setType] = useState('BUG');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-washi border border-charcoal p-8 text-center">
        <CheckCircle size={40} strokeWidth={1.5} className="text-vermilion mx-auto mb-4" />
        <h3 className="font-display text-base font-bold text-linen mb-2">Đã gửi báo cáo</h3>
        <p className="font-body text-sm text-stone mb-4">Cảm ơn bạn đã đóng góp. Đội ngũ sẽ xem xét báo cáo của bạn.</p>
        <button onClick={onClose} className="font-display text-xs font-bold uppercase text-vermilion hover:text-vermilion-hover cursor-pointer">Đóng</button>
      </div>
    );
  }

  return (
    <div className="bg-washi border border-charcoal p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flag size={16} className="text-stone" />
        <h3 className="font-display text-sm font-bold text-linen uppercase tracking-wider">Báo cáo</h3>
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full bg-ink border border-charcoal text-linen text-sm px-3 py-2 mb-3 outline-none cursor-pointer focus:border-vermilion transition-colors"
      >
        {REPORT_TYPES.map((t) => (
          <option key={t.key} value={t.key}>{t.label}</option>
        ))}
      </select>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Mô tả chi tiết vấn đề..."
        className="w-full bg-ink border border-charcoal text-linen placeholder-stone text-sm px-3 py-2 h-24 resize-none outline-none focus:border-vermilion transition-colors mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-vermilion text-linen font-display text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-vermilion-hover transition-colors cursor-pointer"
        >
          Gửi báo cáo
        </button>
        <button
          onClick={onClose}
          className="border border-charcoal text-stone font-body text-sm px-4 py-2 hover:text-linen hover:border-stone transition-colors cursor-pointer"
        >
          Huỷ
        </button>
      </div>
    </div>
  );
};
