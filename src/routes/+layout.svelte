<script lang="ts">
  import AppFooter from '$lib/components/AppFooter.svelte'
  import AppHeader from '$lib/components/AppHeader.svelte'
  import '../index.css'

  const year = new Date().getFullYear()
</script>

<div data-theme="quontly" class="min-h-screen bg-hub text-base-content">
  <AppHeader />

  <slot />

  <AppFooter {year} />
</div>