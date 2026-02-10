import jsPDF from "jspdf";
import type { Analysis, AnalysisResult } from "@/lib/types/analysis";

// =====================================================
// COLOR PALETTE
// =====================================================
const COLORS = {
  primary: [0, 171, 141] as [number, number, number], // emerald/teal
  dark: [30, 30, 30] as [number, number, number],
  text: [55, 55, 55] as [number, number, number],
  muted: [120, 120, 120] as [number, number, number],
  light: [245, 245, 245] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [220, 53, 69] as [number, number, number],
  green: [40, 167, 69] as [number, number, number],
  yellow: [255, 193, 7] as [number, number, number],
  blue: [0, 123, 255] as [number, number, number],
  orange: [255, 152, 0] as [number, number, number],
  purple: [156, 39, 176] as [number, number, number],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getRiskColor(level: string | null): [number, number, number] {
  switch (level) {
    case "low":
      return COLORS.green;
    case "medium":
      return COLORS.yellow;
    case "high":
      return COLORS.red;
    default:
      return COLORS.muted;
  }
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 80) return COLORS.green;
  if (score >= 60) return COLORS.yellow;
  return COLORS.red;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// =====================================================
// PDF REPORT GENERATOR
// =====================================================

export function generateAnalysisReport(
  analysis: Analysis,
  result: AnalysisResult | null
): void {
  const baseFileName = analysis.file_name.replace(/\.[^/.]+$/, "");
  const exportFileName = `riskread_${baseFileName}_analysis.pdf`;

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // =====================================================
  // PAGE MANAGEMENT
  // =====================================================
  function checkPageBreak(needed: number): void {
    if (y + needed > pageHeight - 25) {
      addFooter();
      doc.addPage();
      y = 20;
    }
  }

  function addFooter(): void {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `RiskRead AI - Document Risk Analysis Report`,
      margin,
      pageHeight - 10
    );
    doc.text(`Page ${pageCount}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }

  // =====================================================
  // SECTION HELPERS
  // =====================================================
  function drawSectionTitle(title: string): void {
    checkPageBreak(16);
    y += 6;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(title, margin, y);
    y += 2;
    // Underline
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;
  }

  function drawKeyValue(
    key: string,
    value: string,
    x: number = margin,
    width: number = contentWidth
  ): void {
    checkPageBreak(8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(key, x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    const keyWidth = doc.getTextWidth(key + "  ");
    const valueLines = doc.splitTextToSize(value, width - keyWidth);
    doc.text(valueLines, x + keyWidth, y);
    y += valueLines.length * 4.5 + 2;
  }

  function drawWrappedText(
    text: string,
    x: number = margin,
    fontSize: number = 9,
    color: [number, number, number] = COLORS.text,
    maxWidth: number = contentWidth
  ): void {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      checkPageBreak(5);
      doc.text(line, x, y);
      y += 4.5;
    }
  }

  function drawScoreBar(
    label: string,
    score: number,
    x: number,
    barWidth: number
  ): void {
    checkPageBreak(14);
    const color = getScoreColor(score);
    const scoreLabel = getScoreLabel(score);

    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.text);
    doc.text(label, x, y);

    // Score value
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    doc.text(`${score}/100 (${scoreLabel})`, x + barWidth, y, {
      align: "right",
    });
    y += 3;

    // Background bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(x, y, barWidth, 3, 1.5, 1.5, "F");

    // Score bar
    const filledWidth = (score / 100) * barWidth;
    doc.setFillColor(...color);
    doc.roundedRect(x, y, Math.max(filledWidth, 3), 3, 1.5, 1.5, "F");

    y += 8;
  }

  // =====================================================
  // COVER / HEADER
  // =====================================================

  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 60, "F");

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("RiskRead AI", margin, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Document Risk Analysis Report", margin, 32);

  // File name
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(analysis.file_name, margin, 46);

  // Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${formatDate(new Date().toISOString())}`, margin, 54);

  // Overall score badge (top right)
  if (analysis.overall_score !== null) {
    const scoreX = pageWidth - margin - 30;
    const scoreY = 15;
    const riskColor = getRiskColor(analysis.risk_level);

    // Circle background
    doc.setFillColor(...COLORS.white);
    doc.circle(scoreX + 15, scoreY + 15, 18, "F");

    // Score number
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...riskColor);
    doc.text(analysis.overall_score.toFixed(0), scoreX + 15, scoreY + 14, {
      align: "center",
    });

    // Label below
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.dark);
    doc.text("Overall", scoreX + 15, scoreY + 20, { align: "center" });
    doc.text("Score", scoreX + 15, scoreY + 24, { align: "center" });
  }

  y = 70;

  // =====================================================
  // DOCUMENT SUMMARY
  // =====================================================
  drawSectionTitle("Document Summary");

  const col1X = margin;
  const col2X = margin + contentWidth / 2;

  drawKeyValue("File Name:", analysis.file_name, col1X, contentWidth / 2 - 5);
  drawKeyValue(
    "File Type:",
    analysis.file_type.toUpperCase(),
    col2X,
    contentWidth / 2 - 5
  );
  const yAfterName = y;
  y = yAfterName;
  drawKeyValue(
    "File Size:",
    formatFileSize(analysis.file_size),
    col1X,
    contentWidth / 2 - 5
  );
  drawKeyValue(
    "Status:",
    analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1),
    col2X,
    contentWidth / 2 - 5
  );
  drawKeyValue(
    "Created:",
    formatDate(analysis.created_at),
    col1X,
    contentWidth / 2 - 5
  );
  if (analysis.risk_level) {
    drawKeyValue(
      "Risk Level:",
      analysis.risk_level.charAt(0).toUpperCase() +
        analysis.risk_level.slice(1),
      col2X,
      contentWidth / 2 - 5
    );
  }

  if (!result) {
    y += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...COLORS.muted);
    doc.text("Analysis results are not yet available.", margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    const disclaimerLines = doc.splitTextToSize(
      "Important: This report is generated automatically by an AI system and may contain errors, omissions, or misinterpretations. It is provided for informational purposes only and does not constitute legal, compliance, financial, or risk advice. You remain responsible for independently reviewing all documents and making final decisions based on appropriate professional judgment.",
      contentWidth
    );
    for (const line of disclaimerLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4;
    }

    addFooter();

    // Trigger download
    doc.save(exportFileName);
    return;
  }

  // =====================================================
  // SCORE BREAKDOWN
  // =====================================================
  drawSectionTitle("Score Breakdown");

  const overallScore = Math.round(
    result.relevance_score * 0.25 +
      result.completeness_score * 0.2 +
      result.risk_score * 0.25 +
      result.clarity_score * 0.15 +
      result.accuracy_score * 0.15
  );

  // Summary box
  checkPageBreak(20);
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(margin, y, contentWidth, 16, 3, 3, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`Overall Weighted Score: ${overallScore}/100`, margin + 6, y + 7);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Average: ${Math.round((result.relevance_score + result.completeness_score + result.risk_score + result.clarity_score + result.accuracy_score) / 5)}/100  |  Highest: ${Math.max(result.relevance_score, result.completeness_score, result.risk_score, result.clarity_score, result.accuracy_score)}/100  |  Lowest: ${Math.min(result.relevance_score, result.completeness_score, result.risk_score, result.clarity_score, result.accuracy_score)}/100`,
    margin + 6,
    y + 13
  );
  y += 22;

  // Individual score bars
  drawScoreBar("Relevance (25%)", result.relevance_score, margin, contentWidth);
  drawScoreBar(
    "Completeness (20%)",
    result.completeness_score,
    margin,
    contentWidth
  );
  drawScoreBar(
    "Risk Assessment (25%)",
    result.risk_score,
    margin,
    contentWidth
  );
  drawScoreBar("Clarity (15%)", result.clarity_score, margin, contentWidth);
  drawScoreBar("Accuracy (15%)", result.accuracy_score, margin, contentWidth);

  // =====================================================
  // KEY INSIGHTS
  // =====================================================
  if (result.insights && result.insights.length > 0) {
    drawSectionTitle("Key Insights");

    const categories = [
      { label: "Risks", cat: "risk", color: COLORS.red },
      { label: "Strengths", cat: "strength", color: COLORS.green },
      { label: "Weaknesses", cat: "weakness", color: COLORS.yellow },
      { label: "Opportunities", cat: "opportunity", color: COLORS.blue },
    ];

    for (const { label, cat, color } of categories) {
      const items = result.insights.filter((i) => i.category === cat);
      if (items.length === 0) continue;

      checkPageBreak(12);
      // Category heading
      doc.setFillColor(...color);
      doc.roundedRect(margin, y - 3, 3, 6, 1, 1, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(`${label} (${items.length})`, margin + 6, y);
      y += 6;

      for (const insight of items) {
        checkPageBreak(10);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.text);
        doc.text("•", margin + 4, y);

        const lines = doc.splitTextToSize(insight.text, contentWidth - 12);
        for (const line of lines) {
          checkPageBreak(5);
          doc.text(line, margin + 9, y);
          y += 4;
        }

        if (insight.confidence) {
          doc.setFontSize(7);
          doc.setTextColor(...COLORS.muted);
          doc.text(
            `Confidence: ${Math.round(insight.confidence * 100)}%`,
            margin + 9,
            y
          );
          y += 4;
        }
        y += 1;
      }
      y += 3;
    }
  }

  // =====================================================
  // RECOMMENDATIONS
  // =====================================================
  if (result.recommendations && result.recommendations.length > 0) {
    drawSectionTitle("Recommendations");

    const priorities = [
      { label: "High Priority", priority: "high", color: COLORS.red },
      { label: "Medium Priority", priority: "medium", color: COLORS.orange },
      { label: "Low Priority", priority: "low", color: COLORS.blue },
    ];

    for (const { label, priority, color } of priorities) {
      const items = result.recommendations.filter(
        (r) => r.priority === priority
      );
      if (items.length === 0) continue;

      checkPageBreak(12);
      doc.setFillColor(...color);
      doc.roundedRect(margin, y - 3, 3, 6, 1, 1, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(`${label} (${items.length})`, margin + 6, y);
      y += 6;

      for (let i = 0; i < items.length; i++) {
        const rec = items[i];
        checkPageBreak(12);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.text);
        doc.text(`${i + 1}.`, margin + 4, y);

        const lines = doc.splitTextToSize(rec.text, contentWidth - 14);
        for (const line of lines) {
          checkPageBreak(5);
          doc.text(line, margin + 11, y);
          y += 4;
        }

        // Category tag
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.muted);
        doc.text(`Category: ${rec.category}`, margin + 11, y);
        y += 5;
      }
      y += 3;
    }
  }

  // =====================================================
  // HIGHLIGHTS
  // =====================================================
  if (result.highlights && result.highlights.length > 0) {
    drawSectionTitle("Key Highlights");

    for (const highlight of result.highlights) {
      checkPageBreak(16);

      // Category dot
      const hlColor =
        highlight.category === "risky"
          ? COLORS.red
          : highlight.category === "important"
            ? COLORS.blue
            : COLORS.yellow;
      doc.setFillColor(...hlColor);
      doc.circle(margin + 2, y - 1, 1.5, "F");

      // Highlighted text
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...COLORS.dark);
      const hlLines = doc.splitTextToSize(
        `"${highlight.text}"`,
        contentWidth - 10
      );
      for (const line of hlLines) {
        checkPageBreak(5);
        doc.text(line, margin + 7, y);
        y += 4;
      }

      // Reason
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      const reasonLines = doc.splitTextToSize(
        `Reason: ${highlight.reason}`,
        contentWidth - 10
      );
      for (const line of reasonLines) {
        checkPageBreak(5);
        doc.text(line, margin + 7, y);
        y += 3.5;
      }
      y += 3;
    }
  }

  // =====================================================
  // EXTRACTED FIELDS
  // =====================================================
  if (result.extracted_fields && result.extracted_fields.length > 0) {
    drawSectionTitle("Extracted Fields");

    // Table header
    checkPageBreak(10);
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y - 4, contentWidth, 7, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.white);
    doc.text("Field Name", margin + 3, y);
    doc.text("Value", margin + 55, y);
    doc.text("Confidence", margin + contentWidth - 25, y);
    y += 6;

    // Table rows
    for (let i = 0; i < result.extracted_fields.length; i++) {
      const field = result.extracted_fields[i];
      checkPageBreak(10);

      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y - 3.5, contentWidth, 7, "F");
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.text);
      doc.text(field.name.substring(0, 25), margin + 3, y);

      doc.setFont("helvetica", "normal");
      const valLines = doc.splitTextToSize(field.value, contentWidth - 85);
      doc.text(valLines[0] || "", margin + 55, y);

      doc.setTextColor(...getScoreColor(field.confidence));
      doc.text(`${field.confidence}%`, margin + contentWidth - 25, y);
      y += 6;

      // If value is multiline
      if (valLines.length > 1) {
        for (let j = 1; j < Math.min(valLines.length, 3); j++) {
          checkPageBreak(5);
          doc.setTextColor(...COLORS.text);
          doc.text(valLines[j], margin + 55, y);
          y += 4;
        }
      }
    }
  }

  // =====================================================
  // QUESTIONS & CLARIFICATIONS
  // =====================================================
  if (result.questions && result.questions.length > 0) {
    drawSectionTitle("Questions & Clarifications");

    for (let i = 0; i < result.questions.length; i++) {
      const question = result.questions[i];
      checkPageBreak(16);

      // Priority badge color
      const prColor =
        question.priority === "critical"
          ? COLORS.red
          : question.priority === "important"
            ? COLORS.orange
            : COLORS.blue;
      doc.setFillColor(...prColor);
      doc.roundedRect(margin, y - 3, 2, 5, 0.5, 0.5, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
      doc.text(`Q${i + 1}:`, margin + 5, y);

      doc.setFont("helvetica", "normal");
      const qLines = doc.splitTextToSize(question.text, contentWidth - 18);
      for (const line of qLines) {
        checkPageBreak(5);
        doc.text(line, margin + 14, y);
        y += 4;
      }

      // Tags
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.text(
        `Priority: ${question.priority} | Category: ${question.category}`,
        margin + 14,
        y
      );
      y += 4;

      if (question.suggested_action) {
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...COLORS.primary);
        const actionLines = doc.splitTextToSize(
          `Action: ${question.suggested_action}`,
          contentWidth - 18
        );
        for (const line of actionLines) {
          checkPageBreak(5);
          doc.text(line, margin + 14, y);
          y += 3.5;
        }
      }
      y += 3;
    }
  }

  // =====================================================
  // DISCLAIMER
  // =====================================================
  drawSectionTitle("Important Disclaimer");
  drawWrappedText(
    "This report is generated automatically by an AI system and may contain errors, omissions, or misinterpretations. It is provided for informational purposes only and does not constitute legal, compliance, financial, or risk advice. You remain responsible for independently reviewing all documents, validating findings, and making final decisions based on appropriate professional judgment.",
    margin,
    8,
    COLORS.muted
  );
  y += 4;
  drawWrappedText(
    "Do not rely on this report as a substitute for human review by qualified professionals.",
    margin,
    8,
    COLORS.muted
  );

  // =====================================================
  // FOOTER ON ALL PAGES
  // =====================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `RiskRead AI - Document Risk Analysis Report`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      {
        align: "right",
      }
    );

    // Thin line above footer
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
  }

  // =====================================================
  // SAVE
  // =====================================================
  doc.save(exportFileName);
}
