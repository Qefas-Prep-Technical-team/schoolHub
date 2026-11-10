"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generatePDF } from "@/utils/pdfGenerator";
import { isSchoolOnPayingPlan } from "@/utils/subscriptionPlanCheck";
import {
  getMonthlyExportUsage,
  incrementMonthlyExportUsage,
  FREE_TIER_MONTHLY_EXPORT_LIMIT,
} from "@/utils/exportQuotaManager";
import { dispatchExportLeadershipNotification } from "@/lib/api/services/exportNotificationService";
import { resolveDigitalSignatures } from "@/app/dashboard/admin/grades/utils/signatureResolver";
import { ExportQuotaBanner } from "@/app/dashboard/admin/grades/components/export/ExportQuotaBanner";

export interface SingleAssignmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  schoolProfile?: any;
  schoolId?: string;
  studentName?: string;
  className?: string;
  gradeLabel?: string;
  percentage?: number | null;
}

export function SingleAssignmentExportModal({
  isOpen,
  onClose,
  assignment,
  schoolProfile,
  schoolId,
  studentName = "Scholar",
  className = "Class Cohort",
  gradeLabel,
  percentage,
}: SingleAssignmentExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const isPaying = Boolean(
    isSchoolOnPayingPlan(schoolProfile) ||
    (schoolProfile?.plan && schoolProfile.plan.toUpperCase() !== "FREE")
  );

  const effectiveSchoolId = schoolId || schoolProfile?.id || schoolProfile?.schoolId || "";
  const quotaContextId = effectiveSchoolId || "student_single_assignment";
  const quota = getMonthlyExportUsage(quotaContextId);

  const handleExport = async () => {
    if (!isPaying && quota.remaining <= 0) {
      toast.error(
        `Monthly free export quota reached (${FREE_TIER_MONTHLY_EXPORT_LIMIT}/${FREE_TIER_MONTHLY_EXPORT_LIMIT}). Contact school administrator to upgrade institutional plan.`
      );
      return;
    }

    if (!assignment) {
      toast.warning("No assignment data available to export.");
      return;
    }

    setIsExporting(true);
    const schoolName = schoolProfile?.name || "Official Academic Institution";
    const sanitizedTitle = (assignment.title || "assignment").replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const sanitizedStudent = studentName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const sanitizedSchool = schoolName.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
    const dateStr = format(new Date(), "yyyy-MM-dd");

    try {
      const questions: any[] = assignment.questions || [];
      const answers: any[] = assignment.submissions?.[0]?.answers || [];
      const answerMap = new Map<string, string>();
      answers.forEach((ans) => {
        if (ans.questionId) answerMap.set(ans.questionId, ans.answer);
      });

      // Prepare detailed evaluation data for past-paper / review layout
      interface QuestionExportItem {
        num: number;
        question: string;
        type: string;
        options: { key: string; text: string }[];
        studentAnswer: string;
        studentAnswerDisplay: string;
        correctAnswer: string;
        correctAnswerDisplay: string;
        isCorrect: boolean | null;
        marks: number;
        earnedMarks: number;
      }

      const evaluatedItems: QuestionExportItem[] = questions.map((q, idx) => {
        const studentRaw = answerMap.get(q.id) || "";
        const correctRaw = q.correctAnswer || "";
        const marks = Number(q.marks) || 1;

        const options: { key: string; text: string }[] = [];
        if (q.type === "MULTIPLE_CHOICE") {
          if (q.optionA) options.push({ key: "A", text: q.optionA });
          if (q.optionB) options.push({ key: "B", text: q.optionB });
          if (q.optionC) options.push({ key: "C", text: q.optionC });
          if (q.optionD) options.push({ key: "D", text: q.optionD });
        } else if (q.type === "TRUE_FALSE") {
          options.push({ key: "True", text: "True" });
          options.push({ key: "False", text: "False" });
        }

        // Format student response display
        let studentDisplay = studentRaw || "Not Answered";
        if (q.type === "MULTIPLE_CHOICE" && studentRaw) {
          const matchedOpt = options.find(
            (o) => o.key.toUpperCase() === studentRaw.toUpperCase()
          );
          if (matchedOpt) {
            studentDisplay = `Option ${matchedOpt.key}: ${matchedOpt.text}`;
          }
        }

        // Format correct key display
        let correctDisplay = correctRaw || "Evaluated by Instructor";
        if (q.type === "MULTIPLE_CHOICE" && correctRaw) {
          const matchedOpt = options.find(
            (o) => o.key.toUpperCase() === correctRaw.toUpperCase()
          );
          if (matchedOpt) {
            correctDisplay = `Option ${matchedOpt.key}: ${matchedOpt.text}`;
          }
        }

        // Determine correctness
        let isCorrect: boolean | null = null;
        if (correctRaw) {
          if (!studentRaw) {
            isCorrect = false;
          } else {
            isCorrect =
              String(studentRaw).trim().toLowerCase() ===
              String(correctRaw).trim().toLowerCase();
          }
        }

        const earnedMarks = isCorrect === true ? marks : isCorrect === false ? 0 : marks;

        return {
          num: idx + 1,
          question: q.question || "—",
          type: q.type || "QUESTION",
          options,
          studentAnswer: studentRaw,
          studentAnswerDisplay: studentDisplay,
          correctAnswer: correctRaw,
          correctAnswerDisplay: correctDisplay,
          isCorrect,
          marks,
          earnedMarks,
        };
      });

      if (selectedFormat === "excel") {
        if (!isPaying) {
          toast.error("Spreadsheet exports (.xlsx) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }

        const wb = XLSX.utils.book_new();
        const rows = evaluatedItems.map((item) => {
          const optA = item.options.find((o) => o.key === "A")?.text || "—";
          const optB = item.options.find((o) => o.key === "B")?.text || "—";
          const optC = item.options.find((o) => o.key === "C")?.text || "—";
          const optD = item.options.find((o) => o.key === "D")?.text || "—";
          const statusStr =
            item.isCorrect === true
              ? "CORRECT"
              : item.isCorrect === false
                ? "INCORRECT"
                : "EVALUATED";

          return {
            "#": item.num,
            "Question Type": item.type,
            "Question Prompt": item.question,
            "Option A": optA,
            "Option B": optB,
            "Option C": optC,
            "Option D": optD,
            "Student Response": item.studentAnswerDisplay,
            "Official Answer Key": item.correctAnswerDisplay,
            "Result": statusStr,
            "Marks Earned": item.earnedMarks,
            "Max Marks": item.marks,
          };
        });

        const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{
          "Assignment Title": assignment.title,
          "Subject": assignment.subject?.name || "General",
          "Total Points": assignment.totalMarks || 100,
          "Score Achieved": assignment.grade || "0",
          "Status": assignment.status || "Submitted",
        }]);

        XLSX.utils.book_append_sheet(wb, ws, "Assignment Review");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.xlsx`);
      } else if (selectedFormat === "csv") {
        if (!isPaying) {
          toast.error("CSV exports (.csv) are only available on institutional paid plans.");
          setIsExporting(false);
          return;
        }

        const csvContent: string[] = [];
        csvContent.push(`"${schoolName.toUpperCase()}"`);
        csvContent.push(`"Assignment Task Review & Past Questions - ${assignment.title}"`);
        csvContent.push(`"Student: ${studentName}"`);
        csvContent.push(`"Class / Cohort: ${className}"`);
        csvContent.push(`"Subject: ${assignment.subject?.name || "General Coursework"}"`);
        csvContent.push(`"Score: ${assignment.grade || "0"} / ${assignment.totalMarks || 100}"`);
        csvContent.push(`"Generated on: ${dateStr}"`);
        csvContent.push("");

        if (evaluatedItems.length > 0) {
          csvContent.push(
            "#,Question Type,Question Prompt,Option A,Option B,Option C,Option D,Your Response,Official Answer Key,Result,Marks Earned,Max Marks"
          );
          evaluatedItems.forEach((item) => {
            const optA = item.options.find((o) => o.key === "A")?.text || "—";
            const optB = item.options.find((o) => o.key === "B")?.text || "—";
            const optC = item.options.find((o) => o.key === "C")?.text || "—";
            const optD = item.options.find((o) => o.key === "D")?.text || "—";
            const statusStr =
              item.isCorrect === true
                ? "CORRECT"
                : item.isCorrect === false
                  ? "INCORRECT"
                  : "EVALUATED";

            const row = [
              item.num.toString(),
              `"${item.type.replace(/"/g, '""')}"`,
              `"${item.question.replace(/"/g, '""')}"`,
              `"${optA.replace(/"/g, '""')}"`,
              `"${optB.replace(/"/g, '""')}"`,
              `"${optC.replace(/"/g, '""')}"`,
              `"${optD.replace(/"/g, '""')}"`,
              `"${item.studentAnswerDisplay.replace(/"/g, '""')}"`,
              `"${item.correctAnswerDisplay.replace(/"/g, '""')}"`,
              `"${statusStr}"`,
              item.earnedMarks.toString(),
              item.marks.toString(),
            ];
            csvContent.push(row.join(","));
          });
        }

        const csv = csvContent.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, `${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.csv`);
      } else {
        // PDF Export: Custom High-Fidelity Assessment Review Layout
        // Skips rigid table columns and renders interactive question review cards
        // matching the exact visual style of the web review interface.
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 14;
        const contentWidth = pageWidth - marginX * 2; // ~269mm in landscape A4

        const digitalSignatures = isPaying
          ? await resolveDigitalSignatures(schoolProfile, isPaying)
          : undefined;

        // Draw double borders
        const drawPageDecorations = (pageNum: number, totalPages: number) => {
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.4);
          doc.rect(8, 8, pageWidth - 16, pageHeight - 16, "S");
          doc.setDrawColor(241, 245, 249); // slate-100
          doc.setLineWidth(0.2);
          doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19, "S");

          // Footer
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(
            `${schoolName.toUpperCase()} — OFFICIAL ASSESSMENT TASK REVIEW SHEET`,
            marginX,
            pageHeight - 11
          );
          doc.text(
            `Page ${pageNum} of ${totalPages}`,
            pageWidth - marginX,
            pageHeight - 11,
            { align: "right" }
          );
        };

        // Header block
        let yPos = 16;

        // Top institutional banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.roundedRect(marginX, yPos, contentWidth, 22, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text(schoolName.toUpperCase(), marginX + 6, yPos + 8.5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(
          `ASSIGNMENT PAST QUESTION & SUBMISSION EVALUATION REVIEW — ${assignment.title.toUpperCase()}`,
          marginX + 6,
          yPos + 15.5
        );

        // Header badges on the right
        const scoreBadgeText = `Score: ${assignment.grade || "0"} / ${assignment.totalMarks || 100} pts (${percentage != null ? `${percentage}%` : "—"})`;
        doc.setFillColor(236, 72, 153); // pink-500
        doc.roundedRect(pageWidth - marginX - 70, yPos + 4.5, 64, 13, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(255, 255, 255);
        doc.text(scoreBadgeText, pageWidth - marginX - 38, yPos + 12.5, { align: "center" });

        yPos += 26;

        // Metadata ribbon
        doc.setFillColor(248, 250, 252); // slate-50
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.roundedRect(marginX, yPos, contentWidth, 12, 2, 2, "FD");

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105); // slate-600

        const metaColW = contentWidth / 4;
        doc.text(`Student:`, marginX + 4, yPos + 7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(studentName, marginX + 18, yPos + 7.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`Class:`, marginX + metaColW + 4, yPos + 7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(className, marginX + metaColW + 16, yPos + 7.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`Subject:`, marginX + metaColW * 2 + 4, yPos + 7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(assignment.subject?.name || "General Coursework", marginX + metaColW * 2 + 18, yPos + 7.5);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(71, 85, 105);
        doc.text(`Evaluated:`, marginX + metaColW * 3 + 4, yPos + 7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(`${gradeLabel || "Graded"} (${format(new Date(), "MMM d, yyyy")})`, marginX + metaColW * 3 + 20, yPos + 7.5);

        yPos += 16;

        // Render each question as a custom styled assessment card
        let currentPage = 1;
        const pageHeightsRecorded: number[] = [pageHeight];

        for (let i = 0; i < evaluatedItems.length; i++) {
          const item = evaluatedItems[i];

          // Compute prompt text wrap
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          const promptLines = doc.splitTextToSize(
            item.question,
            contentWidth - 68 // leave room for badge and question #
          );
          const promptH = Math.max(promptLines.length * 4.6, 5);

          // Compute option cards height dynamically based on option text length
          const optCardW = (contentWidth - 14) / 2; // ~127mm
          let optRowHeights: number[] = [];
          const isOptions = item.options.length > 0;

          if (isOptions) {
            const rowsCount = Math.ceil(item.options.length / 2);
            for (let r = 0; r < rowsCount; r++) {
              const opt1 = item.options[r * 2];
              const opt2 = item.options[r * 2 + 1];

              doc.setFont("helvetica", "normal");
              doc.setFontSize(8);
              // text width available inside option card (minus letter box ~10mm, minus trailing tag ~32mm, minus padding ~8mm)
              const availTextW = optCardW - 50;

              const lines1 = opt1 ? doc.splitTextToSize(opt1.text, availTextW).length : 1;
              const lines2 = opt2 ? doc.splitTextToSize(opt2.text, availTextW).length : 1;
              const maxLines = Math.max(lines1, lines2, 1);
              const rowH = Math.max(10, 5.5 + maxLines * 3.8);
              optRowHeights.push(rowH);
            }
          }

          const totalOptionsH = isOptions
            ? optRowHeights.reduce((acc, h) => acc + h + 2.5, 0)
            : 15;

          const cardH = 14 + promptH + totalOptionsH + 4;

          // Check if we need a new page
          if (yPos + cardH > pageHeight - 20) {
            doc.addPage("a4", "landscape");
            currentPage++;
            pageHeightsRecorded.push(pageHeight);
            yPos = 16;
          }

          // Card Outer Frame
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.35);
          doc.roundedRect(marginX, yPos, contentWidth, cardH, 2.5, 2.5, "FD");

          // Header inside card: Question Number + Points Badge + Outcome Badge
          let innerY = yPos + 6;

          // Question #
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(219, 39, 119); // pink-600
          doc.text(`Question #${item.num}`, marginX + 4, innerY);

          // Points Pill
          doc.setFillColor(241, 245, 249); // slate-100
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.2);
          doc.roundedRect(marginX + 36, innerY - 4, 18, 5.5, 1.5, 1.5, "FD");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          doc.text(`${item.marks} pts`, marginX + 45, innerY - 0.2, { align: "center" });

          // Outcome Badge on right
          const outcomeBadgeW = 34;
          const badgeX = pageWidth - marginX - outcomeBadgeW - 4;
          if (item.isCorrect === true) {
            doc.setFillColor(209, 250, 229); // emerald-100
            doc.setDrawColor(16, 185, 129); // emerald-500
            doc.setLineWidth(0.3);
            doc.roundedRect(badgeX, innerY - 4, outcomeBadgeW, 5.5, 1.5, 1.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(6, 95, 70); // emerald-800
            doc.text(`[✓ CORRECT]  +${item.earnedMarks} pt`, badgeX + outcomeBadgeW / 2, innerY - 0.2, { align: "center" });
          } else if (item.isCorrect === false) {
            doc.setFillColor(255, 228, 230); // rose-100
            doc.setDrawColor(244, 63, 94);  // rose-500
            doc.setLineWidth(0.3);
            doc.roundedRect(badgeX, innerY - 4, outcomeBadgeW, 5.5, 1.5, 1.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(159, 18, 57); // rose-800
            doc.text(`[✗ INCORRECT]  0 pt`, badgeX + outcomeBadgeW / 2, innerY - 0.2, { align: "center" });
          } else {
            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(148, 163, 184);
            doc.setLineWidth(0.3);
            doc.roundedRect(badgeX, innerY - 4, outcomeBadgeW, 5.5, 1.5, 1.5, "FD");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            doc.text(`[REVIEWED]  ${item.earnedMarks} pt`, badgeX + outcomeBadgeW / 2, innerY - 0.2, { align: "center" });
          }

          // Question Prompt Text
          innerY += 5.5;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(promptLines, marginX + 4, innerY);

          innerY += promptH + 2.5;

          // Render Options / Answer Cards
          if (isOptions) {
            let currentOptY = innerY;
            const rowsCount = Math.ceil(item.options.length / 2);

            for (let r = 0; r < rowsCount; r++) {
              const rowH = optRowHeights[r] || 10;
              const rowOpts = [item.options[r * 2], item.options[r * 2 + 1]];

              rowOpts.forEach((opt, colIdx) => {
                if (!opt) return;
                const optX = marginX + 4 + colIdx * (optCardW + 6);

                const isCorrectOpt =
                  item.correctAnswer &&
                  opt.key.toUpperCase() === item.correctAnswer.toUpperCase();
                const isSelectedOpt =
                  item.studentAnswer &&
                  opt.key.toUpperCase() === item.studentAnswer.toUpperCase();

                // Card styling based on accuracy
                if (isCorrectOpt) {
                  // Correct answer key: Green border and emerald fill
                  doc.setFillColor(240, 253, 244); // emerald-50
                  doc.setDrawColor(16, 185, 129); // emerald-500
                  doc.setLineWidth(0.4);
                } else if (isSelectedOpt && !isCorrectOpt) {
                  // Wrong scholar choice: Rose border and rose fill
                  doc.setFillColor(255, 241, 242); // rose-50
                  doc.setDrawColor(244, 63, 94);  // rose-500
                  doc.setLineWidth(0.4);
                } else {
                  // Neutral option
                  doc.setFillColor(248, 250, 252); // slate-50
                  doc.setDrawColor(226, 232, 240); // slate-200
                  doc.setLineWidth(0.25);
                }

                doc.roundedRect(optX, currentOptY, optCardW, rowH, 1.8, 1.8, "FD");

                // Letter badge box (A, B, C, D)
                let letterBoxBg: [number, number, number] = [241, 245, 249];
                let letterBoxText: [number, number, number] = [71, 85, 105];

                if (isSelectedOpt) {
                  letterBoxBg = [236, 72, 153]; // pink-500
                  letterBoxText = [255, 255, 255];
                } else if (isCorrectOpt) {
                  letterBoxBg = [16, 185, 129]; // emerald-500
                  letterBoxText = [255, 255, 255];
                }

                doc.setFillColor(letterBoxBg[0], letterBoxBg[1], letterBoxBg[2]);
                doc.roundedRect(optX + 2, currentOptY + 2, 6, 6, 1.2, 1.2, "F");
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(letterBoxText[0], letterBoxText[1], letterBoxText[2]);
                doc.text(opt.key, optX + 5, currentOptY + 6.2, { align: "center" });

                // Trailing indicator marker on the right of the option box
                let tagW = 0;
                if (isCorrectOpt && isSelectedOpt) {
                  doc.setFont("helvetica", "bold");
                  doc.setFontSize(7);
                  doc.setTextColor(16, 185, 129);
                  doc.text("✓ CORRECT & CHOSEN", optX + optCardW - 2.5, currentOptY + 5.5, { align: "right" });
                  tagW = 34;
                } else if (isCorrectOpt) {
                  doc.setFont("helvetica", "bold");
                  doc.setFontSize(7);
                  doc.setTextColor(16, 185, 129);
                  doc.text("✓ CORRECT KEY", optX + optCardW - 2.5, currentOptY + 5.5, { align: "right" });
                  tagW = 28;
                } else if (isSelectedOpt) {
                  doc.setFont("helvetica", "bold");
                  doc.setFontSize(7);
                  doc.setTextColor(244, 63, 94);
                  doc.text("✗ YOUR CHOICE", optX + optCardW - 2.5, currentOptY + 5.5, { align: "right" });
                  tagW = 26;
                }

                // Option text wrapped cleanly without overflowing
                doc.setFont("helvetica", isSelectedOpt || isCorrectOpt ? "bold" : "normal");
                doc.setFontSize(8);
                if (isCorrectOpt) {
                  doc.setTextColor(6, 95, 70);
                } else if (isSelectedOpt && !isCorrectOpt) {
                  doc.setTextColor(159, 18, 57);
                } else {
                  doc.setTextColor(51, 65, 85);
                }

                const maxTextWidth = optCardW - 12 - tagW - 4;
                const optLines = doc.splitTextToSize(opt.text, maxTextWidth);
                doc.text(optLines, optX + 10, currentOptY + 5.5);
              });

              currentOptY += rowH + 2.5;
            }
          } else {
            // Short answer layout
            const respBoxW = (contentWidth - 14) / 2;
            const respBoxH = 14;

            // Student Answer Box
            doc.setFillColor(255, 241, 242);
            doc.setDrawColor(244, 63, 94);
            doc.setLineWidth(0.3);
            doc.roundedRect(marginX + 4, innerY, respBoxW, respBoxH, 1.8, 1.8, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(159, 18, 57);
            doc.text("STUDENT RESPONSE:", marginX + 6, innerY + 4);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            const studentRespLines = doc.splitTextToSize(
              item.studentAnswerDisplay || "No response provided",
              respBoxW - 8
            );
            doc.text(studentRespLines, marginX + 6, innerY + 8);

            // Official Key Box
            doc.setFillColor(240, 253, 244);
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.3);
            doc.roundedRect(marginX + 8 + respBoxW, innerY, respBoxW, respBoxH, 1.8, 1.8, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(6, 95, 70);
            doc.text("OFFICIAL ANSWER KEY / CRITERIA:", marginX + 10 + respBoxW, innerY + 4);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(15, 23, 42);
            const keyLines = doc.splitTextToSize(
              item.correctAnswerDisplay || "Criteria evaluated by instructor",
              respBoxW - 8
            );
            doc.text(keyLines, marginX + 10 + respBoxW, innerY + 8);
          }

          yPos += cardH + 4;
        }

        // Signatures if space permits on the last page or add page if needed
        if (isPaying && digitalSignatures) {
          if (yPos + 24 > pageHeight - 16) {
            doc.addPage("a4", "landscape");
            currentPage++;
            yPos = 20;
          }

          const sigY = yPos + 10;
          doc.setDrawColor(148, 163, 184);
          doc.setLineWidth(0.3);
          doc.line(pageWidth - marginX - 60, sigY, pageWidth - marginX - 4, sigY);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(
            digitalSignatures?.adminTitle || "Principal / Head of Institution",
            pageWidth - marginX - 32,
            sigY + 4.5,
            { align: "center" }
          );

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(
            digitalSignatures?.adminName || schoolProfile?.principalName || "Institutional Assessment Endorsement",
            pageWidth - marginX - 32,
            sigY + 8.5,
            { align: "center" }
          );
        }

        // Apply borders & page numbers to all generated pages
        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          drawPageDecorations(p, totalPages);
        }

        doc.save(`${sanitizedSchool}_${sanitizedStudent}_${sanitizedTitle}_${dateStr}.pdf`);
      }

      if (!isPaying) {
        incrementMonthlyExportUsage(quotaContextId);
      }

      if (effectiveSchoolId) {
        dispatchExportLeadershipNotification({
          schoolId: effectiveSchoolId,
          actorName: studentName,
          actorRole: "STUDENT",
          resourceTitle: `${studentName} — ${assignment.title} Task Sheet`,
          recordCount: questions.length || 1,
          format: selectedFormat.toUpperCase() as "PDF" | "EXCEL" | "CSV",
        }).catch((err) => console.warn("Leadership audit notification error:", err));
      }

      toast.success(`Successfully exported assignment review as ${selectedFormat.toUpperCase()}!`);
      onClose();
    } catch (err: unknown) {
      console.error("Single assignment export error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate assignment export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isExporting && onClose()}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Export Assignment Task
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Download your official responses, evaluator remarks, and verified score slip.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quota Banner */}
          <ExportQuotaBanner
            isPaying={isPaying}
            used={quota.used}
            limit={FREE_TIER_MONTHLY_EXPORT_LIMIT}
            remaining={quota.remaining}
          />

          {/* Format Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedFormat("pdf")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${selectedFormat === "pdf"
                  ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20"
                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-100 dark:bg-pink-900/40 px-1.5 py-0.5 rounded">
                    Universal
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">PDF Record</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Official Task Slip</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!isPaying}
                onClick={() => isPaying && setSelectedFormat("excel")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${!isPaying
                  ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800"
                  : selectedFormat === "excel"
                    ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 cursor-pointer"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {!isPaying ? (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                      .XLSX
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Excel Sheet</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">Itemized Data</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!isPaying}
                onClick={() => isPaying && setSelectedFormat("csv")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${!isPaying
                  ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800"
                  : selectedFormat === "csv"
                    ? "border-pink-500 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 ring-2 ring-pink-500/20 cursor-pointer"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {!isPaying ? (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                      .CSV
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">CSV File</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">RFC Tabular</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span className="font-semibold">Task:</span>
            <span className="font-black text-pink-600 dark:text-pink-400 truncate max-w-[280px]">
              {assignment.title}
            </span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isExporting}
            className="w-full sm:w-auto h-11 px-5 rounded-xl text-slate-500 hover:text-slate-800 font-bold text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleExport}
            disabled={isExporting || (!isPaying && quota.remaining <= 0)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {selectedFormat.toUpperCase()}...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {selectedFormat.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

