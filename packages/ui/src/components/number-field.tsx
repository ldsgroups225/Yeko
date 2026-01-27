import * as React from "react";
import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { cn } from "@workspace/ui/lib/utils";
import { IconMinus, IconPlus } from "@tabler/icons-react";

const NumberField = NumberFieldPrimitive.Root;

function NumberFieldGroup({
  className,
  ...props
}: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function NumberFieldInput({
  className,
  ...props
}: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "bg-background border-input flex w-full border-y text-center text-sm shadow-sm transition-colors tabular-nums placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  ...props
}: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        "border-input bg-background hover:bg-accent hover:text-accent-foreground flex size-8 items-center justify-center rounded-l-lg border transition-colors disabled:opacity-50 select-none",
        className
      )}
      {...props}
    >
      <IconMinus className="size-3.5" />
    </NumberFieldPrimitive.Decrement>
  );
}

function NumberFieldIncrement({
  className,
  ...props
}: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(
        "border-input bg-background hover:bg-accent hover:text-accent-foreground flex size-8 items-center justify-center rounded-r-lg border transition-colors disabled:opacity-50 select-none",
        className
      )}
      {...props}
    >
      <IconPlus className="size-3.5" />
    </NumberFieldPrimitive.Increment>
  );
}

function NumberFieldScrubArea({
  className,
  ...props
}: NumberFieldPrimitive.ScrubArea.Props) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn("cursor-ew-resize select-none", className)}
      {...props}
    />
  );
}

function NumberFieldScrubAreaCursor({
  className,
  ...props
}: NumberFieldPrimitive.ScrubAreaCursor.Props) {
  return (
    <NumberFieldPrimitive.ScrubAreaCursor
      data-slot="number-field-scrub-area-cursor"
      className={cn("drop-shadow-[0_1px_1px_#0008] filter", className)}
      {...props}
    >
      <CursorGrowIcon />
    </NumberFieldPrimitive.ScrubAreaCursor>
  );
}

function CursorGrowIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="black"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};
