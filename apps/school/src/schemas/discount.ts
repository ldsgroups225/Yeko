import { z } from "zod";

// Discount types
export const discountTypes = [
  "sibling",
  "scholarship",
  "staff",
  "early_payment",
  "financial_aid",
  "other",
] as const;
export type DiscountType = (typeof discountTypes)[number];

// Calculation types
export const calculationTypes = ["percentage", "fixed"] as const;
export type CalculationType = (typeof calculationTypes)[number];

// Discount status
export const discountStatuses = ["active", "inactive"] as const;
export type DiscountStatus = (typeof discountStatuses)[number];

// Base discount schema (without refinements to allow .partial())
export const discountBaseSchema = z.object({
  code: z.string().min(1, "Code requis").max(20, "Code trop long"),
  name: z.string().min(1, "Nom requis").max(100, "Nom trop long"),
  nameEn: z.string().max(100).optional(),
  type: z.enum(discountTypes, { message: "Type de réduction invalide" }),
  calculationType: z.enum(calculationTypes, {
    message: "Type de calcul invalide",
  }),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valeur invalide"),
  appliesToFeeTypes: z.array(z.string()).optional(),
  maxDiscountAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .nullable(),
  requiresApproval: z.boolean().default(false),
  autoApply: z.boolean().default(false),
  validFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
});

// Create discount schema
export const createDiscountSchema = discountBaseSchema.refine(
  (data) =>
    data.calculationType !== "percentage" ||
    Number.parseFloat(data.value) <= 100,
  { message: "Le pourcentage ne peut pas dépasser 100%", path: ["value"] },
);

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>;

// Update discount schema
export const updateDiscountSchema = discountBaseSchema
  .partial()
  .extend({
    id: z.string().min(1),
    status: z.enum(discountStatuses).optional(),
  })
  .refine(
    (data) => {
      if (data.calculationType === "percentage" && data.value) {
        return Number.parseFloat(data.value) <= 100;
      }
      return true;
    },
    { message: "Le pourcentage ne peut pas dépasser 100%", path: ["value"] },
  );

export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>;

// Discount type labels (French)
export const discountTypeLabels: Record<DiscountType, string> = {
  sibling: "Réduction fratrie",
  scholarship: "Bourse",
  staff: "Personnel",
  early_payment: "Paiement anticipé",
  financial_aid: "Aide financière",
  other: "Autre",
};

// Calculation type labels (French)
export const calculationTypeLabels: Record<CalculationType, string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
};
