import { z } from "zod";

// Payment plan statuses
export const paymentPlanStatuses = [
  "active",
  "completed",
  "defaulted",
  "cancelled",
] as const;
export type PaymentPlanStatus = (typeof paymentPlanStatuses)[number];

// Installment statuses
export const installmentStatuses = [
  "pending",
  "partial",
  "paid",
  "overdue",
  "waived",
] as const;
export type InstallmentStatus = (typeof installmentStatuses)[number];

// Amount validation
export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Montant invalide")
  .refine((val) => Number.parseFloat(val) > 0, "Le montant doit être positif");

// Schedule item schema (for templates)
export const scheduleItemSchema = z.object({
  number: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  dueDaysFromStart: z.number().int().min(0),
  label: z.string().min(1).max(50),
});

// Base payment plan template schema (without refinements to allow .partial())
export const paymentPlanTemplateBaseSchema = z.object({
  schoolYearId: z.string().min(1, "Année scolaire requise"),
  name: z.string().min(1, "Nom requis").max(100),
  nameEn: z.string().max(100).optional(),
  installmentsCount: z.number().int().min(1).max(12),
  schedule: z.array(scheduleItemSchema).min(1, "Au moins un versement requis"),
  isDefault: z.boolean().default(false),
});

// Create payment plan template schema
export const createPaymentPlanTemplateSchema =
  paymentPlanTemplateBaseSchema.refine(
    (data) => {
      const totalPercentage = data.schedule.reduce(
        (sum, item) => sum + item.percentage,
        0,
      );
      return Math.abs(totalPercentage - 100) < 0.01;
    },
    {
      message: "Le total des pourcentages doit être égal à 100%",
      path: ["schedule"],
    },
  );

export type CreatePaymentPlanTemplateInput = z.infer<
  typeof createPaymentPlanTemplateSchema
>;

// Update payment plan template schema
export const updatePaymentPlanTemplateSchema = paymentPlanTemplateBaseSchema
  .partial()
  .extend({
    id: z.string().min(1),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine(
    (data) => {
      if (!data.schedule) return true;
      const totalPercentage = data.schedule.reduce(
        (sum, item) => sum + item.percentage,
        0,
      );
      return Math.abs(totalPercentage - 100) < 0.01;
    },
    {
      message: "Le total des pourcentages doit être égal à 100%",
      path: ["schedule"],
    },
  );

export type UpdatePaymentPlanTemplateInput = z.infer<
  typeof updatePaymentPlanTemplateSchema
>;

// Create payment plan from template schema
export const createPaymentPlanFromTemplateSchema = z.object({
  studentId: z.string().min(1, "Élève requis"),
  schoolYearId: z.string().min(1, "Année scolaire requise"),
  templateId: z.string().min(1, "Modèle requis"),
  totalAmount: amountSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide"),
  notes: z.string().max(500).optional(),
});

export type CreatePaymentPlanFromTemplateInput = z.infer<
  typeof createPaymentPlanFromTemplateSchema
>;

// Payment plan status labels (French)
export const paymentPlanStatusLabels: Record<PaymentPlanStatus, string> = {
  active: "Actif",
  completed: "Terminé",
  defaulted: "En défaut",
  cancelled: "Annulé",
};

// Installment status labels (French)
export const installmentStatusLabels: Record<InstallmentStatus, string> = {
  pending: "En attente",
  partial: "Partiel",
  paid: "Payé",
  overdue: "En retard",
  waived: "Exonéré",
};
