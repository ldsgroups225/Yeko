import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Yeko School</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Smart School Management System
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          School context middleware is ready!
        </p>
      </div>
    </div>
  );
}
