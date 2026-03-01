'use client'

import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
/**
 * React Hook Form Compatibility Pieces
 */
import { Slot } from '@radix-ui/react-slot'
import { Label } from '@workspace/ui/components/label'

import { cn } from '@workspace/ui/lib/utils'
import * as React from 'react'
import {
  Controller,

  FormProvider,
  useFormContext,
} from 'react-hook-form'

/**
 * FieldGroup provides a consistent layout for grouping form fields.
 */
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn('grid gap-4 sm:gap-6', className)}
      {...props}
    />
  )
}

/**
 * Field is the container for a single form control, its label, and feedback.
 */
interface FieldProps extends React.ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical' | 'responsive'
}

function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn(
        'group/field grid gap-2',
        orientation === 'horizontal' && 'grid-cols-[1fr_auto] items-center gap-4',
        orientation === 'responsive' && 'sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4',
        className,
      )}
      {...props}
    />
  )
}

/**
 * FieldLabel links a label to its form control.
 */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1 group-data-[invalid=true]/field:text-destructive transition-colors',
        className,
      )}
      {...props}
    />
  )
}

/**
 * FieldDescription provides supplementary information for a field.
 */
function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-xs text-muted-foreground/60 italic px-1', className)}
      {...props}
    />
  )
}

/**
 * FieldError displays validation errors for a field.
 */
interface FieldErrorProps extends React.ComponentProps<'p'> {
  errors?: string[] | any // TanStack Form errors can be an array of strings or other types
}

function FieldError({ className, errors, children, ...props }: FieldErrorProps) {
  const errorContent = errors
    ? (Array.isArray(errors) ? errors.join(', ') : String(errors))
    : children

  if (!errorContent)
    return null

  return (
    <p
      data-slot="field-error"
      className={cn('text-xs font-bold text-destructive pl-1 animate-in fade-in slide-in-from-top-1 duration-200', className)}
      {...props}
    >
      {errorContent}
    </p>
  )
}

/**
 * FieldSet and FieldLegend for grouping complex related inputs (like Checkbox groups).
 */
function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn('grid gap-4', className)}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }: React.ComponentProps<'legend'>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn('text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2', className)}
      {...props}
    />
  )
}

/**
 * FieldContent is a wrapper for label/description when using horizontal/responsive layouts.
 */
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn('grid gap-1', className)}
      {...props}
    />
  )
}

const Form = FormProvider

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext>
  )
}

function useFormField() {
  const fieldContext = React.use(FormFieldContext)
  try {
    const { getFieldState, formState } = useFormContext()
    const fieldState = getFieldState(fieldContext.name, formState)

    return {
      name: fieldContext.name,
      error: fieldState.error,
      ...fieldState,
    }
  }
  catch (e) {
    return { name: fieldContext?.name, error: undefined }
  }
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      aria-invalid={!!error}
      {...props}
    />
  )
}

/**
 * Re-exporting aliases for backward compatibility or alternative naming.
 */
const FormItem = Field
const FormLabel = FieldLabel
const FormDescription = FieldDescription
const FormMessage = FieldError

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
