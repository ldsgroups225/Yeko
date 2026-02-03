const en_errors = {
  errors: {
    generic: 'An error occurred',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Access forbidden',
    serverError: 'Server error',
    networkError: 'Network error',
    validationError: 'Validation error',
    conflict: 'Data conflict',
    internalError: 'Internal error',

    database: {
      connectionFailed: 'Database connection failed',
      queryFailed: 'Query execution failed',
      transactionFailed: 'Transaction failed',
      constraintViolation: 'Data constraint violation',
      uniqueConstraint: 'A resource with this information already exists',
      foreignKeyConstraint: 'Invalid reference to linked resource',
      notNullConstraint: 'Required field missing',
    },

    students: {
      notFound: 'Student not found',
      alreadyExists: 'A student with this information already exists',
      matriculeExists: 'This matricule is already in use',
      invalidData: 'Invalid student data',
      createFailed: 'Failed to create student',
      updateFailed: 'Failed to update student',
      deleteFailed: 'Failed to delete student',
      importFailed: 'Failed to import students',
      exportFailed: 'Failed to export students',
    },

    parents: {
      notFound: 'Parent not found',
      alreadyExists: 'A parent with this phone number already exists',
      invalidData: 'Invalid parent data',
      createFailed: 'Failed to create parent',
      updateFailed: 'Failed to update parent',
      deleteFailed: 'Failed to delete parent',
      linkFailed: 'Failed to link parent to student',
      unlinkFailed: 'Failed to unlink parent',
      invitationFailed: 'Failed to send invitation',
      invalidToken: 'Invalid or expired invitation token',
      noEmail: 'Parent has no email address',
      noChildren: 'No children linked to parent',
    },

    enrollments: {
      notFound: 'Enrollment not found',
      alreadyExists: 'Student is already enrolled for this school year',
      invalidData: 'Invalid enrollment data',
      createFailed: 'Failed to create enrollment',
      confirmFailed: 'Failed to confirm enrollment',
      cancelFailed: 'Failed to cancel enrollment',
      transferFailed: 'Failed to transfer student',
      bulkReenrollFailed: 'Failed to bulk re-enroll students',
    },

    classes: {
      notFound: 'Class not found',
      alreadyExists: 'A class with this name already exists',
      invalidData: 'Invalid class data',
      createFailed: 'Failed to create class',
      updateFailed: 'Failed to update class',
      deleteFailed: 'Failed to delete class',
      capacityExceeded: 'Class maximum capacity reached',
    },

    teachers: {
      notFound: 'Teacher not found',
      alreadyExists: 'This user is already a teacher',
      invalidData: 'Invalid teacher data',
      createFailed: 'Failed to create teacher',
      updateFailed: 'Failed to update teacher',
      deleteFailed: 'Failed to delete teacher',
      assignFailed: 'Failed to assign subject',
    },

    subjects: {
      notFound: 'Subject not found',
      alreadyExists: 'A subject with this code already exists',
      invalidData: 'Invalid subject data',
      createFailed: 'Failed to create subject',
      updateFailed: 'Failed to update subject',
      deleteFailed: 'Failed to delete subject',
      inUse: 'Subject is in use and cannot be deleted',
    },

    finance: {
      payment: {
        notFound: 'Payment not found',
        createFailed: 'Failed to create payment',
        cancelFailed: 'Failed to cancel payment',
        invalidAmount: 'Invalid payment amount',
        receiptExists: 'A receipt with this number already exists',
        allocationFailed: 'Failed to allocate payment',
      },
      refund: {
        notFound: 'Refund not found',
        createFailed: 'Failed to create refund',
        approveFailed: 'Failed to approve refund',
        rejectFailed: 'Failed to reject refund',
        processFailed: 'Failed to process refund',
        cancelFailed: 'Failed to cancel refund',
        insufficientBalance: 'Insufficient balance for refund',
      },
      account: {
        notFound: 'Account not found',
        alreadyExists: 'An account with this code already exists',
        createFailed: 'Failed to create account',
        updateFailed: 'Failed to update account',
        deleteFailed: 'Failed to delete account',
        hasTransactions: 'Account has transactions and cannot be deleted',
      },
      transaction: {
        notFound: 'Transaction not found',
        createFailed: 'Failed to create transaction',
        unbalanced: 'Transaction is not balanced',
        invalidLines: 'Invalid transaction lines',
        fiscalYearClosed: 'Fiscal year is closed',
      },
      fee: {
        notFound: 'Fee not found',
        alreadyExists: 'A fee with this code already exists',
        createFailed: 'Failed to create fee',
        updateFailed: 'Failed to update fee',
        deleteFailed: 'Failed to delete fee',
        assignFailed: 'Failed to assign fee',
      },
      installment: {
        notFound: 'Installment not found',
        createFailed: 'Failed to create installment',
        waiveFailed: 'Failed to waive installment',
        alreadyPaid: 'Installment is already paid',
      },
      paymentPlan: {
        notFound: 'Payment plan not found',
        createFailed: 'Failed to create payment plan',
        updateFailed: 'Failed to update payment plan',
        cancelFailed: 'Failed to cancel payment plan',
        alreadyExists: 'A payment plan already exists for this student',
      },
    },

    attendance: {
      notFound: 'Attendance record not found',
      createFailed: 'Failed to create attendance',
      updateFailed: 'Failed to update attendance',
      deleteFailed: 'Failed to delete attendance',
      alreadyExists: 'An attendance record already exists for this date',
      invalidStatus: 'Invalid attendance status',
      bulkCreateFailed: 'Failed to bulk create attendance records',
    },

    grades: {
      notFound: 'Grade not found',
      createFailed: 'Failed to create grade',
      updateFailed: 'Failed to update grade',
      deleteFailed: 'Failed to delete grade',
      invalidValue: 'Invalid grade value',
      outOfRange: 'Grade is out of allowed range',
      coefficientNotFound: 'Coefficient not found for this subject',
    },

    timetables: {
      notFound: 'Timetable not found',
      createFailed: 'Failed to create timetable',
      updateFailed: 'Failed to update timetable',
      deleteFailed: 'Failed to delete timetable',
      conflict: 'Schedule conflict detected',
      teacherConflict: 'Teacher already has a class at this time',
      classroomConflict: 'Classroom is already occupied at this time',
    },

    school: {
      notFound: 'School not found',
      alreadyExists: 'A school with this name already exists',
      invalidData: 'Invalid school data',
      createFailed: 'Failed to create school',
      updateFailed: 'Failed to update school',
      deleteFailed: 'Failed to delete school',
    },

    schoolYear: {
      notFound: 'School year not found',
      alreadyExists: 'A school year with this name already exists',
      invalidData: 'Invalid school year data',
      createFailed: 'Failed to create school year',
      updateFailed: 'Failed to update school year',
      deleteFailed: 'Failed to delete school year',
      hasEnrollments: 'School year has enrollments and cannot be deleted',
    },

    users: {
      notFound: 'User not found',
      alreadyExists: 'A user with this email already exists',
      invalidData: 'Invalid user data',
      createFailed: 'Failed to create user',
      updateFailed: 'Failed to update user',
      deleteFailed: 'Failed to delete user',
      emailExists: 'This email is already in use',
    },

    roles: {
      notFound: 'Role not found',
      alreadyExists: 'A role with this name already exists',
      invalidData: 'Invalid role data',
      createFailed: 'Failed to create role',
      updateFailed: 'Failed to update role',
      deleteFailed: 'Failed to delete role',
      systemRole: 'System roles cannot be modified or deleted',
    },

    permissions: {
      denied: 'Permission denied',
      insufficient: 'Insufficient permissions for this action',
      invalidScope: 'Invalid permission scope',
    },

    auth: {
      invalidCredentials: 'Invalid credentials',
      sessionExpired: 'Session expired',
      tokenInvalid: 'Invalid token',
      unauthorized: 'Unauthorized',
      forbidden: 'Access forbidden',
      noSchoolContext: 'No school context',
      invalidSchoolContext: 'Invalid school context',
    },

    validation: {
      required: 'This field is required',
      invalidFormat: 'Invalid format',
      invalidType: 'Invalid data type',
      tooShort: 'Too short (minimum {min} characters)',
      tooLong: 'Too long (maximum {max} characters)',
      invalidEmail: 'Invalid email address',
      invalidPhone: 'Invalid phone number',
      invalidDate: 'Invalid date',
      futureDate: 'Date must be in the future',
      pastDate: 'Date must be in the past',
      invalidNumber: 'Invalid number',
      negativeNumber: 'Number cannot be negative',
      zeroNotAllowed: 'Value cannot be zero',
    },

    file: {
      notFound: 'File not found',
      tooLarge: 'File too large',
      invalidType: 'Invalid file type',
      uploadFailed: 'Upload failed',
      downloadFailed: 'Download failed',
      parseFailed: 'File parsing failed',
    },

    import: {
      failed: 'Import failed',
      invalidFormat: 'Invalid file format',
      missingColumns: 'Required columns missing',
      noValidRows: 'No valid rows found',
      partialSuccess: 'Import partially successful',
    },

    export: {
      failed: 'Export failed',
      noData: 'No data to export',
      formatFailed: 'File generation failed',
    },

    bulk: {
      failed: 'Bulk operation failed',
      partialSuccess: 'Operation partially successful',
      noItems: 'No items selected',
    },
  },
} as const

export type ErrorTranslations = typeof en_errors
export default en_errors
