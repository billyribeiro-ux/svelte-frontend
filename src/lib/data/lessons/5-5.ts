import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-5',
		title: 'Browser APIs & Reactive Window State',
		phase: 2,
		module: 5,
		lessonIndex: 5
	},
	description: `The browser gives you dozens of APIs beyond the DOM — you can detect window size, online/offline status, scroll position, preferred color scheme, and much more.

Svelte makes it easy to turn these browser signals into reactive state. You can use $effect to subscribe to events like resize and scroll, or use Svelte's built-in reactive window utilities from svelte/reactivity/window.

In this lesson you'll build a dashboard that tracks live window dimensions, online status, and scroll position — all updating reactively as the user interacts with the page.`,
	objectives: [
		'Read window dimensions and respond to resize events reactively',
		'Detect online/offline status with navigator.onLine and events',
		'Track scroll position and use it to show/hide UI elements',
		'Understand IntersectionObserver and matchMedia for advanced detection'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let windowWidth = $state(0);
  let windowHeight = $state(0);
  let isOnline = $state(true);
  let scrollY = $state(0);
  let prefersReducedMotion = $state(false);
  let prefersDark = $state(false);
  let observedVisible = $state(false);
  let observedElement = $state(null);

  // Track window dimensions
  $effect(() => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    function handleResize() {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // Track online status
  $effect(() => {
    isOnline = navigator.onLine;

    function goOnline() { isOnline = true; }
    function goOffline() { isOnline = false; }

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  });

  // Track scroll position
  $effect(() => {
    function handleScroll() {
      scrollY = window.scrollY;
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // matchMedia for preferences
  $effect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

    prefersReducedMotion = motionQuery.matches;
    prefersDark = darkQuery.matches;

    function onMotionChange(e) { prefersReducedMotion = e.matches; }
    function onDarkChange(e) { prefersDark = e.matches; }

    motionQuery.addEventListener('change', onMotionChange);
    darkQuery.addEventListener('change', onDarkChange);

    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      darkQuery.removeEventListener('change', onDarkChange);
    };
  });

  // IntersectionObserver
  $effect(() => {
    if (!observedElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        observedVisible = entry.isIntersecting;
      },
      { threshold: 0.5 }
    );

    observer.observe(observedElement);
    return () => observer.disconnect();
  });

  let scrollPercent = $derived(
    Math.round((scrollY / (document.body.scrollHeight - window.innerHeight || 1)) * 100)
  );
</script>

<h1>Browser APIs & Reactive Window State</h1>

<div class="dashboard">
  <div class="card">
    <h3>Window Size</h3>
    <p class="big">{windowWidth} x {windowHeight}</p>
    <p class="detail">
      {windowWidth < 640 ? 'Mobile' : windowWidth < 1024 ? 'Tablet' : 'Desktop'}
    </p>
  </div>

  <div class="card" class:offline={!isOnline}>
    <h3>Network</h3>
    <p class="big">{isOnline ? 'Online' : 'Offline'}</p>
    <p class="detail">
      {isOnline ? 'Connected to the internet' : 'No connection detected'}
    </p>
  </div>

  <div class="card">
    <h3>Scroll Position</h3>
    <p class="big">{scrollY}px</p>
    <div class="progress-bar">
      <div class="progress" style="width: {scrollPercent}%"></div>
    </div>
    <p class="detail">{scrollPercent}% scrolled</p>
  </div>

  <div class="card">
    <h3>Media Queries</h3>
    <p>Dark mode: <strong>{prefersDark ? 'Yes' : 'No'}</strong></p>
    <p>Reduced motion: <strong>{prefersReducedMotion ? 'Yes' : 'No'}</strong></p>
  </div>
</div>

<div class="scroll-content">
  <p>Scroll down to see the IntersectionObserver in action...</p>
  <div class="spacer"></div>

  <div
    class="observed-box"
    class:visible={observedVisible}
    bind:this={observedElement}
  >
    {observedVisible ? 'I am visible! (IntersectionObserver detected me)' : 'Scroll to find me...'}
  </div>

  <div class="spacer"></div>
</div>

<style>
  h1 { color: #333; text-align: center; }
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .card {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  .card h3 { margin: 0 0 0.5rem; color: #555; font-size: 0.85rem; text-transform: uppercase; }
  .big { font-size: 1.5rem; font-weight: bold; margin: 0.25rem 0; color: #333; }
  .detail { font-size: 0.8rem; color: #888; margin: 0.25rem 0 0; }
  .offline { background: #fff3f3; border-color: #ffcdd2; }
  .progress-bar {
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    margin: 0.5rem 0;
    overflow: hidden;
  }
  .progress {
    height: 100%;
    background: #4f46e5;
    transition: width 0.1s;
    border-radius: 3px;
  }
  .scroll-content { padding: 2rem 0; }
  .spacer { height: 400px; }
  .observed-box {
    padding: 2rem;
    text-align: center;
    font-size: 1.2rem;
    border: 3px dashed #ccc;
    border-radius: 8px;
    background: #f9f9f9;
    transition: all 0.3s;
  }
  .observed-box.visible {
    border-color: #4f46e5;
    background: #eef2ff;
    color: #4f46e5;
    font-weight: bold;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
