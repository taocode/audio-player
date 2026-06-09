<svelte:options tag="taocode-audio-player" />

<script>
	import { onMount, setContext } from 'svelte'
	import { writable, derived } from 'svelte/store'
  import { fly } from 'svelte/transition'

	// TODO: load ID3 ?

	import { contextStores as CS, advanceOptions, hideOptions, showOptions } from './lib.js'
  	
	import TrackHeading from './TrackHeading.svelte'
	import ProgressBarTime from './ProgressBarTime.svelte'
	import Controls from './Controls.svelte'
	import PlayList from './PlayList.svelte'
  import VolumeSlider from './VolumeSlider.svelte'
  import VolumeIcon from './svg/volume.svg.svelte'
  import RepeatIcon from './svg/repeat.svg.svelte'
  import PlayControl from './PlayControl.svelte'
	import XIcon from './svg/x.svg.svelte'

	export let playlist
	export let style = ''
	export let skiptime = 10
	export let showskiptime = 'hide'
	export let showskip = 'hide'
	export let advance = 'auto'
	export let playlistlocation = 'bottom'
	export let expandplaylist = 'false'
	export let showplaylist = 'show'
	export let showplaylistbutton = 'true'
	export let showadvance = 'hide'
	export let showcontrols = 'show'
	export let showheading = 'show'
	export let randomhue = 'false'
	export let mode = 'light'
	export let maxtries = 3
	export let preload = 'metadata'

	$: playlistAtTop = playlistlocation === 'top'
	$: preloadNone = preload === 'none'
	let mounted = false

	// lots of setup
	const tracks = writable([])
	const loadAllTrackData = async () => {
		$tracks.forEach( (t,i) => {
			try {
				if (!t.duration) {
					const mAudio = new Audio()
					mAudio.preload = preload
					mAudio.onloadedmetadata = () => {
						t.loading = false
						t.loaded = true
						t.duration = mAudio.duration
						updateTrackList()
					}
					mAudio.src = t.src
					mAudio.load()
				}
			} catch (error) {
				console.warn('loadAllTrackData',error)
			}
		})
	}
	let parsedTracks = []
	try {
		parsedTracks = JSON.parse(playlist)
	} catch (err) {
		console.warn(`Playlist isn't JSON, will try single URL: ${playlist}`,err.message)
	}
	if (!parsedTracks.length) {
		try {
			const checkURL = new URL(playlist) // throws error if malformed
			if (checkURL.host && /^https?:/.test(checkURL.protocol)) parsedTracks.push(playlist)
			else console.warn(`Playlist URL: "${playlist}" is malformed, it must be a full URL that starts with https:// or http:// and is otherwise properly shaped`)
		} catch (err) {
			console.warn(`Playlist: "${playlist}" is malformed, see docs`,err.message)
		}
	}
	tracks.set(
		parsedTracks.map(c => c.src ? c 
									: Array.isArray(c) 
										? ({ src: c[0], title: c.length > 1 ? c[1] : false, duration: (c.length > 2) ? parseFloat(c[2]) : false }) 
											: ({ src: c }))
	)
	setContext(CS.TRACKS,tracks)
	
	const currentIndex = writable(-2)
	setContext(CS.CURRENT_INDEX,currentIndex)

	const currentTime = writable(0)
	setContext(CS.CURRENT_TIME,currentTime)
	
	const currentTrack = derived([currentIndex, tracks], ([$i, $t]) => $i < $t.length && $i >= 0 ? $t[$i] : false)
	setContext(CS.CURRENT_TRACK,currentTrack)
	
	const trackDuration = writable(0.0000001)
	setContext(CS.TRACK_DURATION,trackDuration)
	
	const totalDuration = derived(tracks, ($t) => 
		$t.reduce((p,t,i) => p + (t.hasOwnProperty('duration') ? t.duration : 0),0))
	setContext(CS.TOTAL_DURATION,totalDuration)

	const progress = derived([currentTime,trackDuration], ([$t,$d]) => $t / ($d || 0.000001))
	progress.set = (val) => currentTime.set(val * $trackDuration) 
	setContext(CS.PROGRESS,progress)
	
	const buffered = writable([])
	setContext(CS.BUFFERED,buffered)

	const isReady = writable(false)
	setContext(CS.IS_READY,isReady)

	const paused = writable(true)
	setContext(CS.PAUSED,paused)

	const hasError = writable(false)
	setContext(CS.HAS_ERROR,hasError)

	const retry = writable(false)
	setContext(CS.RETRY,retry)

	const retryTimeout = 500
	let retryTimer
	const retrying = writable(false)
	setContext(CS.RETRYING,retrying)

	const maxTries = writable(parseInt(maxtries))
	setContext(CS.MAX_TRIES,maxTries)

	const playWhenReady = writable(false)
	setContext(CS.PLAY_WHEN_READY,playWhenReady)

	const skipTimeStore = writable(skiptime)
	setContext(CS.SKIP_TIME,skipTimeStore)

	const advanceStore = writable(advance)
	setContext(CS.ADVANCE,advanceStore)

	const showSkipTime = writable(showOptions.includes(showskiptime))
	setContext(CS.SHOW_SKIP_TIME,showSkipTime)

	const volume = writable(0.8)
	setContext(CS.VOLUME, volume)

	const reverseDirection = writable(false)
	setContext(CS.REVERSE_DIRECTION, reverseDirection)

	const dark = writable(mode === 'dark')
	setContext(CS.DARK, dark)
	$: dark.set(mode === 'dark')

	// when track data changes onload or onerror,
	// notify the store of the change
	const updateTrackList = () => {
		tracks.set($tracks)
	}

	// const audioTag = writable(new Audio())
	
	let audioPlayer
	
	const setAudioFrom = (track) => {
		// console.log('setAudioFrom',track,typeof track.loaded === undefined)
		if (! track ) return
		paused.set(true)
		currentTime.set(0)
		audioPlayer.src = track.src
		// console.log('setAudio',audioPlayer.src)
	}
	const loadTrack = (index, track) => {
		// console.info(`loadTrack()`,index,track)
		if (!audioPlayer) {
			console.warn('loadTrack() odd condition: ',{index,audioPlayer,$currentTrack})
			return
		}
		track.loading = true
		buffered.set([])
		isReady.set(false)
		audioPlayer.onloadedmetadata = () => {
			const t = $tracks[index]
			t.loaded = true
			t.loading = false
			t.duration = audioPlayer.duration
			t.error = false
			updateTrackList()
		}
		setAudioFrom(track)
		if ($playWhenReady) audioPlayer.load()
		else {
			track.loading = false
			isReady.set(true)
		}
	}
	const loadCurrentTrack = () => {
		loadTrack($currentIndex,$currentTrack)
	}
	// auto-load track on every $currentIndex change
	function autoLoad(index) {
		if (!mounted) return // indicates 1st load, ignore
		const track = $tracks[index]
		hasError.set(false)
		const lastIndex = $tracks.length-1
		if ( ! track || index < 0 || index > lastIndex ) {
			// illegal value, reset to 0 or last track, try again with first or last
			const newIndex = index < 0 ? lastIndex : 0
			console.log(`invalid autoLoad(${index}), reseting to ${newIndex}`,index,'/',$tracks.length,track)
			currentIndex.set(newIndex)
			autoLoad(newIndex)
			return
		}
		if ( ! track.loading) {
			loadCurrentTrack()
		} else {
			console.log('Not loading')
		}
	}
	
	onMount(() => {
		audioPlayer.preload = preload

		if (! preloadNone) loadAllTrackData()

		audioPlayer.addEventListener('canplay', () => {
			// console.log('canplay',{$currentIndex,$playWhenReady})
			isReady.set(true)
			hasError.set(false)
			reverseDirection.set(false)
		})
		audioPlayer.addEventListener('canplaythrough', () => {
			// console.log('canplaythrough',{$currentIndex,$playWhenReady})
			if ($playWhenReady) {
				paused.set(false)
			}
		})
		const autoAdvance = () => {
			if ($advanceStore === 'repeat') {
				playWhenReady.set(true)
				currentTime.set(0)
			} else if ($advanceStore === 'loop' 
				|| ($advanceStore === 'auto' && $currentIndex < $tracks.length-1)
				|| $reverseDirection) { // = previous track desired via button so ignore advance rules
				playWhenReady.set(true)
				currentIndex.update(n => n+($reverseDirection ? -1 : 1))
			}
		}
		audioPlayer.addEventListener('ended', () => { 
			// console.log('ended track ',$currentIndex,$tracks.length)
			currentTime.set($trackDuration)
			autoAdvance()
		})
		audioPlayer.addEventListener('error', (e) => {
			const t = $currentTrack
			t.error = true
			t.loading = false
			buffered.set([])
			t.tryCount = (t.hasOwnProperty('tryCount') ? t.tryCount : 0) + 1
			t.duration = -1
			hasError.set(true)
			updateTrackList()
			// audioPlayer.pause()
			paused.set(true)
			currentTime.set( 0 )
			console.error(`Audio error track: ${$currentIndex} - ${$currentTrack.src}`,$currentTrack,{e})
			if ($currentIndex > 0) autoAdvance()
		})
		currentIndex.set(0)
		mounted = true
	})

	$: autoLoad($currentIndex)
	$: if ($retry) {
		retry.set(false)
		retrying.set(true)
		retryTimer = setTimeout(()=>{
			retrying.set(false)
		},retryTimeout)
		autoLoad($currentIndex)
	}

	let showVolume = false
	let showAdvance = true

	$: showAdvance = showOptions.includes(showadvance)
	
	const advanceNext = () => {
    advanceStore.set(advanceOptions[nextAdvanceOptionIndex])
  }

  let advanceOptionIndex = advanceOptions.indexOf($advanceStore)
  let nextAdvanceOptionIndex = 0 
  $: {
    advanceOptionIndex = advanceOptions.indexOf($advanceStore)
    nextAdvanceOptionIndex = (advanceOptionIndex+1 >= advanceOptions.length) ? 0
    : advanceOptionIndex + 1
  }

	$: adjustVolumeTitle = (showVolume ? 'Close' : 'Open') + ' Volume Adjustment'
	const showPlay = hideOptions.includes( showcontrols )
	const rHue = 360*Math.random()
	const randomHueStyle = showOptions.includes(randomhue)
		? `--ap-theme-h: ${rHue};` : ';'
	$: dSufx = ($dark ? '-dark' : '')
	$: ldH = `--theme-h: var(--ap-theme-h${dSufx},var(--ap-theme-h,220));`
	$: ldS = `--theme-s: var(--ap-theme-s${dSufx},var(--ap-theme-s,${$dark?'65%':'75%'}));`
	$: ldL = `--theme-l: var(--ap-theme-l${dSufx},var(--ap-theme-l,${$dark?'50%':'25%'}));`
	$: backgroundBWa = $dark ? '#000e' : '#FFFe'
	$: playerStyle = `
	--background-bwa: ${backgroundBWa};
	--color-warn: hsl(32, 100%, 45%);
	--background-warn: hsla(32, 100%, 65%, 0.2);
	--color-error: hsl(0,75%,50%);
	--background-error: hsla(0, 100%, 65%, 0.2);
	${randomHueStyle}
	${ldH}
	${ldS}
	${ldL}
	--audio-player-color: hsl( var(--theme-h), var(--theme-s), var(--theme-l) );
	--audio-player-background-semi: hsla( var(--theme-h), var(--theme-s), var(--theme-l), 0.12 );
	${style}
`
</script>

