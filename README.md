# @taocode/audio-player

Playlist audio player as a web component: `<taocode-audio-player>`.

Built with Svelte, compiled to a custom element you can drop into any site (Hugo, WordPress, plain HTML, etc.).

## Install

```bash
npm install @taocode/audio-player
# or
pnpm add @taocode/audio-player
```

Register the element with a side-effect import:

```js
import '@taocode/audio-player';
```

Or load from a CDN:

```html
<script type="module" src="https://unpkg.com/@taocode/audio-player/dist/index.js"></script>
```

## Quick start

```html
<taocode-audio-player
  playlist='[{"src":"https://example.com/track.mp3","title":"My Track","duration":180}]'
></taocode-audio-player>
```

## Development

```bash
git clone https://github.com/taocode/wc-svelte-audio-player.git
cd wc-svelte-audio-player
pnpm install
pnpm dev      # builds the library, serves demo at http://localhost:5173/demo.html
pnpm build    # production build → dist/index.js
```

Note: `pnpm dev` uses `vite build --watch` + preview rather than Vite's dev server. Svelte custom elements with nested components cannot run through Vite HMR ([svelte#3594](https://github.com/sveltejs/svelte/issues/3594)); the demo loads the same bundled output as production.

## Migration from WebComponents.dev

If you used the old package:

```diff
- import "@wcd/taocode.svelte-audio-player";
+ import "@taocode/audio-player";
```

The custom element tag and attributes are unchanged.

## Features

- Custom colors via CSS variables on the element
- Dark mode via reactive `mode` attribute
- Custom fonts for heading and playlist
- Auto advance, loop playlist, repeat one track, or none
- Show/hide heading, transport controls, skip buttons, advance control, playlist
- Playlist at top or bottom; collapsed, expanded, or always visible

Built with Svelte and compiled with Vite (no WebComponents.dev required).

## Attributes

### `playlist`

Playlist attribute is required. It can be 1 of 4 options:

#### Playlist Option 1: Single URL

`playlist="url-to-audio.mp3"` - must be a full URL starting with https:// or http://

You can use a relative URL if you include only 1 track in an array, options 2, 3 and 4 don't have this restriction.

#### Playlist Option 2: Array of JSON Objects

```json
playlist='[
  {"src":"url-to-audio","title":"Track 1","duration":"60"},
  {"src":"url-to-audio2","title":"Track 2"},
  {"src":"url-to-audio3"}
]'
```

This option can be handiest from Hugo, use `jsonify objPlaylist` if you have matching keys `src` and optional `title` and `duration` on each entry in that slice (array) of objects.

#### Playlist Option 3: Array of URLs

The playlist attribute should be a JSON formatted array. 

Use single quotes for this attribute to be able to use double quotes inside.
Double quotes are required for JSON compatibility.

```json
playlist='[
  "https://.../file.mp3",
  "https://.../file2.mp3",
  "https://.../file3.mp3"
]'
```

#### Playlist Option 4: Array of Arrays

JSON formatted `[src,title?,duration?]` entries.

```json
playlist='[
  ["https://.../file.mp3","Title 1","60"],
  ["https://.../file2.mp3","Title 2"],
  ["https://.../file3.mp3"]
]'
```

You can also mix & match Playlist Options* like:

```json
playlist='[
  "https://.../file.mp3",
  ["https://.../file2.mp3","Title 2","60"],
  [{"src":"https://.../file3.mp3","title":"Title 3"}]
]'
```

*This option has dubious value beyond testing.

### Title of Tracks

1. Title value provided via Playlist Option 3
2. Filename - what comes after the last '/' in the src URL, with some standard clean-up: remove extension (.mp3,.mp4,.aac,...) and query string, #hash, convert `(_|%20|-)` -> ' '

### Duration of Tracks

Providing the duration of each track is highly recommended. It is only a placeholder value until the file is actually loaded.

If you do not supply the duration of the track the player will fetch the audio files on initialization and load the metadata. The duration of each track is updated with the actual value from the file upon successful load. Providing the initial duration can save `n` requests and 100s of kilobytes of bandwidth where `n` is the number of tracks.

### `advance`

Options on how to advance at the end of a track. `auto` | `loop` | `repeat` | `none`

- `auto` - advance to the end of the playlist and stop
- `loop` - advance to the end of the playlist and restart with first track
- `repeat` - repeat the current track
- `none` - do not automatically advance

default: `auto`

```html
<taocode-audio-player advance="loop"
  playlist='[
    "./path/to/track1",
    "./path/to/track2"
  ]'></taocode-audio-player>
```

### `mode`

Mode attribute is reactive, when you change it from your script's theme switcher hook, it will update the player. This is mostly necessary for the popover playlist as the background is otherwise transparent and may be unreadable without a light or dark opaque background.

2 options `light` | `dark`

default: `light`

In your theme switcher do something like:

```js
Array.from(document.querySelectorAll('taocode-audio-player')).forEach((el) => {
  el.mode = darkMode ? 'dark' : 'light'
})
```

### `showadvance`

Show or hide the advance control. Options: `show` | `hide`

default: `hide`

### `playlistlocation`

2 options: `top` | `bottom`

default: `bottom`

### `expandplaylist`

3 options: `false` | `true` | `always`

- `false` - start with playlist closed, user can expand the list
- `true` - start with playlist expanded, user can close it
- `always` - always show playlist, takes up space vertical space, it isn't an absolute positioned fly-out

default: `false`

### `skiptime`

The number of seconds to skip ahead (fastforward) and skip back (rewind).

default: 10

### `showskip`

Show the skip controls? Options: `show` | `hide`

default: `hide`

### `showskiptime`

Show or hide the amount of time next to the skip buttons. Options: `show` | `hide`

default: `hide`

## Show Attributes

The show attributes all accept any of these expressions that override their default:

### Show - Start Showing/Expanded

- `1`, `true`, `show`, `yes`, `please`

### Hide - Start Hidden 

- `0`, `false`, `hide`, `no`, `none`

*Note that invalid values will fallback on their default.

### `randomhue`

Provide a random hue, from 0-360 for HSL color.

default: `false`

## Theming via CSS Vars

Add the style attribute with your favorite HSL overrides.

defaults:

- `--ap-theme-h: 220;` 
- `--ap-theme-h-dark: var(--ap-theme-h);` 
- `--ap-theme-s: 75%;`
- `--ap-theme-s-dark: 65%;` 
- `--ap-theme-l: 25%;`
- `--ap-theme-l-dark: 45%;` 
- `--ap-playlist-max-h: 6em;`

The max-h option could be `none` which may be helpful if you wanted to show all tracks with no scroller. 6em will usually show 3 tracks unless they've word-wrapped into 2+ lines.

```html
<taocode-audio-player style="
  --ap-theme-h: 120;
  --ap-theme-s: 50%;
  --ap-theme-l: 33%;
  --ap-theme-l-dark: 50%;
  --ap-playlist-max-h: none;
  --ap-font-family-heading: fantasy, cursive;
  --ap-font-family-playlist: system-ui;
"></taocode-audio-player>
```

## Supersedes

This project replaces earlier experiments archived on GitHub:

- `svelte-multitrack-audio-player` (WCD starter template)
- `svelte-audio-player` (SvelteKit prototype)
- `plainjs-audio-player` (vanilla JS prototype)
- npm package `@wcd/taocode.svelte-audio-player` (WebComponents.dev publish)
