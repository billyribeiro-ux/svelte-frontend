import { registerTrack } from './registry';
import { svelteCoreTrack } from './track-svelte-core/_track';

let initialized = false;

export function initLessons() {
	if (initialized) return;
	registerTrack(svelteCoreTrack);
	initialized = true;
}
