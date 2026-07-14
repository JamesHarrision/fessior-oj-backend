import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useReport = () => {
  const navigate = useNavigate();

  const [issueType, setIssueType] = useState("");
  const [relatedUrl, setRelatedUrl] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [showIssueOptions, setShowIssueOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    setIssueType("");
    setRelatedUrl("");
    setDescription("");
    setAttachments(null);
    navigate("/"); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      console.log("Dữ liệu gửi đi:", { issueType, relatedUrl, description, attachments });

      setIssueType("");
      setRelatedUrl("");
      setDescription("");
      setAttachments(null);
      
      alert("Gửi báo cáo thành công!");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    issueType,
    setIssueType,
    relatedUrl,
    setRelatedUrl,
    description,
    setDescription,
    attachments,
    setAttachments,
    showIssueOptions,
    setShowIssueOptions,
    isSubmitting,
    handleCancel,
    handleSubmit,
  };
};