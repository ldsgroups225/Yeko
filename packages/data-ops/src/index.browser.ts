/**
 * Client-safe exports for @repo/data-ops
 *
 * This file exports ONLY types and schemas that can be safely used
 * in browser/client code. It does NOT export any query functions
 * or database setup code that would pull in Node.js-only dependencies
 * like 'pg', 'events', or 'Buffer'.
 *
 * Usage in client code:
 *   import type { School, Grade, Subject } from '@repo/data-ops/types'
 *   import { hasPermission } from '@repo/data-ops/types'
 */

// Auth permissions (no database dependency)
export * from './auth/permissions'

// Schema types from drizzle (re-export everything - types are safe)
export * from './drizzle/auth-schema'
export * from './drizzle/core-schema'
export * from './drizzle/school-schema'
export * from './drizzle/support-schema'

// Storage - Client-safe pieces
export {
  isR2Configured,
  isValidFileSize,
  isValidImageType,
} from './storage'
export type { PresignedUrlOptions, PresignedUrlResult, R2Config } from './storage'

// Server-only functions used in server functions (Tanstack Start)
// These must be exported to satisfy the bundler's named export check in the browser context,
// but they only contain stubs as they are never actually called in the client bundle.
// Attendance
export const bulkUpsertClassAttendance = undefined as any
export const countStudentAbsences = undefined as any
export const deleteStudentAttendance = undefined as any
export const excuseStudentAbsence = undefined as any
export const getAttendanceSettings = undefined as any
export const getAttendanceStatistics = undefined as any
export const getClassAttendance = undefined as any
export const getStudentAttendanceHistory = undefined as any
export const markParentNotified = undefined as any
export const upsertStudentAttendance = undefined as any
export const deleteAttendanceSettings = undefined as any
export const upsertAttendanceSettings = undefined as any

// Teacher Attendance
export const bulkUpsertTeacherAttendance = undefined as any
export const countTeacherLatenessInMonth = undefined as any
export const deleteTeacherAttendance = undefined as any
export const getDailyTeacherAttendance = undefined as any
export const getTeacherAttendanceRange = undefined as any
export const getTeacherPunctualityReport = undefined as any
export const upsertTeacherAttendance = undefined as any

// Attendance Alerts
export const acknowledgeAlert = undefined as any
export const dismissAlert = undefined as any
export const getActiveAlerts = undefined as any
export const getAlerts = undefined as any
export const resolveAlert = undefined as any

// Storage server-side functions used in client-facing server functions
export const generatePresignedUploadUrl = undefined as any
export const getR2Client = undefined as any
export const getR2Config = undefined as any
export const getR2Endpoint = undefined as any
export const initR2 = undefined as any

// Conduct Records
export const addConductFollowUp = undefined as any
export const completeFollowUp = undefined as any
export const createConductRecord = undefined as any
export const deleteConductRecord = undefined as any
export const deleteFollowUp = undefined as any
export const getConductRecord = undefined as any
export const getConductRecords = undefined as any
export const getStudentConductSummary = undefined as any
export const markConductParentAcknowledged = undefined as any
export const markConductParentNotified = undefined as any
export const updateConductRecord = undefined as any
export const updateConductStatus = undefined as any

// Report Cards
export const generateReportCard = undefined as any
export const getReportCard = undefined as any
export const getReportCards = undefined as any
export const getReportCardsByStudentIds = undefined as any
export const publishReportCard = undefined as any

// Accounts
export const createAccount = undefined as any
export const deleteAccount = undefined as any
export const getAccount = undefined as any
export const getAccountById = undefined as any
export const getAccounts = undefined as any
export const getAccountsTree = undefined as any
export const updateAccount = undefined as any

// Payment Plans
export const cancelPaymentPlan = undefined as any
export const createPaymentPlanFromTemplate = undefined as any
export const createPaymentPlanTemplate = undefined as any
export const deletePaymentPlanTemplate = undefined as any
export const getDefaultPaymentPlanTemplate = undefined as any
export const getInstallmentsByPaymentPlan = undefined as any
export const getPaymentPlanById = undefined as any
export const getPaymentPlanForStudent = undefined as any
export const getPaymentPlans = undefined as any
export const getPaymentPlansSummary = undefined as any
export const getPaymentPlanTemplateById = undefined as any
export const getPaymentPlanTemplates = undefined as any
export const setDefaultPaymentPlanTemplate = undefined as any
export const updatePaymentPlanTemplate = undefined as any

// Fee Types
export const createFeeType = undefined as any
export const deleteFeeType = undefined as any
export const getFeeTypeById = undefined as any
export const getFeeTypes = undefined as any
export const updateFeeType = undefined as any

// Fee Structures
export const createFeeStructure = undefined as any
export const createFeeStructuresBulk = undefined as any
export const deleteFeeStructure = undefined as any
export const getFeeStructureById = undefined as any
export const getFeeStructures = undefined as any
export const getFeeStructuresWithTypes = undefined as any
export const updateFeeStructure = undefined as any

// Discounts
export const createDiscount = undefined as any
export const deactivateDiscount = undefined as any
export const deleteDiscount = undefined as any
export const getAutoApplyDiscounts = undefined as any
export const getDiscountById = undefined as any
export const getDiscounts = undefined as any
export const updateDiscount = undefined as any

