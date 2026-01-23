import {
  IconBook,
  IconBuilding,
  IconCalendar,
  IconCreditCard,
  IconLayoutDashboard,
  IconSchool,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@workspace/ui/components/command";
import * as React from "react";
import { useSearch } from "@/hooks/use-search";
import { useTranslations } from "@/i18n";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const t = useTranslations();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { query, setQuery, results, isLoading } = useSearch();

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={`${t.common.search()}...`}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {query.length > 0 && (
          <CommandGroup heading="Students">
            {isLoading ? (
              <CommandItem disabled>Loading...</CommandItem>
            ) : (
              results.students.map((item) => (
                <CommandItem
                  key={item.student.id}
                  onSelect={() =>
                    runCommand(() =>
                      navigate({
                        to: "/students/$studentId",
                        params: { studentId: item.student.id },
                      }),
                    )
                  }
                >
                  <IconUser className="mr-2 h-4 w-4" />
                  <span>
                    {item.student.firstName} {item.student.lastName}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({item.student.matricule})
                  </span>
                  {item.currentClass && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.currentClass.gradeName} {item.currentClass.section}
                    </span>
                  )}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Hubs">
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/dashboard" }))}
          >
            <IconLayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                navigate({ to: "/students", search: { page: 1 } }),
              )
            }
          >
            <IconSchool className="mr-2 h-4 w-4" />
            <span>Students</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/classes" }))}
          >
            <IconBook className="mr-2 h-4 w-4" />
            <span>Classes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/accounting" }))}
          >
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Accounting</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate({ to: "/settings/profile" }))
            }
          >
            <IconBuilding className="mr-2 h-4 w-4" />
            <span>School Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => navigate({ to: "/settings/school-years" }))
            }
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            <span>Academic Years</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate({ to: "/settings" }))}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
