<svelte:options tag={null} />
<script>
  import { getContext } from 'svelte'
  import { contextStores as CS, trackTitle } from './lib'
  const currentTrack = getContext(CS.CURRENT_TRACK)
  const hasError = getContext(CS.HAS_ERROR)
  const maxTries = getContext(CS.MAX_TRIES)

  import AlertCircleIcon from './svg/alert-circle.svg.svelte'

  let container = false
  let heading = false
  let title = "Loading..."
  let animate = false
  let centered = true
  let aniTime = 15
  let panPx = 100
  let error = false
  let canretry = true
  let winWidth
  $: {
    winWidth
    error = $hasError
    title = trackTitle($currentTrack)
    if (container && heading) {
      panPx = heading.offsetWidth - container.offsetWidth + (error ? 20 : 0)
      animate = panPx > 0
      centered = !animate
      aniTime = panPx / 50
      if (aniTime < 5) aniTime += 5
      if (heading.style) {
        heading.style.animationName = 'none'
        heading.offsetWidth // trigger reflow
        heading.style.animationName = null
      }
      console.log(`ww: ${winWidth}, h.sW: ${heading.scrollWidth}, h.oW: ${heading.offsetWidth}, h.ww: ${heading.width}`)
    }
    canretry = $currentTrack.tryCount < $maxTries
  }
</script>

<svelte:window bind:innerWidth={winWidth}/>

<div bind:this={container} class:error class:canretry
 style="
--marquee-time: {aniTime}s;
--title: '{title}';
--w-heading: {heading?.offsetWidth || 0}px;
--w-pad: 5ch;
">
  <h3 bind:this={heading} class:animate class:centered>
    {#if error}
    <span class="error-icon">
      <AlertCircleIcon />
    </span>
    {/if}
    {title}
  </h3>
</div>

<style>
  div {
    text-align: center;
    overflow: hidden;
    position: relative;
    height: 2em;
    padding: 0.2em 0;
  }
  .error {
    color: var(--color-error, red);
  }
  .error.canretry {
    color: var(--color-warn, darkorange);
  }
  .error-icon {
    display: inline-block;
    width: 1rem;
    height: 1rem;
  }
  h3 {
    white-space: nowrap;
    display: inline-block;
    margin: 0;
    left: 0;
    font-family: var(--ap-font-family-heading);
  }
  h3.animate {
    position: absolute;
    animation: marquee var(--marquee-time, 15s) linear infinite;
  }
  h3.animate::after {
    content: var(--title);
    margin-left: var(--w-pad);
  }
  h3.centered {
    right: 0;
  }
  @keyframes marquee {
    10% {
      left: 0;
    }
    100% {
      left: calc(-1 * (var(--w-heading) / 2 + var(--w-pad) / 2));
    }
  }
</style>