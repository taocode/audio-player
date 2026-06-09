<svelte:options tag={null} />
<script>
  import { getContext } from "svelte"
  import { contextStores as CS} from "./lib"
  export let step = 0.01
  const volume = getContext(CS.VOLUME)
</script>

<div class="slidecontainer">
  <label for="volume-slider">0</label>

  <input id="volume-slider"
				 class="slider"
				 type="range"
				 min="0"
				 max="1"
				 {step}
				 name="volume"
				 bind:value={$volume}
				 >

  <label class="current-volume" for="volume-slider">{parseInt($volume*100)}</label>
</div>

<style>
  .slidecontainer {
    width: 100%;
    /* Width of the outside container */
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slidecontainer label {
    width: 1.5ch;
    text-align: center
  }
  .slidecontainer .current-volume {
    width: 4ch;
    text-align: center
  }

  /* The slider itself */
  .slider {
    -webkit-appearance: none;
    /* Override default CSS styles */
    appearance: none;
    width: 100%;
    /* Full-width */
    height: 3px;
    /* Specified height */
    margin: 0 10px;
    padding: 0;
    background: var(--audio-player-volume-background,
    linear-gradient(90deg, hsl(120, 86%, 30%) 10%, hsl(90, 95%, 40%) 60%, hsl(30, 95%, 75%) 70%, hsl(30, 95%, 70%) 80%, hsl(0, 95%, 50%) 95%));
    outline: none;
    opacity: 0.7;
    /* Set transparency (for mouse-over effects on hover) */
    -webkit-transition: .2s;
    /* 0.2 seconds transition on hover */
    transition: opacity .2s;
  }

  /* Mouse-over effects */
  .slider:hover,
  .slider:focus-within {
    opacity: 1;
    /* Fully shown on mouse-over */
  }
  .slider:focus-visible {
    outline: var(--audio-player-color, -webkit-focus-ring-color) auto 1px;
    outline-offset: 3px;
  }

  /* The thumb slider handle */
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    /* Override default look */
    appearance: none;
    width: 15px;
    /* Set a specific slider handle width */
    height: 15px;
    /* Slider handle height */
    border-radius: 50%;
    background: var(--audio-player-volume-thumb-background,#777);
    /* Green background */
    cursor: pointer;
    /* Cursor on hover */
    transition: background .2s;
  }

  .slider::-moz-range-thumb {
    width: 15px;
    /* Set a specific slider handle width */
    height: 15px;
    /* Slider handle height */
    background: var(--audio-player-volume-thumb-background,#777);
    /* Green background */
    cursor: pointer;
    /* Cursor on hover */
  }
</style>