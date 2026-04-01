import { registerTrack } from './registry';
import { svelteCoreTrack } from './track-svelte-core/_track';
import { foundationsTrack } from './track-foundations/_track';
import { svelteKitTrack } from './track-sveltekit/_track';

let initialized = false;

export function initLessons() {
	if (initialized) return;
	registerTrack(foundationsTrack);
	registerTrack(svelteCoreTrack);
	registerTrack(svelteKitTrack);
	initialized = true;
}
