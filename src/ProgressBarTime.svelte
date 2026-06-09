<svelte:options tag={null} />
<script>
  import { getContext } from 'svelte';
  import { formatTime, contextStores as CS } from './lib'
  import { fade } from 'svelte/transition'

  const progress = getContext(CS.PROGRESS)
  const currentTime = getContext(CS.CURRENT_TIME)
  const trackDuration = getContext(CS.TRACK_DURATION)
  const currentTrack = getContext(CS.CURRENT_TRACK)
  const buffered  = getContext(CS.BUFFERED)
  const hasError = getContext(CS.HAS_ERROR)
  const maxTries = getContext(CS.MAX_TRIES)
  
	let totalTimeDisplay = 'Loading...'
	let currTimeDisplay = "0:00:00"
  let canretry = true
  $: canretry =  $currentTrack.tryCount < $maxTries
	
  $: duration = $trackDuration > 0.001 ? $trackDuration 
          : $currentTrack.hasOwnProperty('duration') ? $currentTrack.duration : -1
  $: totalTimeDisplay = $hasError ? 'Error' : 
                          isNaN($trackDuration) 
                                   ? 'Loading...' : formatTime(duration)
  $: currTimeDisplay = isNaN($currentTime) ? `0:00` : formatTime($currentTime)
</script>

<div class="container" class:$hasError class:canretry>
  <span id="progress-time" class="time-display">{currTimeDisplay}</span>
  <div class="progress-outer">
    <span id="bar-progress" style="width: {$progress*100}%"></span>
    <input class="progrange" type="range" min={0} max={1} step={0.001} bind:value={$progress} />
    {#each $buffered as {start,end}}
    <span class="bar-buffered"
    data-start={start} data-end={end} data-delta={end-start}
    data-perc={100*(end-start)/$trackDuration} data-loc={100*start/$trackDuration}
      style="width: {100 * ((end-start)/$trackDuration)}%; left: {100*(start/$trackDuration)}%;"></span>
    {/each}
  </div>
  {#if duration > 0}
  <span transition:fade id="track-duration" class="time-display">{totalTimeDisplay}</span>
  {/if}
</div>


<style>
  .container {
    width: 100%;
    position: relative;
    height: 1.66em;
  }
  .progress-outer, #bar-progress, .bar-buffered {
    height: 0.2em;
    position: absolute;
    top: auto;
    bottom: auto;
    left: 0;
    right: 0;
  }
  .progress-outer {
    width: 100%;
    box-shadow: 0 0 1px 1px var(--audio-player-background-semi, #2222);
    z-index: 1;
    bottom: 0.75em;
  }
  
  #bar-progress {
    width: 0;
    display: block;
    background: var(--audio-player-color, rgba(0, 0, 0, 0.1));
    background-attachment: absolute;
  }
  .bar-buffered {
    width: 0;
    height: 0.2em;
    background: var(--audio-player-background-semi);
    background-attachment: fixed;
  }
  .time-display {
    position: absolute;
    bottom: auto;
    top: 1.5em;
    opacity: 0.75;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    cursor: default;
    z-index: 12;
    transition: opacity 0.2s ease-out;
  }
  .\$hasError .time-display {
    color: var(--color-error,#ea0000);
  }
  .\$hasError.canretry .time-display {
    color: var(--color-warn,#ea8000);
  }
  .container:focus-within .time-display,
  .container:hover .time-display {
    opacity: 1;
  }
  #progress-time {
    left: 0;
  }
  #track-duration {
    right: 0;
  }
.progrange {
  --track-color: transparent;
  --thumb-color: var(--audio-player-color,#607d8b);

  --track-color-light: #46d;
  --track-color-dark: #dfe9fb;
  --thumb-radius: 100%;
  --thumb-height: 1em;
  --thumb-width: 1em;
  --thumb-shadow-size: 0;
  --thumb-shadow-blur: 0;
  --thumb-shadow-color: transparent;
  --thumb-border-width: 0;
  --thumb-border-color: #eceff1;
  
  --track-width: 100%;
  --track-height: 1em;
  --track-shadow-size: 0;
  --track-shadow-blur: 0;
  --track-shadow-border: 0;
  --track-shadow-color: transparent;
  --track-shadow-focus-color: #cfd8dc;
  --track-border-width: 0;
  --track-border-color: transparent;

  --track-radius: 0;
  --contrast: 5%;

  --ie-bottom-track-color: var(--track-color-dark);

  -webkit-appearance: none;
  background: none;
  /* margin: calc(var(--thumb-height) / 2) 0; */
  margin: 0;
  position: absolute;
  z-index: 11;
  width: 100%;
  top: -0.1em;
  bottom: auto;
  right: 0;
  left: 0;
  border-radius: 5px;
}
.progrange:hover,
.progrange:focus {
	background: var(--audio-player-background-semi);
	box-shadow: 0 0 0px 5px var(--audio-player-background-semi);
}
.progrange:focus-visible {
  outline: var(--audio-player-color, -webkit-focus-ring-color) auto 1px;
  outline-offset: 5px;
}
.progrange:focus::-webkit-slider-runnable-track {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-focus-color);
}
.progrange:focus::-ms-track {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-focus-color);
}
.progrange:focus::-moz-range-track {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-focus-color);
}
.progrange:focus::-ms-fill-lower {
  background: var(--track-color);
}
.progrange:focus::-ms-fill-upper {
  background: var(--track-color-light);
}


