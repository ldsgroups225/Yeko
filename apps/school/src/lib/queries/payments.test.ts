import type { PaymentFilters } from './payments'

import { describe, expect, test, vi } from 'vitest'
import {

  paymentsKeys,
  paymentsOptions,
} from './payments'

vi.mock('@tanstack/react-query', () => ({
  queryOptions: vi.fn(options => options),
}))

vi.mock('@/school/functions/payments', () => ({
  getCashierSummary: vi.fn(),
  getPayment: vi.fn(),
  getPaymentByReceipt: vi.fn(),
  getPaymentsList: vi.fn(),
}))

describe('paymentsKeys', () => {
  describe('all', () => {
    test('should return base key array', () => {
      expect(paymentsKeys.all).toStrictEqual(['payments'])
    })
  })

  describe('lists', () => {
    test('should return list key array', () => {
      expect(paymentsKeys.lists()).toStrictEqual(['payments', 'list'])
    })
  })

  describe('list', () => {
    test('should return list key with empty filters', () => {
      const filters: PaymentFilters = {}
      const result = paymentsKeys.list(filters)
      expect(result).toStrictEqual(['payments', 'list', {}])
    })

    test('should return list key with studentId filter', () => {
      const filters: PaymentFilters = { studentId: 'student-1' }
      const result = paymentsKeys.list(filters)
      expect(result).toStrictEqual(['payments', 'list', { studentId: 'student-1' }])
    })

    test('should return list key with multiple filters', () => {
      const filters: PaymentFilters = {
        studentId: 'student-1',
        paymentPlanId: 'plan-1',
        method: 'cash',
        status: 'completed',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        page: 1,
        pageSize: 20,
      }
      const result = paymentsKeys.list(filters)
      expect(result).toStrictEqual(['payments', 'list', filters])
    })
  })

  describe('details', () => {
    test('should return details key array', () => {
      expect(paymentsKeys.details()).toStrictEqual(['payments', 'detail'])
    })
  })

  describe('detail', () => {
    test('should return single detail key with ID', () => {
      const result = paymentsKeys.detail('payment-1')
      expect(result).toStrictEqual(['payments', 'detail', 'payment-1'])
    })

    test('should handle different ID formats', () => {
      const result = paymentsKeys.detail('uuid-1234-5678')
      expect(result).toStrictEqual(['payments', 'detail', 'uuid-1234-5678'])
    })
  })

  describe('byReceipt', () => {
    test('should return receipt key with receipt number', () => {
      const result = paymentsKeys.byReceipt('REC-2025-001')
      expect(result).toStrictEqual(['payments', 'receipt', 'REC-2025-001'])
    })

    test('should handle different receipt number formats', () => {
      const result = paymentsKeys.byReceipt('PAY-123456')
      expect(result).toStrictEqual(['payments', 'receipt', 'PAY-123456'])
    })
  })

  describe('cashierSummary', () => {
    test('should return cashier summary key with date only', () => {
      const result = paymentsKeys.cashierSummary('2025-01-15')
      expect(result).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', undefined])
    })

    test('should return cashier summary key with date and cashierId', () => {
      const result = paymentsKeys.cashierSummary('2025-01-15', 'cashier-1')
      expect(result).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', 'cashier-1'])
    })
  })
})

