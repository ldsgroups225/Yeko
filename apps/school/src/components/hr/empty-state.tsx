import { Button } from '@workspace/ui/components/button'
import { motion } from 'motion/react'

import * as React from 'react'

interface EmptyStateProps {
  icon: React.ElementType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="
        border-border/40 bg-card/30 flex min-h-[400px] flex-col items-center
        justify-center rounded-xl border border-dashed p-8 text-center
        backdrop-blur-sm
      "
    >
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
        className="
          bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center
          justify-center rounded-full shadow-inner
        "
      >
        <Icon className="h-8 w-8" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-foreground mt-6 text-xl font-semibold tracking-tight"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={action.onClick}
            className="
              ring-offset-background mt-8 rounded-xl px-8 transition-all
              hover:shadow-lg
              active:shadow-inner
            "
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
