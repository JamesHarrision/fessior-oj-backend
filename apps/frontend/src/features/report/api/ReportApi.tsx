export const submitReport = async (formData: FormData): Promise<any> => {
  const response = await fetch("/api/reports", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to submit report");
  }
  return response.json();
};