describe('paymentsOptions', () => {
  describe('list', () => {
    test('should create query options with correct structure for empty filters', () => {
      const filters: PaymentFilters = {}
      const options = paymentsOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['payments', 'list', {}])
    })

    test('should create query options with correct structure for filters', () => {
      const filters: PaymentFilters = {
        studentId: 'student-1',
        status: 'completed',
        page: 2,
        pageSize: 10,
      }
      const options = paymentsOptions.list(filters)

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options.queryKey).toStrictEqual(['payments', 'list', filters])
    })

    test('should set staleTime to 2 minutes', () => {
      const options = paymentsOptions.list({})
      expect(options.staleTime).toBe(2 * 60 * 1000)
    })

    test('should set gcTime to 10 minutes', () => {
      const options = paymentsOptions.list({})
      expect(options.gcTime).toBe(10 * 60 * 1000)
    })

    test('should always be enabled (no enabled check)', () => {
      const options = paymentsOptions.list({})
      expect(options.enabled).toBeUndefined()
    })

    test('should include date filters in queryKey', () => {
      const filters: PaymentFilters = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      }
      const options = paymentsOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['payments', 'list', { startDate: '2025-01-01', endDate: '2025-12-31' }])
    })

    test('should include method filter in queryKey', () => {
      const filters: PaymentFilters = { method: 'bank_transfer' }
      const options = paymentsOptions.list(filters)
      expect(options.queryKey).toStrictEqual(['payments', 'list', { method: 'bank_transfer' }])
    })
  })

  describe('detail', () => {
    test('should create query options with correct structure', () => {
      const options = paymentsOptions.detail('payment-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['payments', 'detail', 'payment-1'])
    })

    test('should set staleTime to 2 minutes', () => {
      const options = paymentsOptions.detail('payment-1')
      expect(options.staleTime).toBe(2 * 60 * 1000)
    })

    test('should set gcTime to 10 minutes', () => {
      const options = paymentsOptions.detail('payment-1')
      expect(options.gcTime).toBe(10 * 60 * 1000)
    })

    test('should enable when id is provided', () => {
      const options = paymentsOptions.detail('payment-1')
      expect(options.enabled).toBe(true)
    })

    test('should disable when id is empty string', () => {
      const options = paymentsOptions.detail('')
      expect(options.enabled).toBe(false)
    })
  })

  describe('byReceipt', () => {
    test('should create query options with correct structure', () => {
      const options = paymentsOptions.byReceipt('REC-2025-001')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['payments', 'receipt', 'REC-2025-001'])
    })

    test('should set staleTime to 2 minutes', () => {
      const options = paymentsOptions.byReceipt('REC-2025-001')
      expect(options.staleTime).toBe(2 * 60 * 1000)
    })

    test('should set gcTime to 10 minutes', () => {
      const options = paymentsOptions.byReceipt('REC-2025-001')
      expect(options.gcTime).toBe(10 * 60 * 1000)
    })

    test('should enable when receiptNumber is provided', () => {
      const options = paymentsOptions.byReceipt('REC-2025-001')
      expect(options.enabled).toBe(true)
    })

    test('should disable when receiptNumber is empty string', () => {
      const options = paymentsOptions.byReceipt('')
      expect(options.enabled).toBe(false)
    })
  })

  describe('cashierSummary', () => {
    test('should create query options with correct structure for date only', () => {
      const options = paymentsOptions.cashierSummary('2025-01-15')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', undefined])
    })

    test('should create query options with correct structure for date and cashierId', () => {
      const options = paymentsOptions.cashierSummary('2025-01-15', 'cashier-1')

      expect(options).toHaveProperty('queryKey')
      expect(options).toHaveProperty('queryFn')
      expect(options).toHaveProperty('staleTime')
      expect(options).toHaveProperty('gcTime')
      expect(options).toHaveProperty('enabled')
      expect(options.queryKey).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', 'cashier-1'])
    })

    test('should set staleTime to 1 minute for cashier summary', () => {
      const options = paymentsOptions.cashierSummary('2025-01-15')
      expect(options.staleTime).toBe(1 * 60 * 1000)
    })

    test('should set gcTime to 5 minutes', () => {
      const options = paymentsOptions.cashierSummary('2025-01-15')
      expect(options.gcTime).toBe(5 * 60 * 1000)
    })

    test('should enable when date is provided', () => {
      const options = paymentsOptions.cashierSummary('2025-01-15')
      expect(options.enabled).toBe(true)
    })

    test('should disable when date is empty string', () => {
      const options = paymentsOptions.cashierSummary('')
      expect(options.enabled).toBe(false)
    })
  })
})

describe('paymentFilters interface', () => {
  test('should allow optional studentId', () => {
    const filters: PaymentFilters = { studentId: 'student-1' }
    expect(filters.studentId).toBe('student-1')
  })

  test('should allow optional paymentPlanId', () => {
    const filters: PaymentFilters = { paymentPlanId: 'plan-1' }
    expect(filters.paymentPlanId).toBe('plan-1')
  })

  test('should allow method values', () => {
    const methods: PaymentFilters['method'][] = ['cash', 'bank_transfer', 'mobile_money', 'card', 'check', 'other']
    methods.forEach((method) => {
      const filters: PaymentFilters = { method }
      expect(filters.method).toBe(method)
    })
  })

  test('should allow status values', () => {
    const statuses: PaymentFilters['status'][] = ['pending', 'completed', 'cancelled', 'refunded', 'partial_refund']
    statuses.forEach((status) => {
      const filters: PaymentFilters = { status }
      expect(filters.status).toBe(status)
    })
  })

  test('should allow optional startDate', () => {
    const filters: PaymentFilters = { startDate: '2025-01-01' }
    expect(filters.startDate).toBe('2025-01-01')
  })

  test('should allow optional endDate', () => {
    const filters: PaymentFilters = { endDate: '2025-12-31' }
    expect(filters.endDate).toBe('2025-12-31')
  })

  test('should allow pagination params', () => {
    const filters: PaymentFilters = { page: 1, pageSize: 20 }
    expect(filters.page).toBe(1)
    expect(filters.pageSize).toBe(20)
  })
})

