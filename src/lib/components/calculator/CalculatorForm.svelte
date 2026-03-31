<script lang="ts">
    import type { CalculatorInputs, RepaymentStrategy } from '$lib/creditCard'
    import type { FieldErrors, NumericInputField } from '$lib/creditCard-inputs'
    import InputNumber from '../elements/InputNumber.svelte';
    import InputNumberWithSteppers from '../elements/InputNumberWithSteppers.svelte';
    import InputRange from '../elements/InputRange.svelte';

    export let inputs: CalculatorInputs
    export let fieldErrors: FieldErrors
    export let onNudgeField: (
      field: NumericInputField,
      step: number,
      direction: -1 | 1,
      min: number,
      max: number,
    ) => void
    export let onSetField: (field: NumericInputField, value: string) => void
    export let onSetStrategy: (strategy: RepaymentStrategy) => void

    function handleFieldInput(field: NumericInputField, event: Event): void {
      const target = event.currentTarget as HTMLInputElement
      onSetField(field, target.value)
    }
</script>

<div class="flex flex-col gap-10">
    <section class="flex flex-col gap-5 rounded-box border border-base-300 bg-base-100/85 p-5">
        <h3 class="text-xl font-semibold">
            Card details
        </h3>
      
        <!-- Card balance -->
        <div class="flex flex-col w-full">
            <InputRange
                classes="mb-1 [--range-fill:0] w-full"
                min={100}
                max={250000}
                step={50}
                value={inputs.balance}
                onChange={(value) => onSetField('balance', value.toString())}
            />
        
            <InputNumberWithSteppers
                classesContainer="w-full"
                classesInput = "text-center text-lg font-semibold"
                startLabel="Card balance"
                min={100}
                max={250000}
                step={100}
                value={inputs.balance}
                onInputChange={(value) => onSetField('balance', value.toString())}
                onStepperDownClick={() => onNudgeField('balance', 100, -1, 100, 250000)}
                onStepperUpClick={() => onNudgeField('balance', 100, 1, 100, 250000)}
            />
            {#if fieldErrors.balance}<span class="text-xs text-error">{fieldErrors.balance}</span>{/if}
        </div>

        <!-- APR -->
        <div class="flex flex-col">
            <InputRange
              classes="mb-1 [--range-fill:0] w-full"
              min={0}
              max={50}
              step={0.1}
              value={inputs.apr}
              onChange={(value) => onSetField('apr', value.toString())}
          />

          <InputNumberWithSteppers
              classesContainer="w-full"
              classesInput = "text-center text-lg font-semibold"
              startLabel="APR"
              endLabel="%"
              min={0}
              max={50}
              step={0.1}
              value={inputs.apr}
              onInputChange={(value) => onSetField('apr', value.toString())}
              onStepperDownClick={() => onNudgeField('apr', 0.1, -1, 0, 50)}
              onStepperUpClick={() => onNudgeField('apr', 0.1, 1, 0, 50)}
          />
          {#if fieldErrors.apr}<span class="text-xs text-error">{fieldErrors.apr}</span>{/if}
        </div>

        <!-- Minimum Payment -->
        <div class="flex flex-col">
          <InputRange
              classes="mb-1 [--range-fill:0] w-full"
              min={0}
              max={20000}
              step={10}
              value={inputs.minimumPayment}
              onChange={(value) => onSetField('minimumPayment', value.toString())}
          />

          <InputNumberWithSteppers
              classesContainer="w-full"
              classesInput = "text-center text-lg font-semibold"
              startLabel="Minimum"
              min={0}
              max={20000}
              step={10}
              value={inputs.minimumPayment}
              onInputChange={(value) => onSetField('minimumPayment', value.toString())}
              onStepperDownClick={() => onNudgeField('minimumPayment', 10, -1, 0, 20000)}
              onStepperUpClick={() => onNudgeField('minimumPayment', 10, 1, 0, 20000)}
          />
          {#if fieldErrors.minimumPayment}<span class="text-xs text-error">{fieldErrors.minimumPayment}</span>{/if}
        </div>
  </section>

  <section class="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100/85 p-5">
      <h3 class="text-xl font-semibold">
          Repayment strategy
      </h3>

      <div class="flex flex-wrap gap-3 justify-between">
        <button type="button" class={`btn grow ${inputs.strategy === 'fixed-payment' ? 'btn-primary' : 'btn-outline'}`} on:click={() => onSetStrategy('fixed-payment')}>Fixed payment</button>
        <button type="button" class={`btn grow ${inputs.strategy === 'minimum-plus' ? 'btn-primary' : 'btn-outline'}`} on:click={() => onSetStrategy('minimum-plus')}>Minimum + extra</button>
        <button type="button" class={`btn grow ${inputs.strategy === 'target-date' ? 'btn-primary' : 'btn-outline'}`} on:click={() => onSetStrategy('target-date')}>Target date</button>
      </div>

      {#if inputs.strategy === 'fixed-payment'}
        <div class="flex flex-col">
          <InputRange
            classes="mb-1 [--range-fill:0] w-full"
            min={0}
            max={20000}
            step={10}
            value={inputs.monthlyPayment}
            onChange={(value) => onSetField('monthlyPayment', value.toString())}
          />

          <InputNumberWithSteppers
              classesContainer="w-full"
              classesInput = "text-center text-lg font-semibold"
              startLabel="Monthly payment"
              min={0}
              max={20000}
              step={10}
              value={inputs.monthlyPayment}
              onInputChange={(value) => onSetField('monthlyPayment', value.toString())}
              onStepperDownClick={() => onNudgeField('monthlyPayment', 10, -1, 0, 20000)}
              onStepperUpClick={() => onNudgeField('monthlyPayment', 10, 1, 0, 20000)}
          />

          {#if fieldErrors.monthlyPayment}<span class="text-xs text-error">{fieldErrors.monthlyPayment}</span>{/if}
        </div>
      {/if}

      {#if inputs.strategy === 'minimum-plus'}
        <div class="flex flex-col">
          <InputRange
            classes="mb-1 [--range-fill:0] w-full"
            min={0}
            max={20000}
            step={10}
            value={inputs.additionalMonthlyPayment}
            onChange={(value) => onSetField('additionalMonthlyPayment', value.toString())}
          />

          <InputNumberWithSteppers
              classesContainer="w-full"
              classesInput = "text-center text-lg font-semibold"
              startLabel="Extra payment"
              endLabel="(over minimum)"
              min={0}
              max={20000}
              step={10}
              value={inputs.additionalMonthlyPayment}
              onInputChange={(value) => onSetField('additionalMonthlyPayment', value.toString())}
              onStepperDownClick={() => onNudgeField('additionalMonthlyPayment', 10, -1, 0, 20000)}
              onStepperUpClick={() => onNudgeField('additionalMonthlyPayment', 10, 1, 0, 20000)}
          />
          {#if fieldErrors.additionalMonthlyPayment}<span class="text-xs text-error">{fieldErrors.additionalMonthlyPayment}</span>{/if}
        </div>
      {/if}

      {#if inputs.strategy === 'target-date'}
        <div class="flex flex-col">
          <InputRange
            classes="mb-1 [--range-fill:0] w-full"
            min={1}
            max={600}
            step={1}
            value={inputs.targetMonths}
            onChange={(value) => onSetField('targetMonths', value.toString())}
          />

          <InputNumberWithSteppers
              classesContainer="w-full"
              classesInput = "text-center text-lg font-semibold"
              startLabel="Target payoff window"
              endLabel="(months to zero balance)"
              min={1}
              max={600}
              step={1}
              value={inputs.targetMonths}
              onInputChange={(value) => onSetField('targetMonths', value.toString())}
              onStepperDownClick={() => onNudgeField('targetMonths', 1, -1, 1, 600)}
              onStepperUpClick={() => onNudgeField('targetMonths', 1, 1, 1, 600)}
          />
          {#if fieldErrors.targetMonths}<span class="text-xs text-error">{fieldErrors.targetMonths}</span>{/if}
        </div>
      {/if}
  </section>
</div>
