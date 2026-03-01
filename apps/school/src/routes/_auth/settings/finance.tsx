import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'

export const Route = createFileRoute('/_auth/settings/finance')({
  component: FinanceSettingsRoute,
})

function FinanceSettingsRoute() {
  const pathname = useLocation({ select: l => l.pathname })

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.995 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
