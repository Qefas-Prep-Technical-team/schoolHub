import { z } from "zod";

export const setupBankSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  business_email: z.string().email().optional().or(z.literal("")),
  settlement_bank: z.string().min(1, "Settlement bank code is required"),
  bank_name: z.string().optional(),
  account_number: z
    .string()
    .regex(/^\d{10}$/, "Account number must be exactly 10 digits"),
  percentage_charge: z.number().min(0).max(100).default(0),
  addedByName: z.string().optional(),
  addedByEmail: z.string().optional(),
  addedByRole: z.string().optional(),
});

export const resolveAccountSchema = z.object({
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
  bankCode: z.string().min(1, "Bank code is required"),
});

export const recordManualPaymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  parentId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentType: z.string().optional(),
  paymentMethod: z.string().optional(),
  term: z.string().optional(),
  session: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const initiatePaymentSchema = z.object({
  schoolId: z.string().min(1, "schoolId is required"),
  studentId: z.string().min(1, "studentId is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  term: z.string().optional(),
  session: z.string().optional(),
  paymentType: z.string().optional(),
});

export const initiateTranscriptPaymentSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  sessionId: z.string().optional(),
  term: z.string().optional(),
  amount: z.coerce.number().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});

export const emailTranscriptPassSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  schoolId: z.string().min(1, "schoolId is required"),
  email: z.string().email().optional().or(z.literal("")),
  token: z.string().optional(),
  reference: z.string().optional(),
});

