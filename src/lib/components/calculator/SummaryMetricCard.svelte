<script lang="ts">
  export let title: string
  export let value: string
  export let detail: string
  export let highlighted = false
</script>

<article class={`card border ${highlighted ? 'border-primary/30 bg-primary/10' : 'border-base-300 bg-base-100'}`}>
  <div class="card-body">
    <p class="text-xs uppercase tracking-[0.2em] text-base-content/70">
      {title}
    </p>
    <p class="text-2xl font-semibold">{value}</p>
    <p class="text-sm text-base-content/80">{detail}</p>
  </div>
</article>
