<script lang="ts">
  export let items: readonly { question: string; answer: string }[]
</script>

<section class="space-y-4">
  <h2 class="text-3xl font-semibold">FAQ</h2>
  <div class="space-y-3">
    {#each items as item, index}
      <div class="collapse collapse-plus border border-base-300 bg-base-100">
        <input type="radio" name="faq-accordion" id="faq-{index}" />
        <div class="collapse-title font-semibold">{item.question}</div>
        <div class="collapse-content text-sm">{item.answer}</div>
      </div>
    {/each}
  </div>
</section>
