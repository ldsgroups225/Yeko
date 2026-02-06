import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/components/landing/the-page'

export const Route = createFileRoute('/')({
  component: LandingPage,
})
