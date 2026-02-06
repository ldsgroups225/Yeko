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
export const bulkUpsertClassAttendance = undefined as never
export const countStudentAbsences = undefined as never
export const deleteStudentAttendance = undefined as never
export const excuseStudentAbsence = undefined as never
export const getAttendanceSettings = undefined as never
export const getAttendanceStatistics = undefined as never
export const getClassAttendance = undefined as never
export const getStudentAttendanceHistory = undefined as never
export const markParentNotified = undefined as never
export const upsertStudentAttendance = undefined as never
export const deleteAttendanceSettings = undefined as never
export const upsertAttendanceSettings = undefined as never

// Teacher Attendance
export const bulkUpsertTeacherAttendance = undefined as never
export const countTeacherLatenessInMonth = undefined as never
export const deleteTeacherAttendance = undefined as never
export const getDailyTeacherAttendance = undefined as never
export const getTeacherAttendanceRange = undefined as never
export const getTeacherPunctualityReport = undefined as never
export const upsertTeacherAttendance = undefined as never

// Attendance Alerts
export const acknowledgeAlert = undefined as never
export const dismissAlert = undefined as never
export const getActiveAlerts = undefined as never
export const getAlerts = undefined as never
export const resolveAlert = undefined as never

// Storage server-side functions used in client-facing server functions
export const generatePresignedUploadUrl = undefined as never
export const getR2Client = undefined as never
export const getR2Config = undefined as never
export const getR2Endpoint = undefined as never
export const initR2 = undefined as never

// Conduct Records
export const addConductFollowUp = undefined as never
export const completeFollowUp = undefined as never
export const createConductRecord = undefined as never
export const deleteConductRecord = undefined as never
export const deleteFollowUp = undefined as never
export const getConductRecord = undefined as never
export const getConductRecords = undefined as never
export const getStudentConductSummary = undefined as never
export const markConductParentAcknowledged = undefined as never
export const markConductParentNotified = undefined as never
export const updateConductRecord = undefined as never
export const updateConductStatus = undefined as never

// Report Cards
export const generateReportCard = undefined as never
export const getReportCard = undefined as never
export const getReportCards = undefined as never
export const getReportCardsByStudentIds = undefined as never
export const publishReportCard = undefined as never

// Accounts
export const createAccount = undefined as never
export const deleteAccount = undefined as never
export const getAccount = undefined as never
export const getAccountById = undefined as never
export const getAccounts = undefined as never
export const getAccountsTree = undefined as never
export const updateAccount = undefined as never

// Payment Plans
export const cancelPaymentPlan = undefined as never
export const createPaymentPlanFromTemplate = undefined as never
export const createPaymentPlanTemplate = undefined as never
export const deletePaymentPlanTemplate = undefined as never
export const getDefaultPaymentPlanTemplate = undefined as never
export const getInstallmentsByPaymentPlan = undefined as never
export const getPaymentPlanById = undefined as never
export const getPaymentPlanForStudent = undefined as never
export const getPaymentPlans = undefined as never
export const getPaymentPlansSummary = undefined as never
export const getPaymentPlanTemplateById = undefined as never
export const getPaymentPlanTemplates = undefined as never
export const setDefaultPaymentPlanTemplate = undefined as never
export const updatePaymentPlanTemplate = undefined as never

// Fee Types
export const createFeeType = undefined as never
export const deleteFeeType = undefined as never
export const getFeeTypeById = undefined as never
export const getFeeTypes = undefined as never
export const updateFeeType = undefined as never

// Fee Structures
export const createFeeStructure = undefined as never
export const createFeeStructuresBulk = undefined as never
export const deleteFeeStructure = undefined as never
export const getFeeStructureById = undefined as never
export const getFeeStructures = undefined as never
export const getFeeStructuresWithTypes = undefined as never
export const updateFeeStructure = undefined as never

// Discounts
export const createDiscount = undefined as never
export const deactivateDiscount = undefined as never
export const deleteDiscount = undefined as never
export const getAutoApplyDiscounts = undefined as never
export const getDiscountById = undefined as never
export const getDiscounts = undefined as never
export const updateDiscount = undefined as never

// Schools
export const createSchool = undefined as never
export const getSchool = undefined as never
export const getSchoolById = undefined as never
export const getSchools = undefined as never
export const getSchoolProfile = undefined as never
export const updateSchool = undefined as never
export const updateSchoolLogo = undefined as never
export const updateSchoolProfile = undefined as never
export const updateSchoolSettings = undefined as never
export const deleteSchool = undefined as never
export const bulkCreateSchools = undefined as never

