import type { ReactNode } from "react";
import { IconLanguage, IconLogout, IconPalette } from "@tabler/icons-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authClient } from "@/lib/auth-client";

interface AccountDialogProps {
  children: ReactNode;
}

export function AccountDialog({ children }: AccountDialogProps) {
  const { data: session } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
  };

  if (!session) {
    return null;
  }

  const user = session.user;
  const fallbackText = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <Dialog>
      <DialogTrigger render={children as any} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "User"}
            />
            <AvatarFallback className="text-2xl font-semibold">
              {fallbackText}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            {user.name && (
              <div className="text-lg font-semibold">{user.name}</div>
            )}
            {user.email && (
              <div className="text-sm text-muted-foreground">{user.email}</div>
            )}
          </div>
          <div className="flex flex-col gap-4 w-full mt-6">
            <div className="flex items-center justify-between w-full py-3 px-4 rounded-lg border bg-card">
              <span className="text-sm font-medium flex items-center gap-2">
                <IconPalette className="h-4 w-4" />
                Theme
              </span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between w-full py-3 px-4 rounded-lg border bg-card">
              <span className="text-sm font-medium flex items-center gap-2">
                <IconLanguage className="h-4 w-4" />
                Language
              </span>
              <LanguageSwitcher />
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <IconLogout className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
