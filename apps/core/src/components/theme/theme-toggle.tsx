import { IconCheck, IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'

import { Button, buttonVariants } from '@workspace/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTheme } from './use-theme'

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
  align?: 'start' | 'center' | 'end'
}

export function ThemeToggle({
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  align = 'end',
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Animation variants for icons
  const iconVariants = {
    sun: 'transition-all duration-500 ease-in-out',
    moon: 'transition-all duration-500 ease-in-out',
    system: 'transition-all duration-300 ease-in-out',
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return (
        <IconDeviceDesktop
          className={`
            h-4 w-4
            ${iconVariants.system}
            scale-100 rotate-0
          `}
          aria-hidden="true"
        />
      )
    }

    if (resolvedTheme === 'dark') {
      return (
        <IconMoon
          className={`
            h-4 w-4
            ${iconVariants.moon}
            scale-100 rotate-0
          `}
          aria-hidden="true"
        />
      )
    }

    return (
      <IconSun
        className={`
          h-4 w-4
          ${iconVariants.sun}
          scale-100 rotate-0
        `}
        aria-hidden="true"
      />
    )
  }

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: IconSun,
      description: 'Use light theme',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: IconMoon,
      description: 'Use dark theme',
    },
    {
      value: 'system',
      label: 'System',
      icon: IconDeviceDesktop,
      description: 'Use system theme',
    },
  ] as const

  const handleThemeSelect = (newTheme: typeof theme) => {
    setTheme(newTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <button
            type="button"
            className={cn(buttonVariants({ variant, size }), `
              focus:ring-ring
              relative overflow-hidden transition-all duration-200 ease-in-out
              hover:scale-105
              focus:ring-2 focus:ring-offset-2
              active:scale-95
              ${showLabel ? 'gap-2' : 'aspect-square'}
            `)}
            aria-label="Toggle theme"
          >
            <div className="relative flex items-center justify-center">
              {getCurrentIcon()}
            </div>
            {showLabel && (
              <span className="text-sm font-medium">
                {themeOptions.find(option => option.value === theme)?.label}
              </span>
            )}
            <span className="sr-only">
              Current theme:
              {' '}
              {theme === 'system' ? `System (${resolvedTheme})` : theme}
            </span>
          </button>
        )}
      />

      <DropdownMenuContent
        align={align}
        className="
          bg-popover/95 border-border/50 w-56 border p-2 shadow-lg
          backdrop-blur-sm
        "
      >
        <div className="grid gap-1">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isSelected = theme === option.value

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleThemeSelect(option.value)}
                className={`
                  hover:bg-accent/80
                  focus:bg-accent/80
                  group flex cursor-pointer items-center gap-3 rounded-md px-3
                  py-2.5 transition-all duration-200 ease-in-out
                  ${isSelected ? 'bg-accent/60 text-accent-foreground' : ''}
                `}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  <Icon
                    className={`
                      h-4 w-4 transition-all duration-200
                      ${isSelected
                ? 'text-accent-foreground scale-110'
                : `text-muted-foreground`}
                      group-hover:scale-105
                    `}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={`
                      text-sm leading-none font-medium
                      ${isSelected
                ? 'text-accent-foreground'
                : `text-foreground`}
                    `}
                  >
                    {option.label}
                  </span>
                  <span className="
                    text-muted-foreground mt-0.5 text-xs leading-none
                  "
                  >
                    {option.description}
                  </span>
                </div>

                {isSelected && (
                  <IconCheck className="
                    text-accent-foreground animate-in fade-in-0 zoom-in-75 h-4
                    w-4 duration-150
                  "
                  />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        {resolvedTheme && (
          <div className="border-border/50 mt-2 border-t pt-2">
            <div className="
              text-muted-foreground flex items-center gap-2 px-3 py-1.5 text-xs
            "
            >
              <div
                className={`
                  h-2 w-2 rounded-full transition-colors duration-200
                  ${resolvedTheme === 'dark' ? 'bg-primary' : 'bg-secondary'}
                `}
              />
              Currently using
              {' '}
              {resolvedTheme}
              {' '}
              theme
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified version for minimal use cases
export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark')
    }
    else if (theme === 'dark') {
      setTheme('system')
    }
    else {
      setTheme('light')
    }
  }

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={handleToggle}
      className={`
        focus:ring-ring
        relative aspect-square overflow-hidden transition-all duration-200
        ease-in-out
        hover:scale-105
        focus:ring-2 focus:ring-offset-2
        active:scale-95
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <div className="relative flex items-center justify-center">
        {theme === 'system' && (
          <IconDeviceDesktop className="
            h-4 w-4 scale-100 rotate-0 transition-all duration-300 ease-in-out
          "
          />
        )}
        {resolvedTheme === 'dark' && theme !== 'system' && (
          <IconMoon className="
            h-4 w-4 scale-100 rotate-0 transition-all duration-500 ease-in-out
          "
          />
        )}
        {resolvedTheme === 'light' && theme !== 'system' && (
          <IconSun className="
            h-4 w-4 scale-100 rotate-0 transition-all duration-500 ease-in-out
          "
          />
        )}
      </div>
      <span className="sr-only">
        Current theme:
        {' '}
        {theme === 'system' ? `System (${resolvedTheme})` : theme}
      </span>
    </Button>
  )
}