describe('pagination handling', () => {
  test('should include page in query key', () => {
    const filters: PaymentFilters = { page: 3 }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { page: 3 }])
  })

  test('should include pageSize in query key', () => {
    const filters: PaymentFilters = { pageSize: 50 }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { pageSize: 50 }])
  })

  test('should include both page and pageSize in query key', () => {
    const filters: PaymentFilters = { page: 2, pageSize: 25 }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { page: 2, pageSize: 25 }])
  })
})

describe('date filtering handling', () => {
  test('should include startDate in query key', () => {
    const filters: PaymentFilters = { startDate: '2025-01-01' }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { startDate: '2025-01-01' }])
  })

  test('should include endDate in query key', () => {
    const filters: PaymentFilters = { endDate: '2025-12-31' }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { endDate: '2025-12-31' }])
  })

  test('should include both startDate and endDate in query key', () => {
    const filters: PaymentFilters = {
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { startDate: '2025-01-01', endDate: '2025-12-31' }])
  })
})

describe('method and status filtering handling', () => {
  test('should include method in query key', () => {
    const filters: PaymentFilters = { method: 'mobile_money' }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { method: 'mobile_money' }])
  })

  test('should include status in query key', () => {
    const filters: PaymentFilters = { status: 'completed' }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { status: 'completed' }])
  })

  test('should include both method and status in query key', () => {
    const filters: PaymentFilters = { method: 'cash', status: 'completed' }
    const options = paymentsOptions.list(filters)
    expect(options.queryKey).toStrictEqual(['payments', 'list', { method: 'cash', status: 'completed' }])
  })
})

describe('filtering integration', () => {
  test('should generate consistent query keys for same filters', () => {
    const filters: PaymentFilters = {
      studentId: 'student-1',
      status: 'completed',
      page: 1,
      pageSize: 20,
    }
    const key1 = paymentsKeys.list(filters)
    const key2 = paymentsKeys.list(filters)
    expect(key1).toStrictEqual(key2)
  })

  test('should generate different query keys for different status', () => {
    const filters1: PaymentFilters = { status: 'pending' }
    const filters2: PaymentFilters = { status: 'completed' }
    const key1 = paymentsKeys.list(filters1)
    const key2 = paymentsKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })

  test('should generate different query keys for different date range', () => {
    const filters1: PaymentFilters = { startDate: '2025-01-01', endDate: '2025-06-30' }
    const filters2: PaymentFilters = { startDate: '2025-07-01', endDate: '2025-12-31' }
    const key1 = paymentsKeys.list(filters1)
    const key2 = paymentsKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })

  test('should generate different query keys for different payment method', () => {
    const filters1: PaymentFilters = { method: 'cash' }
    const filters2: PaymentFilters = { method: 'bank_transfer' }
    const key1 = paymentsKeys.list(filters1)
    const key2 = paymentsKeys.list(filters2)
    expect(key1).not.toStrictEqual(key2)
  })
})

describe('cashier summary handling', () => {
  test('should include date in query key', () => {
    const options = paymentsOptions.cashierSummary('2025-01-15')
    expect(options.queryKey).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', undefined])
  })

  test('should include cashierId in query key when provided', () => {
    const options = paymentsOptions.cashierSummary('2025-01-15', 'cashier-1')
    expect(options.queryKey).toStrictEqual(['payments', 'cashierSummary', '2025-01-15', 'cashier-1'])
  })

  test('should generate different keys for different dates', () => {
    const key1 = paymentsKeys.cashierSummary('2025-01-15')
    const key2 = paymentsKeys.cashierSummary('2025-01-16')
    expect(key1).not.toStrictEqual(key2)
  })

  test('should generate different keys for different cashiers on same date', () => {
    const key1 = paymentsKeys.cashierSummary('2025-01-15', 'cashier-1')
    const key2 = paymentsKeys.cashierSummary('2025-01-15', 'cashier-2')
    expect(key1).not.toStrictEqual(key2)
  })
})
