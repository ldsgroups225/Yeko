// Staff positions
export const STAFF_POSITIONS = {
  ACADEMIC_COORDINATOR: 'academic_coordinator',
  DISCIPLINE_OFFICER: 'discipline_officer',
  ACCOUNTANT: 'accountant',
  CASHIER: 'cashier',
  REGISTRAR: 'registrar',
  OTHER: 'other',
} as const

export type StaffPosition = typeof STAFF_POSITIONS[keyof typeof STAFF_POSITIONS]

// Position labels for display (i18n keys)
export const POSITION_LABELS: Record<StaffPosition, string> = {
  [STAFF_POSITIONS.ACADEMIC_COORDINATOR]: 'hr.positions.academic_coordinator',
  [STAFF_POSITIONS.DISCIPLINE_OFFICER]: 'hr.positions.discipline_officer',
  [STAFF_POSITIONS.ACCOUNTANT]: 'hr.positions.accountant',
  [STAFF_POSITIONS.CASHIER]: 'hr.positions.cashier',
  [STAFF_POSITIONS.REGISTRAR]: 'hr.positions.registrar',
  [STAFF_POSITIONS.OTHER]: 'hr.positions.other',
}
