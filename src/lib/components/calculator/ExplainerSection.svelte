<script lang="ts">
  import type { ContentSection } from '../../content/site'
  import SectionHeading from '$lib/components/SectionHeading.svelte'
  import FaqSection from '$lib/components/calculator/FaqSection.svelte'

  export let sections: ContentSection[] = []
  export let faqs: readonly { question: string; answer: string }[] = []
</script>

<section id="how-it-works">
  <SectionHeading
    eyebrow="Guide"
    title="How this payoff calculator works"
    description="Understand the repayment assumptions, monthly compounding model, and how to interpret your payoff results."
  />

  <div class="mt-10 grid gap-6 xl:grid-cols-3">
    {#each sections as section (section.title)}
      <article class="rounded-box border border-base-300 bg-base-100/85 p-5 shadow-sm sm:p-6">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{section.eyebrow}</p>
        <h2 class="mt-3 text-2xl font-semibold text-base-content">{section.title}</h2>
        <div class="mt-4 space-y-4 leading-7 text-base-content/80">
          {#each section.paragraphs as paragraph (paragraph)}
            <p>{paragraph}</p>
          {/each}
        </div>
      </article>
    {/each}
  </div>

  <div class="mt-12">
    <FaqSection items={faqs} />
  </div>
</section>