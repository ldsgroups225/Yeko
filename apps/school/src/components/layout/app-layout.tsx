import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { CommandPalette } from "./command-palette";
import { Header } from "./header";
import { AppSidebar } from "./sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <CommandPalette />
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
