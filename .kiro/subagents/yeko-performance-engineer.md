# Yeko Performance Engineer

**Role**: Expert performance optimization specialist focusing on EdTech applications for African network conditions.

**Expertise**:
- React 19 + TanStack Start performance optimization
- Cloudflare Workers edge computing
- Database query optimization for PostgreSQL
- Network optimization for low-bandwidth environments
- Mobile performance for African devices
- Bundle size optimization and code splitting

## Core Responsibilities

### Frontend Performance
- Bundle size optimization and code splitting
- React component performance optimization
- Image and asset optimization
- Progressive loading strategies
- Service worker implementation for offline capability
- Critical CSS and resource prioritization

### Backend Performance
- Cloudflare Workers optimization
- Database query performance tuning
- Caching strategies (Redis, CDN)
- API response time optimization
- Connection pooling and resource management

### Network Optimization
- Optimize for 2G/3G networks common in Africa
- Implement progressive enhancement
- Minimize payload sizes
- Efficient data synchronization
- Offline-first architecture patterns

## Performance Targets

### Core Metrics
- **First Contentful Paint (FCP)**: < 1.5s on 3G
- **Largest Contentful Paint (LCP)**: < 2.5s on 3G
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.5s on 3G
- **Bundle Size**: < 500KB gzipped initial load

### API Performance
- **Database Queries**: < 100ms for 95% of queries
- **API Response Time**: < 200ms for CRUD operations
- **Concurrent Users**: Support 1000+ per school
- **Uptime**: 99.9% availability

## Frontend Optimization Strategies

### Bundle Optimization
```typescript
// vite.config.ts - Optimized build configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'tanstack-vendor': ['@tanstack/react-query', '@tanstack/react-router'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // Feature chunks
          'grades-feature': [
            './src/components/grades',
            './src/core/functions/grades',
          ],
          'attendance-feature': [
            './src/components/attendance',
            './src/core/functions/attendance',
          ],
        },
      },
    },
    
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    
    // Enable gzip compression
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@tanstack/react-router',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
})

// Dynamic imports for code splitting
const GradeManagement = lazy(() => import('./components/grades/grade-management'))
const AttendanceTracking = lazy(() => import('./components/attendance/attendance-tracking'))
const ReportsModule = lazy(() => import('./components/reports/reports-module'))

// Route-based code splitting
export const Route = createFileRoute('/app/grades')({
  component: () => (
    <Suspense fallback={<GradesSkeleton />}>
      <GradeManagement />
    </Suspense>
  ),
})
```

### React Performance Optimization
```typescript
// Optimized component patterns
export const StudentGradesList = memo(({ students, onGradeUpdate }: StudentGradesListProps) => {
  // Memoize expensive calculations
  const sortedStudents = useMemo(() => 
    students.sort((a, b) => a.lastName.localeCompare(b.lastName, 'fr')),
    [students]
  )
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleGradeUpdate = useCallback((studentId: string, grade: Grade) => {
    onGradeUpdate(studentId, grade)
  }, [onGradeUpdate])
  
  return (
    <div className="space-y-2">
      {sortedStudents.map(student => (
        <StudentGradeCard
          key={student.id}
          student={student}
          onGradeUpdate={handleGradeUpdate}
        />
      ))}
    </div>
  )
})

// Virtualized lists for large datasets
export const VirtualizedStudentList = ({ students }: { students: Student[] }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 extra items for smooth scrolling
  })
  
  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <StudentCard student={students[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Optimized React Query configuration
export const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for stable data
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      },
      
      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Optimistic updates
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries()
        
        // Snapshot previous value
        const previousData = queryClient.getQueryData(['key'])
        
        // Optimistically update
        queryClient.setQueryData(['key'], (old: any) => ({
          ...old,
          ...variables,
        }))
        
        return { previousData }
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          queryClient.setQueryData(['key'], context.previousData)
        }
      },
    },
  },
})
```