.progrange::-webkit-slider-runnable-track {
  cursor: default;
  height: var(--track-height);
  transition: all .2s ease;
  width: var(--track-width);
  border-radius: 100%;
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-color);
  height: calc(var(--track-height) / 2);
  background: var(--track-color);
  border: var(--track-border-width) solid var(--track-border-color);
  border-radius: var(--track-radius);
}

.progrange::-webkit-slider-thumb {
  box-shadow: var(--thumb-shadow-size) var(--thumb-shadow-blur) var(--track-shadow-border) var(--thumb-shadow-color);
  background: var(--thumb-color);
  border: var(--thumb-border-width) solid var(--thumb-border-color);
  border-radius: var(--thumb-radius);
  box-sizing: border-box;
  cursor: default;
  height: var(--thumb-height);
  width: var(--thumb-width);
  -webkit-appearance: none;
  margin-top: calc( (-1*var(--track-border-width) * 2) + var(--track-height) - var(--thumb-height));
  /* margin-top: (math.div((-$track-border-width * 2 + $track-height), 2) - math.div($thumb-height, 2)); */
  margin-top: calc( var(--track-height) / 5 + var(--thumb-height) / -2 );
}

.progrange::-moz-range-track {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-color);
  cursor: default;
  height: var(--track-height);
  transition: all .2s ease;
  width: var(--track-width);
  border-radius: 100%;
  background: var(--track-color);
  border: var(--track-border-width) solid var(--track-border-color);
  border-radius: var(--track-radius);
  height: calc(var(--track-height) / 2);
}

.progrange::-moz-range-thumb {
  -moz-appearance: none;
  box-shadow: var(--thumb-shadow-size) var(--thumb-shadow-blur) var(--track-shadow-border) var(--thumb-shadow-color);
  background: var(--thumb-color);
  border: var(--thumb-border-width) solid var(--thumb-border-color);
  border-radius: var(--thumb-radius);
  box-sizing: border-box;
  cursor: default;
  height: var(--thumb-height);
  width: var(--thumb-width);
  transform: translateY(-0.5em);
}

.progrange::-ms-track {
  cursor: default;
  height: var(--track-height);
  transition: all .2s ease;
  width: var(--track-width);
  border-radius: 100%;
}

.progrange::-ms-fill-lower {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-color);
  background: var(--ie-bottom-track-color);
  border: var(--track-border-width) solid var(--track-border-color);
  border-radius: (var(--track-radius) * 2);
}

.progrange::-ms-fill-upper {
  box-shadow: var(--track-shadow-size) var(--track-shadow-blur) var(--track-shadow-border) var(--track-shadow-color);
  background: var(--track-color);
  border: var(--track-border-width) solid var(--track-border-color);
  border-radius: (var(--track-radius) * 2);
}

.progrange::-ms-thumb {
  box-shadow: var(--thumb-shadow-size) var(--thumb-shadow-blur) var(--track-shadow-border) var(--thumb-shadow-color);
  background: var(--thumb-color,yellow);
  border: var(--thumb-border-width) solid var(--thumb-border-color);
  border-radius: var(--thumb-radius);
  box-sizing: border-box;
  cursor: default;
  height: var(--thumb-height);
  width: var(--thumb-width);
  margin-top: calc(var(--track-height) / 4);
}

.progrange:disabled::-webkit-slider-thumb,
.progrange:disabled::-moz-range-thumb,
.progrange:disabled::-ms-thumb,
.progrange:disabled::-webkit-slider-runnable-track,
.progrange:disabled::-ms-fill-lower,
.progrange:disabled::-ms-fill-upper {
  cursor: not-allowed;
}

</style>