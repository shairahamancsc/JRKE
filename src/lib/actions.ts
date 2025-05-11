
"use server";

import { generateAttendanceReport as genAttendanceReportFlow, GenerateAttendanceReportInput } from '@/ai/flows/generate-attendance-report';
import { summarizeAdvancePayments as summarizeAdvancePaymentsFlow, SummarizeAdvancePaymentsInput } from '@/ai/flows/summarize-advance-payments.ts';

export async function generateAttendanceReportAction(input: GenerateAttendanceReportInput) {
  try {
    const result = await genAttendanceReportFlow(input);
    return { success: true, report: result.report };
  } catch (error) {
    console.error("Error generating attendance report:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function summarizeAdvancePaymentsAction(input: SummarizeAdvancePaymentsInput) {
  try {
    const result = await summarizeAdvancePaymentsFlow(input);
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error summarizing advance payments:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
