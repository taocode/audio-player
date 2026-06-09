<svelte:options tag={null} />
<script>
  import { getContext } from 'svelte'

  import { contextStores as CS } from './lib' 
  const paused = getContext(CS.PAUSED)
  const isReady = getContext(CS.IS_READY)
  const hasError = getContext(CS.HAS_ERROR)
  const playWhenReady = getContext(CS.PLAY_WHEN_READY)
  const currentIndex = getContext(CS.CURRENT_INDEX)
  const currentTrack = getContext(CS.CURRENT_TRACK)
  const maxTries = getContext(CS.MAX_TRIES)
  const retry = getContext(CS.RETRY)
  const retrying = getContext(CS.RETRYING)

  import PlayIcon from './svg/play.svg.svelte'
  import PauseIcon from './svg/pause.svg.svelte'
  import LoaderIcon from './svg/loader.svg.svelte'
  import SlashIcon from './svg/slash.svg.svelte'
  import RefreshIcon from './svg/refresh.svg.svelte'

  const playPauseAudio = () => {
		try {
      playWhenReady.set(false)
      paused.set(!$paused)
		}	catch(err) {
			console.error('playPause',err)
		}
	}
  export const refresh = () => {
    retry.set(true)
  }
  $: remainingTries = $maxTries - ($currentTrack.hasOwnProperty("tryCount") ? $currentTrack.tryCount : 0)
  $: canretry = $retry
</script>

<div class:$hasError class="play-control">
{#if $hasError}
  {#if $currentTrack.tryCount < $maxTries || $retrying}
    <button on:click={refresh} title='Retry?'>
      <span class="icon icon-retry" class:canretry class:$retrying>
        <RefreshIcon />
      </span>
      <span class="remaining">{remainingTries}</span>
    </button>
  {:else}
    <span class="icon icon-error">
      <SlashIcon />
    </span>
  {/if}
{:else}
  {#if !$isReady}
  <div class="loading">
    <div class="icon loader add-animate-mask">
      <LoaderIcon />
    </div>
  </div>
  {:else}
  <button id="play" title={$paused ? 'Play' : 'Pause' } on:click={playPauseAudio}>
    <span class="icon icon-playpause">
      {#if $paused}
      <PlayIcon />
      {:else}
      <PauseIcon />
      {/if}
    </span>
  </button>
  {/if}
{/if}
</div>

<style>
  .play-control {
    width: 2rem;
    height: 2rem;
    position: relative;
  }
  .icon {
    display: inline-block;
    width: 2rem;
    height: 2rem;
  }
  button {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    /* width: 1ch; */
    border: none;
    padding: 0;
    cursor: pointer;
    margin: 0;
    height: 2rem;
    width: 2rem;
    border-radius: 100%;
    transition: all 100ms ease-out;
    background-color: transparent;
  }
  button:hover,
  button:focus {
    background: var(--audio-player-background-semi);
    box-shadow: 0 0 0px 6px var(--audio-player-background-semi);
  }
  button:focus-visible {
    outline: var(--audio-player-color, -webkit-focus-ring-color) auto 1px;
    outline-offset: 5px;
  }
  .\$hasError,
  .icon-error {
    color: var(--color-error,red);
  }
  .\$hasError .icon-error {
    cursor: not-allowed;
  }
  .remaining,
  .icon-retry {
    color: var(--color-warn,hsl(45, 90%, 45%));
  }
  .\$retrying.icon-retry {
    transition: transform 0.5s linear;
    transform: rotate(1turn);
  }

  .remaining {
    position: absolute;
    inset: auto;
  }
</style>