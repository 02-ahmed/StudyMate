"use client";

import ExamDetailsContent from "./ExamDetailsContent";

export default function ExamDetailsPage({ params }) {
  const { id } = params;

  if (!id) {
    return <p>Loading exam details...</p>;
  }

  return (
    <div>
      <ExamDetailsContent examId={id} />
    </div>
  );
}
