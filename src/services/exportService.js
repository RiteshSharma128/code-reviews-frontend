import jsPDF from "jspdf";

// ✅ JSON Export
export const exportJSON = (result) => {
  const dataStr = JSON.stringify(result, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `review-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// ✅ PDF Export
export const exportPDF = (elementId, filename = "review") => {
  try {
    const doc = new jsPDF();
    const element = document.getElementById(elementId);

    if (!element) {
      // ✅ Agar element nahi mila toh basic PDF banao
      doc.setFontSize(16);
      doc.text("AI Code Review Report", 20, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
      doc.save(`${filename}.pdf`);
      return;
    }

    const text = element.innerText || element.textContent || "";
    doc.setFontSize(16);
    doc.text("AI Code Review Report", 20, 20);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, 35);
    doc.save(`${filename}.pdf`);
  } catch (err) {
    console.error("PDF export failed:", err);
  }
};