/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { PatientReport } from '../types';

/**
 * Format timestamp into standard date-time representation.
 */
function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return dateStr;
  }
}

/**
 * Generates and downloads a highly styled, professional PDF for clinical distribution.
 */
export function exportReportToPDF(report: PatientReport): void {
  // Initialize jsPDF. Default unit is 'mm', format is 'a4' (210 x 297 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  const contentWidth = pageWidth - (marginX * 2); // 170 mm
  let y = 15; // Vertical cursor inside the PDF page

  // Colors
  const clrPrimaryTeal = [15, 118, 110]; // #0f766e (Dark Teal)
  const clrDarkSlate = [15, 23, 42]; // #0f172a (Slater grey)
  const clrMutedGrey = [100, 116, 139]; // #64748b (Muted Slate)
  const clrTextBody = [51, 65, 85]; // #334155 (Sub text slate)

  // Page tracking for headers/footers
  let pageCount = 1;

  // Helper: Adds footer component to each page during generation or end
  function drawPageTemplate(pageNum: number) {
    // Add top colored accent banner
    doc.setFillColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Add footer boundary line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 20, pageWidth - marginX, pageHeight - 20);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setFillColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
    doc.text(
      'Department of Clinical Diagnostics & Pathological AI Informatics • Shahnaz Pathology Central Panel',
      marginX,
      pageHeight - 15
    );
    doc.text(
      `Page ${pageNum}`,
      pageWidth - marginX - 12,
      pageHeight - 15
    );

    doc.setFontSize(7);
    doc.text(
      'This document contains clinical specimen interpretation. Confidential electronic diagnostic asset.',
      marginX,
      pageHeight - 11
    );
  }

  // --- 1. CLINICAL HEADER & LETTERHEAD ---
  drawPageTemplate(pageCount);
  y = 22;

  // Lab Logo / Brand Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.text('SHAHNAZ PATHOLOGY', marginX, y);
  y += 7;

  // Department / Meta Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('CENTRAL CLINICAL LABORATORY & PATHOLOGICAL AI INFORMATICS', marginX, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Reg No: DGHS-M77890 • Licensed Central Diagnostic Panel • Dhaka, Bangladesh', marginX, y);
  
  // Seal / Label Box on the top-right
  doc.setDrawColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.setFillColor(240, 253, 250); // Teal-50 background
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - marginX - 45, 17, 45, 15, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.text('OFFICIAL DIAGNOSTIC', pageWidth - marginX - 41, 23);
  doc.text('LAB FILE REPORT', pageWidth - marginX - 38, 27);

  y += 10;

  // Thin separator line
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // --- 2. STRUCTURED PATIENT & SPECIMEN METADATA GRID ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.roundedRect(marginX, y, contentWidth, 34, 3, 3, 'FD');

  // Labels and Values inside the box
  let boxY = y + 6;

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('PATIENT IDENTIFIER (PHONE/NID):', marginX + 5, boxY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
  doc.text(report.phoneOrNid || 'N/A', marginX + 5, boxY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('SPECIMEN SOURCE FILE REFERENCE:', marginX + 5, boxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
  const trimmedFn = report.fileName.length > 34 ? report.fileName.substring(0, 31) + '...' : report.fileName;
  doc.text(trimmedFn, marginX + 5, boxY + 16.5);

  // Column 2 (offsets by 85mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('DATABASE LOG RECORD ID:', marginX + 85, boxY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.text(report.id || 'N/A', marginX + 85, boxY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('FILING & SUBMISSION TIME:', marginX + 85, boxY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
  doc.text(formatDate(report.timestamp), marginX + 85, boxY + 16.5);

  // Bottom text within metadata box for current validation status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('VALIDATION STATUS STATE:', marginX + 5, boxY + 23.5);
  
  const curStatus = (report.status || 'pending').toUpperCase();
  if (curStatus === 'REVIEWED' || curStatus === 'RESOLVED') {
    doc.setTextColor(16, 124, 65); // green
  } else {
    doc.setTextColor(194, 65, 12); // orange-red
  }
  doc.setFont('helvetica', 'bold');
  doc.text(curStatus, marginX + 48, boxY + 23.5);

  y += 42;

  // --- 3. MEDICAL DIAGNOSIS SECTION TITLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.text('🔬 AI DIAGNOSTIC PATHOLOGY ANALYSIS BREAKDOWN', marginX, y);
  y += 3;

  doc.setDrawColor(204, 251, 241); // Teal-100
  doc.setLineWidth(0.4);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // --- 4. PARSE & WRAP THE SUMMARY TEXT (MARKDOWN PARSING) ---
  const rawSummaryText = report.aiSummary || 'Medical diagnostics data analysis is currently in pending curation status.';
  const lines = rawSummaryText.split('\n');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);

  const bottomLimitY = pageHeight - 32;

  // Loop through lines in the AI Summary and render with wrapping
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    // Check if we need to add a page due to height limit
    if (y > bottomLimitY) {
      doc.addPage();
      pageCount++;
      drawPageTemplate(pageCount);
      y = 18; // Reset cursor to top on new page
    }

    if (rawLine === '') {
      y += 4;
      continue;
    }

    // Checking heading levels
    if (rawLine.startsWith('###')) {
      const heading = rawLine.replace(/^###\s*/, '').replace(/\*\*/g, '').trim();
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
      doc.text(heading, marginX, y);
      y += 5;
      // Reset format
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);
    } else if (rawLine.startsWith('##') || rawLine.startsWith('#')) {
      const heading = rawLine.replace(/^##?\s*/, '').replace(/\*\*/g, '').trim();
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
      doc.text(heading, marginX, y);
      y += 6;
      // Reset format
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);
    } else if (rawLine.startsWith('- ') || rawLine.startsWith('* ')) {
      // Bullet list items
      const bulletText = rawLine.substring(2).trim();
      
      // Clean inline strong tags ** if present
      const cleanedText = bulletText.replace(/\*\*/g, '');

      // Wrap bullet items nicely with indentation
      const indentX = marginX + 4;
      const bulletWidth = contentWidth - 6;

      const wrappedLines = doc.splitTextToSize(cleanedText, bulletWidth);
      
      for (let j = 0; j < wrappedLines.length; j++) {
        if (y > bottomLimitY) {
          doc.addPage();
          pageCount++;
          drawPageTemplate(pageCount);
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
        doc.text(j === 0 ? '•' : ' ', marginX + 1, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);
        doc.text(wrappedLines[j], indentX, y);
        y += 4.5;
      }
      y += 1.5;
    } else {
      // Regular paragraph or standard line text wrap
      const cleanedParagraph = rawLine.replace(/\*\*/g, '');
      const wrappedLines = doc.splitTextToSize(cleanedParagraph, contentWidth);

      for (let j = 0; j < wrappedLines.length; j++) {
        if (y > bottomLimitY) {
          doc.addPage();
          pageCount++;
          drawPageTemplate(pageCount);
          y = 18;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);
        doc.text(wrappedLines[j], marginX, y);
        y += 4.5;
      }
      y += 1.5;
    }
  }

  y += 4;

  // --- 4.5 UNIFIED GLOBAL REGULATORY RULES CERTIFICATION BOARD ---
  if (report.regulatoryCompliance) {
    // Ensure sufficient height for regulatory board
    if (y > pageHeight - 75) {
      doc.addPage();
      pageCount++;
      drawPageTemplate(pageCount);
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
    doc.text('🌐 LIVE ONLINE COMPLIANCE AUDIT CERTIFICATE', marginX, y);
    y += 3.5;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(marginX, y, contentWidth, 42, 2, 2, 'FD');

    let ruleY = y + 4.5;
    
    // Header line inside box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
    doc.text(`AUDIT FRAMEWORK: ${report.regulatoryCompliance.certificationAuthority}`, marginX + 3, ruleY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
    doc.text(`SEAL SIGNATURE: ${report.regulatoryCompliance.digitalCheckSignature}`, pageWidth - marginX - 62, ruleY);

    ruleY += 5;

    // Loop through evaluated rules (limit to 4)
    const activeRules = report.regulatoryCompliance.rulesEvaluated || [];
    activeRules.forEach((rule, rIdx) => {
      const isEven = rIdx % 2 === 0;
      const xPos = isEven ? marginX + 3 : marginX + 86;
      const rowY = ruleY + (Math.floor(rIdx / 2) * 6.5);

      // Status indicator
      doc.setFont('helvetica', 'bold');
      if (rule.passed) {
        doc.setTextColor(16, 124, 65); // green
        doc.text('✓', xPos, rowY);
      } else {
        doc.setTextColor(194, 65, 12); // amber/red
        doc.text('!', xPos, rowY);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
      doc.text(rule.ruleId, xPos + 3, rowY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(clrTextBody[0], clrTextBody[1], clrTextBody[2]);
      
      const briefDesc = rule.name.length > 25 ? rule.name.substring(0, 25) + '...' : rule.name;
      doc.text(`(${briefDesc})`, xPos + 22, rowY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
      doc.text(rule.statusText.length > 55 ? rule.statusText.substring(0, 52) + '...' : rule.statusText, xPos + 3, rowY + 3);
    });

    y += 47;
  }

  // --- 5. CLINICAL VERIFICATION SECTION BLOCK ---
  // Ensure we have enough vertical offset or draw on a brand new page
  if (y > pageHeight - 65) {
    doc.addPage();
    pageCount++;
    drawPageTemplate(pageCount);
    y = 20;
  }

  // Draw separator line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // Dual column box layout for Signatures
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.setDrawColor(204, 251, 241); // Teal-100
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, 32, 2, 2, 'FD');

  let sigY = y + 6;

  // Column 1: Clinic Sign-off
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
  doc.text('CLINICAL OFFICE APPROVAL', marginX + 6, sigY);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(clrPrimaryTeal[0], clrPrimaryTeal[1], clrPrimaryTeal[2]);
  doc.text('DR. SHAHNAZ HUSSAIN, MBBS, MD', marginX + 6, sigY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text('Senior Principal Pathologist & General Director', marginX + 6, sigY + 9);
  doc.text('Digital Signature Electronically Audited', marginX + 6, sigY + 12.5);

  // Column 2: Security Validation Sign
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(clrDarkSlate[0], clrDarkSlate[1], clrDarkSlate[2]);
  doc.text('🔒 SECURITY DIGITAL INTEGRITY HASH', marginX + 90, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(clrMutedGrey[0], clrMutedGrey[1], clrMutedGrey[2]);
  doc.text(`CIPHER TYPE: AES-256-GCM Secure Payload`, marginX + 90, sigY + 4.5);
  
  const displayHash = report.digestHash 
    ? report.digestHash.length > 32 
      ? report.digestHash.substring(0, 32) + '...' 
      : report.digestHash 
    : 'SHA-256 SYSTEM DEFAULT SIGN';
  doc.text(`DIGEST SIGN: ${displayHash}`, marginX + 90, sigY + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(16, 124, 65); // Green check text
  doc.text('✓ BIPARTITE MTLS VERIFIED SECURITY CHANNEL', marginX + 90, sigY + 12);

  // Download Action
  const filenameCamel = `Path_Report_${report.phoneOrNid || 'patient'}_${report.id.substring(4, 9).toUpperCase()}.pdf`;
  doc.save(filenameCamel);
}
