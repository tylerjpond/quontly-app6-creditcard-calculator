<script lang="ts">
  import type { LegalPageContent } from '../content/site'
  import SectionHeading from './SectionHeading.svelte'

  export let eyebrow: string
  export let page: LegalPageContent
</script>

<svelte:head>
  <title>{page.title} | Quontly</title>
  <meta name="description" content={page.description} />
</svelte:head>

<main class="mx-auto max-w-5xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
  <SectionHeading eyebrow={eyebrow} title={page.title} description={page.description} />

  <div class="mt-10 grid gap-6">
    {#each page.sections as section (section.heading)}
      <article class="rounded-box border border-base-300 bg-base-100/85 p-5 shadow-sm sm:p-6">
        <h2 class="text-2xl font-semibold text-base-content">{section.heading}</h2>
        <div class="mt-4 space-y-4 text-base leading-7 text-base-content/80">
          {#each section.paragraphs as paragraph (paragraph)}
            <p>{paragraph}</p>
          {/each}
        </div>
      </article>
    {/each}
  </div>
</main>