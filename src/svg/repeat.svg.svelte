<svelte:options tag={null} />
<script>
  export let variant = 'auto'
</script>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-repeat">
{#if variant === 'auto'}
  <polyline points="15 1 19 5 15 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h12"></path><line x1="22" y1="1" x2="22" y2="9"></line>
{:else}
  <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  {#if variant === 'none'}
    <line x1="14" y1="10" x2="10" y2="14"></line><line x1="10" y1="10" x2="14" y2="14"></line>
  {:else if variant === 'repeat'}
    <text x="12" y="20" transform="scale(0.75)">1</text>
  {/if}
{/if}</svg>
