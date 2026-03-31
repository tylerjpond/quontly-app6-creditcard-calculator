<script lang="ts">
  import type { CalculationResult } from '$lib/creditCard'

  export let result: CalculationResult | null
  export let formatMoney: (value: number) => string
  export let onExportCsv: () => void
</script>

<section class="rounded-box border border-base-300 bg-base-100/90 p-5 sm:p-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Amortization schedule</p>
      <h2 class="text-2xl font-semibold text-base-content">Monthly payment breakdown</h2>
    </div>
    <button type="button" class="btn btn-outline btn-sm" on:click={onExportCsv} disabled={!result?.amortizationSchedule.length}>
      Export CSV
    </button>
  </div>

  {#if result}
    <div class="mt-5 overflow-x-auto rounded-box border border-base-300">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Month</th>
            <th>Payment</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Ending balance</th>
          </tr>
        </thead>
        <tbody>
          {#each result.amortizationSchedule.slice(0, 12) as row (row.month)}
            <tr>
              <td>{row.month}</td>
              <td>{formatMoney(row.payment)}</td>
              <td>{formatMoney(row.interest)}</td>
              <td>{formatMoney(row.principal)}</td>
              <td>{formatMoney(row.endingBalance)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    {#if result.amortizationSchedule.length > 12}
      <p class="mt-3 text-sm text-base-content/70">Showing the first 12 months. Use CSV export for the full schedule.</p>
    {/if}

    <div class="mt-5 rounded-box bg-base-200 p-4 text-sm leading-6 text-base-content/75">
      This plan projects payoff in {result.monthsToPayoff ?? 'N/A'} months with total interest of {formatMoney(result.totalInterest)}. Re-run after each statement cycle for more accurate planning.
    </div>

    {#if result.warnings.length}
      <div class="alert alert-warning mt-4">
        <span>{result.warnings.join(' ')}</span>
      </div>
    {/if}
  {:else}
    <div class="mt-5 rounded-box border border-dashed border-base-300 p-6 text-sm text-base-content/70">
      Enter valid calculator inputs to generate your amortization schedule and export data.
    </div>
  {/if}
</section>
