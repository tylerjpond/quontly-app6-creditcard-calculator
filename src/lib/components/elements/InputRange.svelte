<script lang="ts">
    export let min: number
    export let max: number
    export let step: number
    export let value: number
    export let classes: string = ''
    export let onChange: (value: number) => void
    
    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement
        const newValue = parseFloat(target.value)
        if (!isNaN(newValue)) {
            onChange(newValue)
        }
    }
</script>

<input
    type="range"
    class="range range-primary ${classes}"
    min={min}
    max={max}
    step={step}
    value={value}
    on:input={handleInput}
/>
