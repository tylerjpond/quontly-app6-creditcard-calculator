<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte'
  import { legalPageCopy } from '../../lib/content/site'
</script>

<LegalPage eyebrow="Methodology" page={legalPageCopy.about} />