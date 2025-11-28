import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/app/hr')({
  component: HRLayout,
});

function HRLayout() {
  return <Outlet />;
}