// Schools
export const createSchool = undefined as any
export const getSchool = undefined as any
export const getSchoolById = undefined as any
export const getSchools = undefined as any
export const getSchoolProfile = undefined as any
export const updateSchool = undefined as any
export const updateSchoolLogo = undefined as any
export const updateSchoolProfile = undefined as any
export const updateSchoolSettings = undefined as any
export const deleteSchool = undefined as any
export const bulkCreateSchools = undefined as any

// Students & Classes
export const getStudent = undefined as any
export const getStudents = undefined as any
export const getClass = undefined as any
export const getClasses = undefined as any

// Teacher Subjects
export const assignSubjectsToTeacher = undefined as any
export const getTeacherSubjects = undefined as any
export const removeSubjectsFromTeacher = undefined as any

// Student Fees
export const createStudentFee = undefined as any
export const createStudentFeesBulk = undefined as any
export const getStudentFeeById = undefined as any
export const getStudentFees = undefined as any
export const getStudentFeeSummary = undefined as any
export const getStudentFeesWithDetails = undefined as any
export const getStudentsWithOutstandingBalance = undefined as any
export const waiveStudentFee = undefined as any

// Refunds
export const approveRefund = undefined as any
export const cancelRefund = undefined as any
export const createRefund = undefined as any
export const getPendingRefundsCount = undefined as any
export const getRefundById = undefined as any
export const getRefunds = undefined as any
export const processRefund = undefined as any
export const rejectRefund = undefined as any

// Payments
export const cancelPayment = undefined as any
export const createPaymentWithAllocations = undefined as any
export const getCashierDailySummary = undefined as any
export const getPaymentById = undefined as any
export const getPaymentByReceiptNumber = undefined as any
export const getPayments = undefined as any

// Roles & Users (Core App)
export const getAllRoles = undefined as any
export const createRole = undefined as any
export const updateRole = undefined as any
export const deleteRole = undefined as any
export const countSystemUsers = undefined as any
export const getSystemUsers = undefined as any
export const updateSystemUser = undefined as any
export const assignSystemRolesToUser = undefined as any
export const getUserSystemPermissionsByAuthUserId = undefined as any
export const getUserSystemRolesByAuthUserId = undefined as any
export const syncUserAuthOnLogin = undefined as any

// Coefficients
export const getCoefficientTemplates = undefined as any
export const getCoefficientTemplateById = undefined as any
export const createCoefficientTemplate = undefined as any
export const updateCoefficientTemplate = undefined as any
export const deleteCoefficientTemplate = undefined as any
export const bulkCreateCoefficients = undefined as any
export const bulkUpdateCoefficients = undefined as any
export const copyCoefficientTemplates = undefined as any
export const getCoefficientStats = undefined as any

// Analytics
export const getAnalyticsOverview = undefined as any
export const getSchoolsPerformance = undefined as any
export const getPlatformUsage = undefined as any
export const generateReportData = undefined as any

// Programs
export const getSchoolYearTemplates = undefined as any
export const getSchoolYearTemplateById = undefined as any
export const createSchoolYearTemplate = undefined as any
export const updateSchoolYearTemplate = undefined as any
export const deleteSchoolYearTemplate = undefined as any
export const getProgramTemplates = undefined as any
export const getProgramTemplateById = undefined as any
export const createProgramTemplate = undefined as any
export const updateProgramTemplate = undefined as any
export const deleteProgramTemplate = undefined as any
export const cloneProgramTemplate = undefined as any
export const getProgramTemplatesWithTerms = undefined as any
export const getProgramTemplateChapters = undefined as any
export const getProgramTemplateChapterById = undefined as any
export const createProgramTemplateChapter = undefined as any
export const updateProgramTemplateChapter = undefined as any
export const deleteProgramTemplateChapter = undefined as any
export const bulkUpdateChaptersOrder = undefined as any
export const bulkCreateChapters = undefined as any
export const publishProgram = undefined as any
export const getProgramVersions = undefined as any
export const restoreProgramVersion = undefined as any
export const getProgramStats = undefined as any
export const getTermTemplates = undefined as any
export const getTermTemplateById = undefined as any
export const createTermTemplate = undefined as any
export const updateTermTemplate = undefined as any
export const deleteTermTemplate = undefined as any
export const bulkCreateTermTemplates = undefined as any
export const getSchoolYearTemplatesWithTerms = undefined as any

// Drizzle ORM operators - stubs for browser bundle
// These are server-only but must be exported to satisfy bundler analysis
export const and = undefined as any
export const asc = undefined as any
export const between = undefined as any
export const count = undefined as any
export const desc = undefined as any
export const eq = undefined as any
export const exists = undefined as any
export const gt = undefined as any
export const gte = undefined as any
export const ilike = undefined as any
export const inArray = undefined as any
export const isNotNull = undefined as any
export const isNull = undefined as any
export const like = undefined as any
export const lt = undefined as any
export const lte = undefined as any
export const ne = undefined as any
export const not = undefined as any
export const notBetween = undefined as any
export const notExists = undefined as any
export const notInArray = undefined as any
export const or = undefined as any
export const sql = undefined as any