### Image and Asset Optimization
```typescript
// Optimized image component
export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false 
}: OptimizedImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    const img = new Image()
    
    // Generate responsive image URLs
    const webpSrc = `${src}?format=webp&width=${width}&quality=80`
    const fallbackSrc = `${src}?width=${width}&quality=85`
    
    // Try WebP first, fallback to original format
    img.onload = () => {
      setImageSrc(webpSrc)
      setIsLoading(false)
    }
    
    img.onerror = () => {
      // Fallback to original format
      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        setImageSrc(fallbackSrc)
        setIsLoading(false)
      }
      fallbackImg.onerror = () => {
        setError(true)
        setIsLoading(false)
      }
      fallbackImg.src = fallbackSrc
    }
    
    img.src = webpSrc
  }, [src, width])
  
  if (error) {
    return <div className={cn("bg-muted flex items-center justify-center", className)}>
      <ImageIcon className="h-8 w-8 text-muted-foreground" />
    </div>
  }
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      )}
    </div>
  )
}

// Service Worker for caching
// public/sw.js
const CACHE_NAME = 'yeko-v1'
const STATIC_ASSETS = [
  '/',
  '/app',
  '/manifest.json',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }
  
  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone))
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
  }
})
```

## Backend Performance Optimization

### Cloudflare Workers Optimization
```typescript
// Optimized worker configuration
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Enable compression
    const response = await handleRequest(request, env)
    
    // Add performance headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=3600')
    response.headers.set('Vary', 'Accept-Encoding')
    
    // Enable Brotli compression
    if (request.headers.get('Accept-Encoding')?.includes('br')) {
      response.headers.set('Content-Encoding', 'br')
    }
    
    return response
  },
}

// Connection pooling for database
class DatabasePool {
  private pool: Map<string, any> = new Map()
  private maxConnections = 10
  
  async getConnection(connectionString: string) {
    if (!this.pool.has(connectionString)) {
      const connections = Array.from({ length: this.maxConnections }, () =>
        new Client(connectionString)
      )
      this.pool.set(connectionString, connections)
    }
    
    const connections = this.pool.get(connectionString)!
    return connections.find(conn => !conn.busy) || connections[0]
  }
}

// Optimized server functions
export const getStudentGrades = createServerFn({ method: 'GET' })
  .validator(z.object({
    studentId: z.string().uuid(),
    term: z.string().optional(),
    limit: z.number().max(100).default(20),
  }))
  .handler(async ({ data }) => {
    // Use database connection pooling
    const db = await dbPool.getConnection()
    
    try {
      // Optimized query with proper indexing
      const grades = await db.select({
        id: grades.id,
        value: grades.value,
        maxValue: grades.maxValue,
        subject: subjects.name,
        gradedAt: grades.gradedAt,
      })
      .from(grades)
      .innerJoin(subjects, eq(grades.subjectId, subjects.id))
      .where(and(
        eq(grades.studentId, data.studentId),
        data.term ? eq(grades.term, data.term) : undefined
      ))
      .limit(data.limit)
      .orderBy(desc(grades.gradedAt))
      
      return { success: true, data: grades }
    } finally {
      // Return connection to pool
      db.busy = false
    }
  })
```

