import React from "react";
import { ReportForm } from "../components/ReportForm";

const ReportPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-linen mb-8 text-center">Report an issue</h1>
      <ReportForm />
    </div>
  );
};

export default ReportPage;