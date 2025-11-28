import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/app/hr/')({
  component: HRIndexPage,
});

function HRIndexPage() {
  // Redirect to users list by default
  return <Navigate to="/app/hr/users" search={{ page: 1 }} />;
}
