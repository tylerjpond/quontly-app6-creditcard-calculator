<script lang="ts">
  import BrandLogo from '$lib/components/BrandLogo.svelte'

  const navItems = [
    { href: '/', label: 'Calculator' },
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/disclosure', label: 'Disclosure' },
  ]
</script>

<header class="border-b border-base-300/70 bg-base-100/75 backdrop-blur">
  <div class="navbar mx-auto lg:max-w-7xl px-4">
  
    <div class="navbar-start">
      <BrandLogo />
      <span class="ml-2 text-lg font-semibold text-primary whitespace-nowrap">Credit Card Payoff Calculator</span>
    </div>

    <!-- Desktop menu -->
    <div class="navbar-end hidden gap-1 md:flex">
      <ul class="menu menu-horizontal">
        {#each navItems as item}
          <li><a class="btn btn-ghost btn-sm" href={item.href}>{item.label}</a></li>
        {/each}
      </ul>
    </div>
    
    <!-- Mobile menu -->
    <div class="dropdown navbar-end md:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
      </div>
      <ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        {#each navItems as item}
          <li><a class="btn btn-ghost btn-sm" href={item.href}>{item.label}</a></li>
        {/each}
      </ul>
    </div>
  </div>
</header>