import { IconSparkles } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'

export function ClaudeCodeSection() {
  return (
    <section
      id="claude-code"
      className="
        from-background to-muted/20 bg-linear-to-b
        sm:py-6
      "
    >
      <div className="
        mx-auto max-w-7xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            <IconSparkles className="mr-1 h-3 w-3" />
            AI-Powered Setup
          </Badge>
          <h2 className="
            text-foreground text-3xl font-bold tracking-tight
            sm:text-4xl
          "
          >
            Setup Powered by Claude Code
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Let Claude Code agents help you set up this project
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl text-center">
          <div className="mb-8">
            <img
              src="/claude-code-cli.webp"
              alt="Claude Code CLI"
              className="mx-auto w-full max-w-3xl rounded-lg shadow-lg"
            />
          </div>

          <div className="bg-muted/30 mx-auto max-w-2xl rounded-lg border p-6">
            <p className="text-muted-foreground mb-4">
              Just say this to Claude Code:
            </p>
            <div className="
              bg-background rounded-lg border p-4 font-mono text-sm
            "
            >
              <span className="text-primary">Help me setup this project</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