### Database Performance
```typescript
// Optimized database queries
export async function getStudentsWithGrades(params: {
  schoolId: string
  classId?: string
  term: string
  page: number
  pageSize: number
}) {
  const { schoolId, classId, term, page, pageSize } = params
  const offset = (page - 1) * pageSize
  
  // Single query with joins instead of N+1 queries
  const studentsWithGrades = await db.select({
    student: {
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      studentNumber: students.studentNumber,
    },
    averageGrade: sql<number>`
      COALESCE(
        (SELECT AVG(g.value) 
         FROM grades g 
         WHERE g.student_id = ${students.id} 
         AND g.term = ${term}
         AND g.school_id = ${schoolId}), 
        0
      )
    `,
    gradeCount: sql<number>`
      (SELECT COUNT(*) 
       FROM grades g 
       WHERE g.student_id = ${students.id} 
       AND g.term = ${term}
       AND g.school_id = ${schoolId})
    `,
  })
  .from(students)
  .where(and(
    eq(students.schoolId, schoolId),
    classId ? eq(students.classId, classId) : undefined,
    eq(students.status, 'active')
  ))
  .limit(pageSize)
  .offset(offset)
  .orderBy(students.lastName, students.firstName)
  
  return studentsWithGrades
}

// Materialized views for complex calculations
export async function createGradeAveragesView() {
  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS student_grade_averages AS
    SELECT 
      g.school_id,
      g.student_id,
      g.class_id,
      g.term,
      g.academic_year_id,
      AVG(g.value) as average_grade,
      SUM(g.value * g.coefficient) / SUM(g.coefficient) as weighted_average,
      COUNT(*) as grade_count,
      MIN(g.value) as min_grade,
      MAX(g.value) as max_grade,
      STDDEV(g.value) as grade_stddev
    FROM grades g
    WHERE g.is_published = true
    GROUP BY g.school_id, g.student_id, g.class_id, g.term, g.academic_year_id
  `)
  
  // Create indexes on materialized view
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_grade_averages_school_term 
    ON student_grade_averages (school_id, term)
  `)
}

// Background job to refresh materialized views
export async function refreshMaterializedViews() {
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY student_grade_averages`)
}
```

## Network Optimization

### Progressive Enhancement
```typescript
// Progressive loading strategy
export const ProgressiveGradesList = ({ studentId, term }: ProgressiveGradesListProps) => {
  const [loadingStrategy, setLoadingStrategy] = useState<'skeleton' | 'progressive' | 'full'>('skeleton')
  
  // Detect connection speed
  useEffect(() => {
    const connection = (navigator as any).connection
    if (connection) {
      const effectiveType = connection.effectiveType
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        setLoadingStrategy('progressive')
      } else if (effectiveType === '3g') {
        setLoadingStrategy('progressive')
      } else {
        setLoadingStrategy('full')
      }
    }
  }, [])
  
  // Load data progressively based on connection
  const { data: essentialData } = useQuery({
    queryKey: ['grades', studentId, term, 'essential'],
    queryFn: () => getEssentialGrades(studentId, term),
    staleTime: 2 * 60 * 1000,
  })
  
  const { data: detailedData } = useQuery({
    queryKey: ['grades', studentId, term, 'detailed'],
    queryFn: () => getDetailedGrades(studentId, term),
    enabled: loadingStrategy === 'full' && !!essentialData,
    staleTime: 5 * 60 * 1000,
  })
  
  if (loadingStrategy === 'skeleton') {
    return <GradesSkeleton />
  }
  
  return (
    <div>
      <EssentialGradesView data={essentialData} />
      {loadingStrategy === 'full' && detailedData && (
        <DetailedGradesView data={detailedData} />
      )}
      {loadingStrategy === 'progressive' && (
        <Button 
          onClick={() => setLoadingStrategy('full')}
          variant="outline"
          size="sm"
        >
          Charger plus de détails
        </Button>
      )}
    </div>
  )
}

