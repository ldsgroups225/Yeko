/**
 * Coefficient Management Constants
 * Centralized configuration for coefficient-related features
 */

export const COEFFICIENT_LIMITS = {
  MIN: 0,
  MAX: 20,
  DEFAULT: 5,
} as const

export const COEFFICIENT_QUERY_LIMITS = {
  MIN: 1,
  MAX: 200,
  DEFAULT: 100,
} as const

export const COEFFICIENT_WARNINGS = {
  ZERO_COEFFICIENT: 'Un coefficient de 0 peut affecter le calcul des moyennes',
  DUPLICATE_COEFFICIENT: 'Un coefficient existe déjà pour cette configuration',
  MISSING_COEFFICIENT: 'Aucun coefficient défini pour cette matière',
} as const

export const COEFFICIENT_MESSAGES = {
  CREATED: 'Coefficient créé avec succès',
  UPDATED: 'Coefficient mis à jour avec succès',
  DELETED: 'Coefficient supprimé avec succès',
  BULK_UPDATED: 'Coefficients mis à jour avec succès',
  COPIED: 'Coefficients copiés avec succès',
  ERROR_CREATE: 'Erreur lors de la création du coefficient',
  ERROR_UPDATE: 'Erreur lors de la mise à jour du coefficient',
  ERROR_DELETE: 'Erreur lors de la suppression du coefficient',
  ERROR_BULK_UPDATE: 'Erreur lors de la mise à jour des coefficients',
  ERROR_COPY: 'Erreur lors de la copie des coefficients',
  ERROR_DUPLICATE: 'Un coefficient existe déjà pour cette configuration',
} as const

export const COEFFICIENT_VIEW_MODES = {
  MATRIX: 'matrix',
  LIST: 'list',
} as const

export type CoefficientViewMode = typeof COEFFICIENT_VIEW_MODES[keyof typeof COEFFICIENT_VIEW_MODES]
