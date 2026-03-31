<script lang="ts">
    export let min: number
    export let max: number
    export let step: number
    export let value: number
    export let classes: string = ''
    export let classesContainer: string = ''
    export let startLabel: string | null = null
    export let endLabel: string | null = null
    export let onChange: (value: number) => void
    
    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = parseFloat(target.value)
        if (!isNaN(newValue)) {
            onChange(newValue)
        }
    }
</script>


<label class={"input" + (classesContainer ? " " + classesContainer : "")}>
    {#if startLabel}
        <span class="label font-semibold">{startLabel}</span>
    {/if}
    <input
        type="number"
        class="{classes}"
        min={min}
        max={max}
        step={step}
        value={value}
        on:input={handleInput}
    />
    {#if endLabel}
        <span class="label font-semibold">{endLabel}</span>
    {/if}
</label>