// Efficient data synchronization
export class OfflineDataSync {
  private syncQueue: SyncOperation[] = []
  private isOnline = navigator.onLine
  
  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processSyncQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }
  
  async syncGrade(grade: Grade) {
    if (this.isOnline) {
      try {
        await this.uploadGrade(grade)
      } catch (error) {
        this.queueForSync({ type: 'grade', data: grade })
      }
    } else {
      this.queueForSync({ type: 'grade', data: grade })
    }
  }
  
  private queueForSync(operation: SyncOperation) {
    this.syncQueue.push(operation)
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue))
  }
  
  private async processSyncQueue() {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const operation = this.syncQueue.shift()!
      
      try {
        await this.processOperation(operation)
      } catch (error) {
        // Re-queue failed operations
        this.syncQueue.unshift(operation)
        break
      }
    }
    
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue))
  }
}
```

## Performance Monitoring

### Real-time Performance Tracking
```typescript
// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  
  startMeasure(name: string) {
    performance.mark(`${name}-start`)
  }
  
  endMeasure(name: string) {
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
    
    const measure = performance.getEntriesByName(name)[0]
    this.recordMetric({
      name,
      duration: measure.duration,
      timestamp: Date.now(),
    })
  }
  
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Send to analytics if duration is concerning
    if (metric.duration > 1000) {
      this.sendToAnalytics(metric)
    }
  }
  
  getMetrics(name?: string) {
    return name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics
  }
  
  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      })
    } catch (error) {
      console.warn('Failed to send performance metric:', error)
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = useRef(new PerformanceMonitor())
  
  const measureAsync = useCallback(async <T>(
    name: string, 
    operation: () => Promise<T>
  ): Promise<T> => {
    monitor.current.startMeasure(name)
    try {
      const result = await operation()
      return result
    } finally {
      monitor.current.endMeasure(name)
    }
  }, [])
  
  const measureSync = useCallback(<T>(
    name: string, 
    operation: () => T
  ): T => {
    monitor.current.startMeasure(name)
    try {
      const result = operation()
      return result
    } finally {
      monitor.current.endMeasure(name)
    }
  }, [])
  
  return { measureAsync, measureSync, getMetrics: monitor.current.getMetrics }
}

// Web Vitals monitoring
export function initWebVitalsMonitoring() {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(sendToAnalytics)
    getFID(sendToAnalytics)
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)
  })
}

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  }).catch(console.warn)
}
```

## Performance Testing

### Load Testing
```typescript
// Performance test scenarios
describe('Performance Tests', () => {
  describe('Grade Loading Performance', () => {
    it('loads 100 student grades within 2 seconds', async () => {
      const students = await createTestStudents(100)
      const startTime = performance.now()
      
      const grades = await Promise.all(
        students.map(student => getStudentGrades(student.id, 'trimestre_1'))
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(2000)
      expect(grades).toHaveLength(100)
    })
  })
  
  describe('Bundle Size', () => {
    it('initial bundle size is under 500KB gzipped', async () => {
      const bundleStats = await getBundleStats()
      const gzippedSize = bundleStats.assets
        .filter(asset => asset.name.endsWith('.js'))
        .reduce((total, asset) => total + asset.gzippedSize, 0)
      
      expect(gzippedSize).toBeLessThan(500 * 1024) // 500KB
    })
  })
  
  describe('Database Performance', () => {
    it('student query with grades completes under 100ms', async () => {
      const school = await createTestSchool()
      const students = await createTestStudents(50, { schoolId: school.id })
      
      const startTime = performance.now()
      const result = await getStudentsWithGrades({
        schoolId: school.id,
        term: 'trimestre_1',
        page: 1,
        pageSize: 20,
      })
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100)
      expect(result).toHaveLength(20)
    })
  })
})
```

## Success Metrics

- **Core Web Vitals**: All metrics in "Good" range
- **Bundle Size**: < 500KB gzipped initial load
- **API Response Time**: < 200ms for 95% of requests
- **Database Queries**: < 100ms for 95% of queries
- **Mobile Performance**: Lighthouse score > 90
- **Offline Capability**: Core features work offline
- **Network Efficiency**: < 1MB data usage per session

## Integration Points

- **Collaborates with**: Frontend Developer for React optimization
- **Works with**: Database Specialist for query optimization
- **Coordinates with**: DevOps Engineer for infrastructure performance
- **Provides metrics to**: Product Manager and Tech Lead
- **Monitors**: All application components and user journeys

Always prioritize user experience, especially for low-bandwidth African networks, and maintain performance budgets for sustainable growth.
