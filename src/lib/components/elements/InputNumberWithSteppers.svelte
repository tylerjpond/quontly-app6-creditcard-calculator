<script lang="ts">
    import InputNumber from "./InputNumber.svelte";

    export let startLabel: string | null = null
    export let endLabel: string | null = null
    export let min: number
    export let max: number
    export let step: number
    export let value: number
    export let classesContainer: string = ''
    export let classesInput: string = ''
    export let classesStepper: string = ''
    export let onInputChange: (value: number) => void
    export let onStepperDownClick: () => void
    export let onStepperUpClick: () => void
    
    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = parseFloat(target.value)
        if (!isNaN(newValue)) {
            onInputChange(newValue)
        }
    }
</script>


<div class="join">
    <button class="btn join-item {classesStepper}" type="button" on:click={onStepperDownClick}>−</button>
    
    <InputNumber
        classesContainer="{classesContainer}"
        classes="join-item no-spinner {classesInput}"
        startLabel={startLabel}
        endLabel={endLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onInputChange}
    />
    
    <button class="btn join-item {classesStepper}" type="button" on:click={onStepperUpClick}>+</button>
</div>