<div style={playerStyle}>
{#if $tracks < 1}
<div class="error-no-playlist">
	<h2>No Playlist!</h2>
	<p>You must provide a valid playlist attribute.</p>
	<pre>
		&lt;taocode-audio-player playlist='["url-to-audio","second-url"]'&gt;&lt;/taocode-audio-player&gt;
		&lt;taocode-audio-player playlist='[["url-to-audio","title 1"],["second-url","title 2"]]'&gt;&lt;/taocode-audio-player&gt;
	</pre>
</div>
{:else}
<main class="audio-player" class:playlistAtTop>
	<audio bind:this={audioPlayer} bind:currentTime={$currentTime} bind:duration={$trackDuration} bind:paused={$paused}
		bind:volume={$volume} bind:buffered={$buffered}></audio>
	<section id="player-cont" class="container">
		{#if ! hideOptions.includes(showheading)}
		<TrackHeading />
		{/if}
		<div class="vol-prog-rep" class:showPlay>
			{#if showPlay}
			<PlayControl />
			{/if}
			<button title={adjustVolumeTitle} on:click={()=>showVolume = !showVolume}>
				<span class="icon">
					<VolumeIcon volume={$volume} />
				</span>
			</button>
			{#if showVolume }
			<div transition:fly={{ y: 20, duration: 300}} class="show-volume">
				<button class="close-volume" on:click={()=>showVolume = false} title={adjustVolumeTitle}>
					<span class="icon icon-x"><XIcon /></span>
				</button>
				<VolumeSlider />
			</div>
			{/if}
			<ProgressBarTime />
			{#if showAdvance}
			<button title={`Advance is: ${advanceOptions[advanceOptionIndex]}.\nChange Advance to: ${advanceOptions[nextAdvanceOptionIndex]}?`} on:click={advanceNext}>
				<span class="icon">
					<RepeatIcon variant={$advanceStore} />
				</span>
			</button>
			{/if}

		</div>

		{#if ! hideOptions.includes( showcontrols )}
		<Controls {showskip} />
		{/if}
	</section>
	{#if ! hideOptions.includes(showplaylist)}
	<section class="container">
		<PlayList expand={expandplaylist} showbutton={showplaylistbutton} atTop={playlistAtTop} />
	</section>
	{/if}
</main>
{/if}
</div>

<style>
	.error-no-playlist {
		background-color: pink;
		padding: 0.5em;
		text-align: center;
		color: #800E;
	}

	.error-no-playlist h2 {
		margin-top: 0.1em;
	}

	* {
		box-sizing: border-box;
	}

main {
	display: flex;
	margin: 0 auto;
	min-width: 135px;
	flex-direction: column;
	align-items: center;
}
.container {
	background: var(--ap-background, transparent);
	color: var(--audio-player-color);
	width: 100%;
}

.vol-prog-rep {
	display: flex;
	position: relative;
	align-items: center;
	height: 2.5em;
	gap: 0.5em;
}

.vol-prog-rep.showPlay {
	margin-bottom: 0.5em;
}

.vol-prog-rep button {
	border: none;
	background: var(--audio-player-background, transparent);
	padding: 0;
	display: flex;
	align-items: center;
	cursor: pointer;
	border-radius: 100%;
	transition: all 75ms ease-out;
	height: 1.5em;
	width: 1.75em;
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
.close-volume:hover,
.close-volume:focus {
	box-shadow: 0 0 0px 2px var(--audio-player-background-semi);
}
.close-volume:focus-visible {
	outline-offset: 1px;
	box-shadow: 0 0 0 2px var(--audio-player-background-semi);	
}
	
	.vol-prog-rep .icon {
		height: 100%;
		width: 100%;
	}

	.playlistAtTop>:last-child {
		order: -1;
	}

	.show-volume {
		display: flex;
		align-items: center;
		position: absolute;
		gap: 1em;
		z-index: 10;
		width: 100%;
		top: -1em;
		left: 0em;
		right: -1.5em;
		background: var(--background-bwa);
		opacity: 0.7;
		padding: 0 0.25ch;
		box-shadow: 0 0 5px #0002;
		transition: opacity 0.2s ease-out;
	}
	.show-volume:hover,
	.show-volume:focus-within {
		opacity: 0.9;
	}

	.icon {
		color: var(--audio-player-color, #222);
	}

</style>