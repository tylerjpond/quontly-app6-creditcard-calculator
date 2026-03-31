<script lang="ts">
  import type { CalculationResult, RepaymentStrategy } from '$lib/creditCard'
  import SummaryMetricCard from '$lib/components/calculator/SummaryMetricCard.svelte'

  export let result: CalculationResult | null
  export let strategy: RepaymentStrategy
  export let formatMoney: (value: number) => string
</script>

<div class="grid gap-4 sm:grid-cols-2">
  <SummaryMetricCard
    title="Months to payoff"
    value={result?.monthsToPayoff ? `${result.monthsToPayoff} mo` : 'N/A'}
    detail={result?.payoffDateLabel ? `Estimated completion ${result.payoffDateLabel}` : 'Set valid inputs to calculate.'}
    highlighted={true}
  />
  <SummaryMetricCard
    title="Required payment"
    value={result?.requiredPaymentForTarget ? formatMoney(result.requiredPaymentForTarget) : 'N/A'}
    detail={strategy === 'target-date' ? 'Needed to hit target window' : 'Only shown in target-date mode'}
  />
  <SummaryMetricCard
    title="Total interest"
    value={result ? formatMoney(result.totalInterest) : '$0'}
    detail={result ? `Total paid ${formatMoney(result.totalPaid)}` : 'Projected over full payoff horizon'}
  />
  <SummaryMetricCard
    title="Principal repaid"
    value={result ? formatMoney(result.totalPrincipalPaid) : '$0'}
    detail="Modeled principal reduction"
  />
</div>