// Students & Classes
export const getStudent = undefined as never
export const getStudents = undefined as never
export const getClass = undefined as never
export const getClasses = undefined as never

// Teacher Subjects
export const assignSubjectsToTeacher = undefined as never
export const getTeacherSubjects = undefined as never
export const removeSubjectsFromTeacher = undefined as never

// Student Fees
export const createStudentFee = undefined as never
export const createStudentFeesBulk = undefined as never
export const getStudentFeeById = undefined as never
export const getStudentFees = undefined as never
export const getStudentFeeSummary = undefined as never
export const getStudentFeesWithDetails = undefined as never
export const getStudentsWithOutstandingBalance = undefined as never
export const waiveStudentFee = undefined as never

// Refunds
export const approveRefund = undefined as never
export const cancelRefund = undefined as never
export const createRefund = undefined as never
export const getPendingRefundsCount = undefined as never
export const getRefundById = undefined as never
export const getRefunds = undefined as never
export const processRefund = undefined as never
export const rejectRefund = undefined as never

// Payments
export const cancelPayment = undefined as never
export const createPaymentWithAllocations = undefined as never
export const getCashierDailySummary = undefined as never
export const getPaymentById = undefined as never
export const getPaymentByReceiptNumber = undefined as never
export const getPayments = undefined as never

// Roles & Users (Core App)
export const getAllRoles = undefined as never
export const createRole = undefined as never
export const updateRole = undefined as never
export const deleteRole = undefined as never
export const countSystemUsers = undefined as never
export const getSystemUsers = undefined as never
export const updateSystemUser = undefined as never
export const assignSystemRolesToUser = undefined as never
export const getUserSystemPermissionsByAuthUserId = undefined as never
export const getUserSystemRolesByAuthUserId = undefined as never
export const syncUserAuthOnLogin = undefined as never

// Coefficients
export const getCoefficientTemplates = undefined as never
export const getCoefficientTemplateById = undefined as never
export const createCoefficientTemplate = undefined as never
export const updateCoefficientTemplate = undefined as never
export const deleteCoefficientTemplate = undefined as never
export const bulkCreateCoefficients = undefined as never
export const bulkUpdateCoefficients = undefined as never
export const copyCoefficientTemplates = undefined as never
export const getCoefficientStats = undefined as never

// Analytics
export const getAnalyticsOverview = undefined as never
export const getSchoolsPerformance = undefined as never
export const getPlatformUsage = undefined as never
export const generateReportData = undefined as never

// Programs
export const getSchoolYearTemplates = undefined as never
export const getSchoolYearTemplateById = undefined as never
export const createSchoolYearTemplate = undefined as never
export const updateSchoolYearTemplate = undefined as never
export const deleteSchoolYearTemplate = undefined as never
export const getProgramTemplates = undefined as never
export const getProgramTemplateById = undefined as never
export const createProgramTemplate = undefined as never
export const updateProgramTemplate = undefined as never
export const deleteProgramTemplate = undefined as never
export const cloneProgramTemplate = undefined as never
export const getProgramTemplatesWithTerms = undefined as never
export const getProgramTemplateChapters = undefined as never
export const getProgramTemplateChapterById = undefined as never
export const createProgramTemplateChapter = undefined as never
export const updateProgramTemplateChapter = undefined as never
export const deleteProgramTemplateChapter = undefined as never
export const bulkUpdateChaptersOrder = undefined as never
export const bulkCreateChapters = undefined as never
export const publishProgram = undefined as never
export const getProgramVersions = undefined as never
export const restoreProgramVersion = undefined as never
export const getProgramStats = undefined as never
export const getTermTemplates = undefined as never
export const getTermTemplateById = undefined as never
export const createTermTemplate = undefined as never
export const updateTermTemplate = undefined as never
export const deleteTermTemplate = undefined as never
export const bulkCreateTermTemplates = undefined as never
export const getSchoolYearTemplatesWithTerms = undefined as never

// Drizzle ORM operators - stubs for browser bundle
// These are server-only but must be exported to satisfy bundler analysis
export const and = undefined as never
export const asc = undefined as never
export const between = undefined as never
export const count = undefined as never
export const desc = undefined as never
export const eq = undefined as never
export const exists = undefined as never
export const gt = undefined as never
export const gte = undefined as never
export const ilike = undefined as never
export const inArray = undefined as never
export const isNotNull = undefined as never
export const isNull = undefined as never
export const like = undefined as never
export const lt = undefined as never
export const lte = undefined as never
export const ne = undefined as never
export const not = undefined as never
export const notBetween = undefined as never
export const notExists = undefined as never
export const notInArray = undefined as never
export const or = undefined as never
export const sql = undefined as never
