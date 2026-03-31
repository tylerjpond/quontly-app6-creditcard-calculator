<script lang="ts">
  interface ScenarioComparisonItem {
    key: string
    label: string
    payment: number
    monthsToPayoff: number | null
    totalInterest: number
  }

  export let scenarios: ScenarioComparisonItem[] = []
  export let formatMoney: (value: number) => string
</script>

<section class="rounded-box border border-base-300 bg-base-100/90 p-5 sm:p-6">
  <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Scenario comparison</p>
      <h2 class="text-2xl font-semibold text-base-content">Side-by-side strategy outcomes</h2>
    </div>
    <p class="text-sm text-base-content/65">Compare monthly burden vs payoff speed</p>
  </div>

  <div class="mt-5 grid gap-3 md:grid-cols-3">
    {#each scenarios as scenario (scenario.key)}
      <article class="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/65">{scenario.label}</p>
        <p class="mt-2 text-2xl font-semibold">{formatMoney(scenario.payment)}</p>
        <p class="mt-2 text-sm text-base-content/80">{scenario.monthsToPayoff ? `${scenario.monthsToPayoff} months` : 'No payoff'}</p>
        <p class="text-sm text-base-content/80">Interest: {formatMoney(scenario.totalInterest)}</p>
      </article>
    {/each}
  </div>
</section>
