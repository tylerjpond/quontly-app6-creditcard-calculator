export type RepaymentStrategy = 'minimum-plus' | 'fixed-payment' | 'target-date'

export interface CalculatorInputs {
  balance: number
  apr: number
  minimumPayment: number
  monthlyPayment: number
  additionalMonthlyPayment: number
  strategy: RepaymentStrategy
  targetMonths: number
}

export interface AmortizationRow {
  month: number
  startingBalance: number
  payment: number
  interest: number
  principal: number
  endingBalance: number
}

export interface CalculationResult {
  effectiveMonthlyRate: number
  monthsToPayoff: number | null
  requiredPaymentForTarget: number | null
  totalInterest: number
  totalPaid: number
  totalPrincipalPaid: number
  payoffDateLabel: string | null
  warnings: string[]
  amortizationSchedule: AmortizationRow[]
}

export const defaultInputs: CalculatorInputs = {
  balance: 9500,
  apr: 21.99,
  minimumPayment: 225,
  monthlyPayment: 325,
  additionalMonthlyPayment: 0,
  strategy: 'fixed-payment',
  targetMonths: 36,
}

const MAX_MONTHS = 1200

export function monthlyRateFromApr(apr: number) {
  return clamp(apr, 0, 100) / 100 / 12
}

export function calculateCreditCardPlan(inputs: CalculatorInputs): CalculationResult {
  const warnings: string[] = []
  const monthlyRate = monthlyRateFromApr(inputs.apr)

  const configuredPayment = resolveConfiguredPayment(inputs)

  const { schedule, warnings: scheduleWarnings } = buildAmortizationSchedule({
    balance: inputs.balance,
    monthlyRate,
    monthlyPayment: configuredPayment,
  })

  warnings.push(...scheduleWarnings)

  const totalInterest = round2(schedule.reduce((sum, row) => sum + row.interest, 0))
  const totalPaid = round2(schedule.reduce((sum, row) => sum + row.payment, 0))
  const totalPrincipalPaid = round2(schedule.reduce((sum, row) => sum + row.principal, 0))

  const monthsToPayoff = schedule.length > 0 && schedule[schedule.length - 1].endingBalance <= 0 ? schedule.length : null
  const payoffDateLabel = monthsToPayoff ? buildPayoffLabel(monthsToPayoff) : null

  let requiredPaymentForTarget: number | null = null

  if (inputs.strategy === 'target-date') {
    const payment = calculateRequiredPaymentByTarget({
      balance: inputs.balance,
      apr: inputs.apr,
      targetMonths: inputs.targetMonths,
      minimumPayment: inputs.minimumPayment,
    })

    requiredPaymentForTarget = payment

    if (payment !== null && payment < inputs.minimumPayment) {
      warnings.push('Required payment is below your stated minimum payment, so minimum payment is used.')
    }
  }

  return {
    effectiveMonthlyRate: round4(monthlyRate),
    monthsToPayoff,
    requiredPaymentForTarget,
    totalInterest,
    totalPaid,
    totalPrincipalPaid,
    payoffDateLabel,
    warnings,
    amortizationSchedule: schedule,
  }
}

export function calculateRequiredPaymentByTarget({
  balance,
  apr,
  targetMonths,
  minimumPayment,
}: {
  balance: number
  apr: number
  targetMonths: number
  minimumPayment: number
}) {
  const safeBalance = clamp(balance, 0, 10_000_000)
  const safeTargetMonths = clamp(Math.round(targetMonths), 1, MAX_MONTHS)
  const monthlyRate = monthlyRateFromApr(apr)

  if (safeBalance <= 0) {
    return 0
  }

  let rawPayment = 0

  if (monthlyRate === 0) {
    rawPayment = safeBalance / safeTargetMonths
  } else {
    const growth = Math.pow(1 + monthlyRate, safeTargetMonths)
    rawPayment = (safeBalance * monthlyRate * growth) / (growth - 1)
  }

  const required = Math.max(rawPayment, minimumPayment)
  return round2(required)
}

export function buildAmortizationSchedule({
  balance,
  monthlyRate,
  monthlyPayment,
}: {
  balance: number
  monthlyRate: number
  monthlyPayment: number
}) {
  const warnings: string[] = []
  const schedule: AmortizationRow[] = []

  let remaining = round2(Math.max(0, balance))
  let month = 0

  if (remaining <= 0) {
    return { schedule, warnings }
  }

  while (remaining > 0 && month < MAX_MONTHS) {
    month += 1

    const interest = round2(remaining * monthlyRate)
    const requiredMin = interest + 1
    const payment = round2(Math.max(monthlyPayment, requiredMin))

    if (payment <= interest) {
      warnings.push('Payment does not cover monthly interest. Balance will not decrease.')
      break
    }

    const principal = round2(Math.min(payment - interest, remaining))
    const endingBalance = round2(Math.max(remaining - principal, 0))

    schedule.push({
      month,
      startingBalance: remaining,
      payment,
      interest,
      principal,
      endingBalance,
    })

    remaining = endingBalance
  }

  if (remaining > 0 && month >= MAX_MONTHS) {
    warnings.push('Payoff horizon exceeded 100 years. Increase monthly payment.')
  }

  return { schedule, warnings }
}

function resolveConfiguredPayment(inputs: CalculatorInputs) {
  const minimumBase = clamp(inputs.minimumPayment, 0, 100_000)

  if (inputs.strategy === 'minimum-plus') {
    return minimumBase + clamp(inputs.additionalMonthlyPayment, 0, 100_000)
  }

  if (inputs.strategy === 'target-date') {
    const payment = calculateRequiredPaymentByTarget({
      balance: inputs.balance,
      apr: inputs.apr,
      targetMonths: inputs.targetMonths,
      minimumPayment: minimumBase,
    })

    return payment ?? minimumBase
  }

  return clamp(inputs.monthlyPayment, 0, 100_000)
}

function buildPayoffLabel(monthsToPayoff: number) {
  const now = new Date()
  const payoff = new Date(now.getFullYear(), now.getMonth() + monthsToPayoff, 1)
  return payoff.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

function round2(value: number) {
  return Math.round(value * 100) / 100
}

function round4(value: number) {
  return Math.round(value * 10000) / 10000
}
