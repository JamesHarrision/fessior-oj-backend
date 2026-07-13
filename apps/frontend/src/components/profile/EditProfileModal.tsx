import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentFullName: string;
  currentBio: string;
  currentAvatar: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  onClose, 
  onSuccess,
  currentFullName,
  currentBio,
  currentAvatar
}) => {
  const { refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(currentFullName || '');
  const [bio, setBio] = useState(currentBio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(currentAvatar);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update basic info
      const profileRes = await api.updateProfile({
        full_name: fullName,
        bio: bio
      });

      if (!profileRes.success) {
        throw new Error('Lỗi cập nhật thông tin');
      }

      // Update avatar if a new file is selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await api.updateProfileAvatar(formData);
        
        if (!avatarRes.success) {
          throw new Error('Lỗi cập nhật ảnh đại diện');
        }
      }

      await refreshProfile();
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
      <div className="bg-washi border border-charcoal w-full max-w-md flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-charcoal bg-ink">
          <h2 className="font-display text-lg font-bold text-linen uppercase tracking-wider">Chỉnh sửa hồ sơ</h2>
          <button onClick={onClose} className="text-stone hover:text-vermilion transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6">
          {error && (
            <div className="bg-vermilion/10 text-vermilion border border-vermilion/50 p-3 font-body text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer w-24 h-24 rounded-full border border-charcoal bg-ink overflow-hidden"
                 onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload size={24} className="text-stone" />
                </div>
              )}
              <div className="absolute inset-0 bg-ink/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-linen" />
              </div>
            </div>
            <span className="font-mono text-[10px] text-stone uppercase tracking-wider">Nhấn vào để đổi ảnh</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Tên hiển thị</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-ink border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors"
              placeholder="Nhập tên hiển thị"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-display text-[10px] font-bold text-stone uppercase tracking-wider">Tiểu sử</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-ink border border-charcoal text-linen p-3 font-body text-sm outline-none focus:border-vermilion transition-colors resize-none"
              placeholder="Giới thiệu đôi chút về bản thân..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 font-display text-xs font-bold text-stone uppercase tracking-wider hover:text-linen transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-vermilion text-linen font-display text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-vermilion-hover transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : <><Check size={16} /> Lưu</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
