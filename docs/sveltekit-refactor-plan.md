# SvelteKit Refactor Plan

## Understanding Summary

- Refactor the current credit-card payoff calculator from Vite React to SvelteKit.
- Preserve full non-chart feature parity, including calculator behavior, validation, defaults, CSV export, legal pages, and current content structure.
- Remove the charting feature entirely for now, with no placeholder UI or placeholder copy.
- Update the visual system to match the reference project in `../quontly-app2-calorie-calculator`, including DaisyUI and the same Quontly theme direction.
- Target a Cloudflare-compatible SvelteKit setup, matching the reference project.
- Copy the `BrandLogo` component from the reference project and implement it the same way.
- Keep the app as a small client-side calculator with standard accessibility and maintainability expectations.

## Assumptions

- The repayment logic in `src/lib/creditCard.ts` remains the source of truth and should be preserved exactly unless small framework-neutral cleanup is needed.
- The content in `src/content/site.ts` remains substantially the same and will be moved into the SvelteKit structure without editorial redesign.
- Existing routes map directly to SvelteKit pages: `/`, `/about`, `/privacy`, `/terms`, and `/disclosure`.
- DaisyUI theme tokens are copied closely from the reference project.
- The migration replaces the current React app rather than running React and Svelte side by side.

## Decision Log

1. Use a direct SvelteKit port with a shared layout.
   - Alternatives considered: reference-first rebuild, hybrid staged migration.
   - Why chosen: lowest migration risk while preserving behavior and matching the reference project structure.

2. Keep page state local in `+page.svelte` using Svelte reactivity.
   - Alternatives considered: Svelte stores, context, server-side form actions.
   - Why chosen: smallest viable change for a client-only calculator with no persistence.

3. Reuse the existing TypeScript calculation and content modules.
   - Alternatives considered: rewriting calculator logic during migration.
   - Why chosen: avoids logic regressions during a framework change.

4. Remove chart rendering but keep comparison data.
   - Alternatives considered: chart placeholder, replacement visualization.
   - Why chosen: explicit project constraint and best way to avoid scope creep.

5. Copy the reference DaisyUI theme and `BrandLogo` implementation closely.
   - Alternatives considered: partial style borrowing with a new token set.
   - Why chosen: consistent Quontly family look with less design churn.

## Final Design

### 1. Architecture

The refactor should become a standard SvelteKit app with one shared layout and route-based pages. The shared shell lives in `src/routes/+layout.svelte` and owns the reference-style frame: DaisyUI theme activation, the copied `BrandLogo`, the navbar links, and the footer. Global styling moves to `src/index.css`, following the reference project’s Tailwind v4 plus DaisyUI pattern, including the Quontly theme tokens and utility classes such as the background gradients and number-input spinner removal.

The main calculator moves into `src/routes/+page.svelte`. The legal routes map directly to `src/routes/about/+page.svelte`, `src/routes/privacy/+page.svelte`, `src/routes/terms/+page.svelte`, and `src/routes/disclosure/+page.svelte`. Content stays data-driven in `src/content/site.ts`, while the calculator engine remains in `src/lib/creditCard.ts`. Shared UI goes into `src/lib/components/` only where it materially reduces repetition. At minimum, `BrandLogo.svelte` is copied from the reference project verbatim.

### 2. State And Data Flow

All calculator state should remain local to `src/routes/+page.svelte`. A single `let inputs` object is initialized from `defaultInputs`, then reactive declarations derive validation, field errors, calculation results, and comparison data. The core client-side flow remains the same: user input updates `inputs`, Zod validation reruns, errors update, and repayment results recompute.

The business logic stays framework-agnostic. `calculateCreditCardPlan`, `calculateRequiredPaymentByTarget`, and the default model remain plain TypeScript functions. CSV export stays client-side through a Blob download flow. Strategy comparison also remains, but only as summary rows or cards because the chart visualization is intentionally removed.

### 3. UI Composition And Styling

The calculator page should preserve the current information architecture while adopting the reference project’s visual language. That means a reference-style themed shell, strong top-of-page heading, card-based form sections, and a sticky results column on large screens. The hero can be simplified toward the reference project’s rhythm, but it should still communicate the existing calculator purpose and CTA structure.

Form controls should be rebuilt with Svelte markup and DaisyUI classes. Repeated controls can use inline patterns initially, especially for joined numeric stepper controls and strategy toggle buttons. Summary results should remain prominent through cards for payoff date, total interest, total paid, total principal, required payment when relevant, and warnings. The comparison surface should become a compact table or grouped cards instead of a chart. The affiliate, explainer, FAQ, and legal content blocks should stay present and render from the existing content module.

### 4. Error Handling And Edge Cases

Validation remains client-side through Zod with per-field error messages. Invalid inputs should never break rendering; they only suppress result generation until the model is valid. The repayment engine’s existing warnings, such as payments not covering interest or payoff horizons exceeding practical limits, should surface in a dedicated warning area in the results column.

Edge cases to preserve include zero or near-zero APR, target-date payments below minimum payment, payoff schedules that exceed the maximum month horizon, and CSV export when there is no amortization schedule. The UI should avoid rendering empty comparison artifacts when calculations are invalid. Because the app has no backend, error handling should stay deliberately simple: validate, show field issues, and suppress invalid derived outputs.

### 5. Testing Strategy

Testing should focus on migration safety, not new feature invention. The highest-value coverage is at the logic layer in `src/lib/creditCard.ts`, where existing repayment behavior can be locked down with unit tests for defaults, payoff horizon calculations, required target-date payments, warning cases, and amortization schedule generation.

For the Svelte UI, lightweight component or page-level tests should verify the critical flows: default render, strategy switching, validation message display, legal page routing, and CSV export trigger behavior. A small smoke test against the SvelteKit routes is enough; there is no need for complex end-to-end coverage yet. The goal is to prove parity after the framework migration, not to expand the testing surface unnecessarily.

## Target File Structure

```text
src/
  content/
    site.ts
  index.css
  lib/
    components/
      BrandLogo.svelte
    creditCard.ts
  routes/
    +layout.svelte
    +page.svelte
    about/
      +page.svelte
    disclosure/
      +page.svelte
    privacy/
      +page.svelte
    terms/
      +page.svelte
```

## Migration Notes

- Replace React and React Router dependencies with SvelteKit dependencies, using the same Cloudflare adapter family as the reference project.
- Remove Recharts entirely.
- Keep DaisyUI installed and configured through Tailwind v4 in `src/index.css`.
- Move app-wide head metadata into SvelteKit route files or `+layout.svelte` where appropriate.
- Replace React event handlers and memoization with Svelte reactive declarations and direct event bindings.

## Implementation Handoff

### Recommended Sequence

1. Convert project tooling from React Vite to SvelteKit with Cloudflare adapter, Tailwind v4, and DaisyUI.
2. Copy the reference theme setup and `BrandLogo` component.
3. Move the shared shell into `src/routes/+layout.svelte`.
4. Port `src/lib/creditCard.ts` and `src/content/site.ts` unchanged or with only import-safe cleanup.
5. Rebuild the home calculator in `src/routes/+page.svelte` with exact non-chart parity.
6. Port the legal pages as route files.
7. Add or update tests around calculation logic and essential route behavior.
8. Run `svelte-check`, lint, and build verification.

### Acceptance Criteria

- The app runs as SvelteKit and builds for the Cloudflare-compatible target.
- The Quontly DaisyUI theme matches the reference project closely.
- `BrandLogo` matches the reference implementation.
- The calculator preserves non-chart behavior and outputs.
- Legal pages and CSV export still work.
- No chart UI or chart placeholder remains.
