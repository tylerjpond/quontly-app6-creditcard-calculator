<script lang="ts">
  import SectionHeading from '$lib/components/SectionHeading.svelte'
  import AffiliateCardsSection from '$lib/components/calculator/AffiliateCardsSection.svelte'
  import AmortizationPanel from '$lib/components/calculator/AmortizationPanel.svelte'
  import CalculatorForm from '$lib/components/calculator/CalculatorForm.svelte'
  import CalculatorHero from '$lib/components/calculator/CalculatorHero.svelte'
  import ExplainerSection from '$lib/components/calculator/ExplainerSection.svelte'
  import ScenarioComparisonPanel from '$lib/components/calculator/ScenarioComparisonPanel.svelte'
  import SummaryMetricsGrid from '$lib/components/calculator/SummaryMetricsGrid.svelte'
  import {
    calculateCreditCardPlan,
    defaultInputs,
    type CalculatorInputs,
    type RepaymentStrategy,
  } from '$lib/creditCard'
  import {
    collectErrors,
    inputSchema,
    withNudgedField,
    withNumericInputUpdate,
    withStrategy,
    type NumericInputField,
  } from '$lib/creditCard-inputs'
  import { csvCell, decimal, formatMoney } from '$lib/formatters'
  import { affiliateCards, explainerSections, faqs, siteMeta } from '../lib/content/site'

  interface ScenarioComparisonItem {
    key: RepaymentStrategy
    label: string
    payment: number
    monthsToPayoff: number | null
    totalInterest: number
  }

  let inputs: CalculatorInputs = { ...defaultInputs }

  $: validation = inputSchema.safeParse(inputs)
  $: fieldErrors = collectErrors(validation.success ? null : validation.error)
  $: result = validation.success ? calculateCreditCardPlan(inputs) : null
  $: strategyComparison = buildStrategyComparison(inputs)

  function buildStrategyComparison(currentInputs: CalculatorInputs): ScenarioComparisonItem[] {
    const scenarios: Array<{ key: RepaymentStrategy; label: string; scenarioInputs: CalculatorInputs }> = [
      { key: 'fixed-payment', label: 'Fixed payment', scenarioInputs: { ...currentInputs, strategy: 'fixed-payment' } },
      { key: 'minimum-plus', label: 'Minimum + extra', scenarioInputs: { ...currentInputs, strategy: 'minimum-plus' } },
      { key: 'target-date', label: 'Target date', scenarioInputs: { ...currentInputs, strategy: 'target-date' } },
    ]

    return scenarios.map((scenario) => {
      const scenarioResult = calculateCreditCardPlan(scenario.scenarioInputs)
      const scenarioPayment =
        scenario.key === 'fixed-payment'
          ? scenario.scenarioInputs.monthlyPayment
          : scenario.key === 'minimum-plus'
            ? scenario.scenarioInputs.minimumPayment + scenario.scenarioInputs.additionalMonthlyPayment
            : scenarioResult.requiredPaymentForTarget ?? 0

      return {
        key: scenario.key,
        label: scenario.label,
        payment: scenarioPayment,
        monthsToPayoff: scenarioResult.monthsToPayoff,
        totalInterest: scenarioResult.totalInterest,
      }
    })
  }

  function setNumericField(field: NumericInputField, value: string): void {
    inputs = withNumericInputUpdate(inputs, field, value)
  }

  function nudgeField(field: NumericInputField, step: number, direction: -1 | 1, min: number, max: number): void {
    inputs = withNudgedField(inputs, field, step, direction, min, max)
  }

  function setStrategy(strategy: RepaymentStrategy): void {
    inputs = withStrategy(inputs, strategy)
  }

  function exportAmortizationCsv(): void {
    if (!result?.amortizationSchedule.length) {
      return
    }

    const headers = ['Month', 'Starting Balance', 'Payment', 'Interest', 'Principal', 'Ending Balance']
    const rows = result.amortizationSchedule.map((row) => [
      row.month,
      row.startingBalance,
      row.payment,
      row.interest,
      row.principal,
      row.endingBalance,
    ])

    const csv = [headers.join(','), ...rows.map((row) => row.map(csvCell).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `amortization-schedule-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
</script>

<svelte:head>
  <title>{siteMeta.siteName} | Quontly</title>
  <meta
    name="description"
    content="Estimate payoff date, required payment, and total interest using fixed payment, minimum-plus, or target-date strategies."
  />
</svelte:head>

<main class="container mx-auto flex max-w-7xl flex-col gap-10 p-5">
  <section class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:pt-4">
    <CalculatorHero {result} {formatMoney} {decimal} />
  </section>

  <section id="calculator">
    <SectionHeading
      eyebrow="Calculator"
      title="Set your debt profile and repayment strategy"
      description="Adjust your balance, APR, and repayment approach to compare payoff speed, total interest, and monthly burden."
    />

    <div class="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)] xl:items-start">
      <CalculatorForm
        {inputs}
        {fieldErrors}
        onNudgeField={nudgeField}
        onSetField={setNumericField}
        onSetStrategy={setStrategy}
      />

      <div class="space-y-6 xl:self-start">
        <SummaryMetricsGrid {result} strategy={inputs.strategy} {formatMoney} />
        <ScenarioComparisonPanel scenarios={strategyComparison} {formatMoney} />
      </div>

      <div class="xl:col-span-2">
        <AmortizationPanel {result} {formatMoney} onExportCsv={exportAmortizationCsv} />
      </div>
    </div>
  </section>

  <AffiliateCardsSection cards={affiliateCards} disclosureText={siteMeta.disclosure} />
  <ExplainerSection sections={explainerSections} {faqs} />
</main>
