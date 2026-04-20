import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// JSON Export
export const exportJSON = (review) => {
  const data = {
    title: review.title,
    language: review.language,
    aiEngine: review.aiEngine,
    score: review.score,
    summary: review.summary,
    issues: review.issues,
    positives: review.positives,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `review-${review.title?.replace(/\s+/g, "-")}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// PDF Export
export const exportPDF = async (elementId, title) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#0d1117",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Multi-page support
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`review-${title?.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
};