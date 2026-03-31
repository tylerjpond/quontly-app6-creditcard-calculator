import { z } from 'zod'
import type { CalculatorInputs, RepaymentStrategy } from '$lib/creditCard'

export const inputSchema = z.object({
  balance: z.number().min(100, 'Balance must be at least $100.').max(250000, 'Balance must be $250,000 or below.'),
  apr: z.number().min(0, 'APR cannot be negative.').max(50, 'APR must be 50% or below.'),
  minimumPayment: z.number().min(0, 'Minimum payment cannot be negative.').max(20000, 'Minimum payment is too large.'),
  monthlyPayment: z.number().min(0, 'Payment cannot be negative.').max(20000, 'Monthly payment is too large.'),
  additionalMonthlyPayment: z
    .number()
    .min(0, 'Additional payment cannot be negative.')
    .max(20000, 'Additional payment is too large.'),
  strategy: z.union([z.literal('minimum-plus'), z.literal('fixed-payment'), z.literal('target-date')]),
  targetMonths: z.number().min(1, 'Target months must be at least 1.').max(600, 'Target months must be 600 or below.'),
})

export type FieldErrors = Partial<Record<keyof CalculatorInputs, string>>

export type NumericInputField = keyof Pick<
  CalculatorInputs,
  'balance' | 'apr' | 'minimumPayment' | 'monthlyPayment' | 'additionalMonthlyPayment' | 'targetMonths'
>

export function collectErrors(error: z.ZodError<CalculatorInputs> | null): FieldErrors {
  if (!error) {
    return {}
  }

  return error.issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0] as keyof CalculatorInputs | undefined
    if (field && !errors[field]) {
      errors[field] = issue.message
    }
    return errors
  }, {})
}

export function roundToStep(value: number, step: number): number {
  if (step >= 1) {
    return Math.round(value)
  }

  const precision = String(step).split('.')[1]?.length ?? 0
  return Number(value.toFixed(precision))
}

export function withNumericInputUpdate(
  inputs: CalculatorInputs,
  field: NumericInputField,
  value: string,
): CalculatorInputs {
  const next = Number(value)
  return {
    ...inputs,
    [field]: Number.isFinite(next) ? next : 0,
  }
}

export function withNudgedField(
  inputs: CalculatorInputs,
  field: NumericInputField,
  step: number,
  direction: -1 | 1,
  min: number,
  max: number,
): CalculatorInputs {
  const current = inputs[field]
  const next = roundToStep(Math.min(max, Math.max(min, current + step * direction)), step)
  return {
    ...inputs,
    [field]: next,
  }
}

export function withStrategy(inputs: CalculatorInputs, strategy: RepaymentStrategy): CalculatorInputs {
  return {
    ...inputs,
    strategy,
  }
}
