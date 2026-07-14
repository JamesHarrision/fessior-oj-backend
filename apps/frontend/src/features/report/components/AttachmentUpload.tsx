import React, { useRef, useState } from "react";
import { HiOutlineUpload } from "react-icons/hi";

interface AttachmentUploadProps {
  onChange: (files: FileList | null) => void;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({ onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      onChange(files);
    } else {
      setFileName("");
      onChange(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-stone uppercase tracking-wide">Attachments</label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div 
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-charcoal rounded-xl p-6 bg-ink cursor-pointer hover:border-vermilion hover:bg-washi transition-colors" 
        onClick={handleBoxClick}
      >
        <HiOutlineUpload className="text-3xl text-stone" />
        <span className="text-sm text-stone">
          {fileName ? fileName : "Chọn tệp hoặc kéo thả tệp vào đây"}
        </span>
      </div>
    </div>
  );
};