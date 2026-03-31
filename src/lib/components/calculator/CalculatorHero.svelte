<script lang="ts">
  import type { CalculationResult } from '$lib/creditCard'

  export let result: CalculationResult | null
  export let formatMoney: (value: number) => string
  export let decimal: (value: number) => string
</script>

<div class="space-y-6">
  <div class="text-primary text-xs font-semibold uppercase tracking-[0.24em]">
    Credit Card Payoff Calculator
  </div>
  <div class="space-y-4">
    <h1 class="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
      Build a payoff plan with timeline, interest clarity, and side-by-side strategy comparison.
    </h1>
    <p class="max-w-2xl text-lg leading-8 text-base-content/80">
      Estimate your payoff date, required payment, and total interest using fixed payment, minimum-plus, or target-date repayment strategies.
    </p>
  </div>
  <div class="flex flex-wrap gap-3">
    <a class="btn btn-primary" href="#calculator">Build my plan</a>
    <a class="btn btn-outline" href="#how-it-works">See assumptions</a>
  </div>
  <div class="grid gap-3 sm:grid-cols-3">
    <div class="rounded-box border border-base-300 bg-base-100/70 p-4">
      <p class="text-sm text-base-content/65">Core outputs</p>
      <p class="mt-1 text-lg font-semibold">Timeline + interest</p>
    </div>
    <div class="rounded-box border border-base-300 bg-base-100/70 p-4">
      <p class="text-sm text-base-content/65">Repayment modes</p>
      <p class="mt-1 text-lg font-semibold">3 strategy options</p>
    </div>
    <div class="rounded-box border border-base-300 bg-base-100/70 p-4">
      <p class="text-sm text-base-content/65">Validation</p>
      <p class="mt-1 text-lg font-semibold">Real-time checks</p>
    </div>
  </div>
</div>

<div class="rounded-box border border-primary/20 bg-base-100/90 shadow-xl shadow-primary/5">
  <div class="space-y-5 p-6">
    <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Quick snapshot</p>
    <div class="space-y-3">
      <div>
        <p class="text-sm text-base-content/65">Estimated payoff</p>
        <p class="text-4xl font-semibold">{result?.payoffDateLabel ?? 'N/A'}</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-box border border-base-300 bg-base-100 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-base-content/65">Total interest</p>
          <p class="mt-2 text-2xl font-semibold">{result ? formatMoney(result.totalInterest) : '$0'}</p>
        </div>
        <div class="rounded-box border border-base-300 bg-base-100 p-4">
          <p class="text-xs uppercase tracking-[0.2em] text-base-content/65">Monthly rate</p>
          <p class="mt-2 text-2xl font-semibold">{result ? `${decimal(result.effectiveMonthlyRate * 100)}%` : '0.00%'}</p>
        </div>
      </div>
    </div>
    <p class="rounded-box bg-base-200 p-4 text-sm leading-6 text-base-content/75">
      Educational estimate only. Verify details against your issuer statements before making repayment commitments.
    </p>
  </div>
</div>
