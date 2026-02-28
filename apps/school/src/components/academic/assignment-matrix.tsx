import { Card } from '@workspace/ui/components/card'
import { motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { useAssignmentMatrix } from './assignment-matrix/assignment-matrix-context'
import { AssignmentMatrixEmpty } from './assignment-matrix/assignment-matrix-empty'
import { AssignmentMatrixHeader } from './assignment-matrix/assignment-matrix-header'
import { AssignmentMatrixProvider } from './assignment-matrix/assignment-matrix-provider'
import { AssignmentMatrixSkeleton } from './assignment-matrix/assignment-matrix-skeleton'

const AssignmentMatrixTable = lazy(() => import('./assignment-matrix/assignment-matrix-table').then(m => ({ default: m.AssignmentMatrixTable })))

export function AssignmentMatrix() {
  return (
    <AssignmentMatrixProvider>
      <AssignmentMatrixContent />
    </AssignmentMatrixProvider>
  )
}

function AssignmentMatrixContent() {
  const { state } = useAssignmentMatrix()

  if (state.isPending) {
    return <AssignmentMatrixSkeleton />
  }

  if (!state.matrixData || state.matrixData.length === 0) {
    return <AssignmentMatrixEmpty />
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <Card className="
        border-border/40 bg-card/40 overflow-hidden shadow-sm backdrop-blur-xl
      "
      >
        <AssignmentMatrixHeader />
        <Suspense fallback={<AssignmentMatrixSkeleton />}>
          <AssignmentMatrixTable />
        </Suspense>
      </Card>
    </motion.div>
  )
}
