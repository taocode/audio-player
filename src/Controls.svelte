<svelte:options tag={null} />
<script>
  import { getContext } from 'svelte'

  import { contextStores as CS, showOptions } from './lib' 
  const paused = getContext(CS.PAUSED)
  const currentIndex = getContext(CS.CURRENT_INDEX)
  const currentTime = getContext(CS.CURRENT_TIME)
  const trackDuration = getContext(CS.TRACK_DURATION)
  const hasError = getContext(CS.HAS_ERROR)
  const skipTime = getContext(CS.SKIP_TIME)
  const showSkipTime = getContext(CS.SHOW_SKIP_TIME)
  const tracks = getContext(CS.TRACKS)
  const playWhenReady = getContext(CS.PLAY_WHEN_READY)
  const reverseDirection = getContext(CS.REVERSE_DIRECTION)
  const dark = getContext(CS.DARK)

  import SkipForwardIcon from './svg/skip-forward.svg.svelte'
  import SkipBackIcon from './svg/skip-back.svg.svelte'
	import RotateCWIcon from './svg/rotate-cw.svg.svelte'

  import PlayControl from './PlayControl.svelte'

  const rewindAudio = () => {
    currentTime.set( $currentTime - parseInt($skipTime) )
  }
  const forwardAudio = () => {
    currentTime.set( $currentTime + parseInt($skipTime) )
  }
  const previousAudio = () => {
    if (prevTrack) {
      playWhenReady.set(true)
      reverseDirection.set(true)
      currentIndex.update(n => n - 1)
    } else {
      currentTime.set(0)
      paused.set(false)
    }
  }
  const nextAudio = () => {
    // console.log('nextAudio',{$currentIndex,$currentTrack})
    playWhenReady.set(true)
    currentIndex.update(n => n + 1)
  }

  export let showskip = 'false'

  $: prevTrack = $tracks.length > 1 && $currentTime < 5
  // $: console.log({prevTrack},$currentTime)
  $: includeSkip = showOptions.includes(showskip) && !$hasError && $skipTime > 0 && $skipTime < $trackDuration
  $: includeNext = $tracks.length > 1

  $: style = ($dark)
    ? '--shadow-text: #000a;' 
    : '--shadow-text: #FFFa;'
</script>

<div id="btn-cont" class:$hasError {style}>

  <button id="prev" title="Previous Track" class:prevTrack on:click={previousAudio}>
    <span class="icon">
      <SkipBackIcon />
    </span>
	</button>

  {#if includeSkip}
  <button id="rewind" title="Skip back {$skipTime}s" on:click={rewindAudio}>
		<span class="icon invert-h">
      <RotateCWIcon />
    </span>
    {#if $showSkipTime}<span class="skip-time">{$skipTime}</span>{/if}
	</button>
  {/if}

  <div class="play-control">
    <PlayControl />
  </div>

  {#if includeSkip}
  <button id="forward" title="Skip forward {$skipTime}s" on:click={forwardAudio}>
    <span class="icon">
      <RotateCWIcon />
    </span>
    {#if $showSkipTime}<span class="skip-time">{$skipTime}</span>{/if}
	</button>
  {/if}

  {#if includeNext}
  <button id="next" title="Next Track" on:click={nextAudio}>
    <span class="icon">
      <SkipForwardIcon />
    </span>
	</button>
  {:else}
  <div class="button-placeholder"></div>
  {/if}

</div>

<style>
  #prev {
    --fill: currentColor;
  }
  #prev.prevTrack {
    --fill: none;
  }

  #btn-cont {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 10;
    margin: 0.5em auto;
  }
  .icon {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
  }
  button {
    border-radius: 100%;
    transition: all 75ms ease-out;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: baseline;
    /* width: 1ch; */
    border: none;
    padding: 0;
    cursor: pointer;
    margin: 0;
    height: 1.5rem;
    background-color: transparent;
  }
  button:hover,
  button:focus {
    background: var(--audio-player-background-semi);
    box-shadow: 0 0 0px 5px var(--audio-player-background-semi);
  }
  button:focus-visible {
    outline: var(--audio-player-color, -webkit-focus-ring-color) auto 1px;
    outline-offset: 5px;
  }
  .\$hasError {
    color: var(--color-error,red);
  }
  .button-placeholder {
    width: 2ch;
  }
  .play-control {
    margin-top: -0.25rem;
  }
  @keyframes pulse {
    50% {
      opacity:0.4;
    }
  }
  @keyframes beacon {
    50% {
      box-shadow: 0 0 0 1em rgba(0, 0, 0, 0.33);
    }
  }

  button:active {
    /* font-size: 2.2rem; */
    background-color: transparent;
  }
  .invert-h {
    display: inline-block;
    scale: -1 1;
  }
  .skip-time {
    color: var(--audio-player-color);
    position: absolute;
    font-size: 0.5rem;
    bottom: 0.4rem;
    z-index: 1;
    letter-spacing: -0.05em;
    text-shadow: 0 0 1px var(--shadow-text), 0 0 2px var(--shadow-text), 0 0 3px var(--shadow-text), 0 0 2px var(--shadow-text), 0 0 2px var(--shadow-text);
    transform: scaleX(0.8);
    pointer-events: none;
  }
  .skip-time::after {
    content: 's';
  }

</style>