<script lang="ts">
  import type { AffiliateCardContent } from '$lib/content/site'
  import SectionHeading from '$lib/components/SectionHeading.svelte'

  export let cards: AffiliateCardContent[] = []
  export let disclosureText: string
</script>

<section id="offers">
  <SectionHeading
    eyebrow="Affiliate offers"
    title="Tools to support your payoff plan"
    description="Recommendations are selected for planning support. Calculator outputs remain independent from affiliate relationships."
  />

  <div class="alert mt-8 border border-primary/15 bg-primary/10 text-sm text-base-content/85">
    <span>{disclosureText}</span>
  </div>

  <div class="mt-8 grid gap-6 lg:grid-cols-3">
    {#each cards as card (card.title)}
      <article class="rounded-box border border-base-300 bg-base-100/85 p-5 shadow-sm sm:p-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-base-content">{card.title}</h2>
            <p class="mt-1 text-sm text-base-content/65">{card.disclosureTag}</p>
          </div>
          <span class="badge badge-primary badge-outline">{card.badge}</span>
        </div>
        <p class="mt-4 leading-7 text-base-content/80">{card.description}</p>
        <ul class="mt-4 space-y-2 text-sm text-base-content/75">
          {#each card.highlights as highlight (highlight)}
            <li class="flex gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true"></span>
              <span>{highlight}</span>
            </li>
          {/each}
        </ul>
        <div class="mt-6 flex items-center justify-between gap-3">
          <a class="btn btn-primary" href={card.href} target="_blank" rel="noreferrer">{card.ctaLabel}</a>
          <span class="text-xs text-base-content/60">FTC disclosure applies</span>
        </div>
      </article>
    {/each}
  </div>
</section>
