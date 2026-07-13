import React, { useState } from 'react';
import { Modal, Input, DatePicker, message } from 'antd';
import { Bot, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoadmapModal({ isOpen, onClose, onSuccess }: Props) {
  const [prompt, setPrompt] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.error('Vui lòng nhập mục tiêu học tập');
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await api.generateRoadmap({ prompt, startDate });
      if (res.success) {
        message.success('Roadmap được tạo thành công!');
        setPrompt('');
        setStartDate(null);
        onSuccess();
        onClose();
      } else {
        message.error('Không thể tạo roadmap lúc này');
      }
    } catch (err) {
      message.error('Lỗi khi gọi AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-vermilion">
          <Bot size={20} />
          <span className="font-display font-bold">AI Roadmap Generator</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      className="[&_.ant-modal-content]:bg-ink [&_.ant-modal-content]:border [&_.ant-modal-content]:border-charcoal [&_.ant-modal-header]:bg-ink [&_.ant-modal-title]:text-linen [&_.ant-modal-close]:text-stone hover:[&_.ant-modal-close]:text-linen"
    >
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone mb-1">
            Mục tiêu học tập của bạn
          </label>
          <Input.TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ví dụ: Tôi muốn học Dynamic Programming trong 4 tuần, tập trung vào bài toán cơ bản..."
            autoSize={{ minRows: 4, maxRows: 6 }}
            className="w-full bg-charcoal/30 border-charcoal text-linen focus:border-vermilion focus:ring-vermilion placeholder:text-stone/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone mb-1 flex items-center gap-2">
            <Calendar size={14} />
            Ngày bắt đầu (Tùy chọn)
          </label>
          <DatePicker 
            className="w-full bg-charcoal/30 border-charcoal text-linen" 
            placeholder="Chọn ngày bắt đầu (Mặc định là hôm nay)"
            onChange={(_, dateString) => setStartDate(dateString as string)}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-vermilion hover:bg-vermilion/90 text-linen py-3 px-4 rounded font-display font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-linen/30 border-t-linen rounded-full animate-spin" />
              Đang phân tích & tạo...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Tạo Lộ Trình
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
