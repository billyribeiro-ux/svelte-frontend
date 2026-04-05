import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-5',
		title: 'Browser APIs & Reactive Window State',
		phase: 2,
		module: 5,
		lessonIndex: 5
	},
	description: `The browser gives you dozens of APIs beyond the DOM — you can detect window size, online/offline status, scroll position, preferred color scheme, user geolocation, element visibility, and much more.

Svelte makes it easy to turn these browser signals into reactive state: use <code>$effect</code> to subscribe to events, store the value in <code>$state</code>, and the rest of your component reacts automatically. Always remember to return a cleanup function from the effect so you don't leak event listeners or observers.

In this lesson you'll build a live dashboard that tracks window dimensions, online status, scroll position, media queries, element visibility (IntersectionObserver), element size changes (ResizeObserver), and more.`,
	objectives: [
		'Read window dimensions and respond to resize events reactively',
		'Detect online/offline status with navigator.onLine and events',
		'Track scroll position and use it to show/hide UI elements',
		'Use matchMedia to react to dark mode / reduced motion preferences',
		'Use IntersectionObserver to detect when elements enter the viewport',
		'Use ResizeObserver to detect when a specific element changes size'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Window dimensions ===
  let windowWidth = $state(0);
  let windowHeight = $state(0);

  // === Network status ===
  let isOnline = $state(true);

  // === Scroll ===
  let scrollY = $state(0);
  let maxScroll = $state(1);

  // === Media queries ===
  let prefersReducedMotion = $state(false);
  let prefersDark = $state(false);
  let isMobile = $state(false);

  // === IntersectionObserver target ===
  let observedVisible = $state(false);
  let observedElement = $state(null);
  let intersectionRatio = $state(0);

  // === ResizeObserver target ===
  let resizableEl = $state(null);
  let resizableSize = $state({ width: 0, height: 0 });
  let resizableText = $state('Resize me in the bottom-right corner!');

  // === Mouse position ===
  let mouseX = $state(0);
  let mouseY = $state(0);

  // === Battery / Page visibility ===
  let pageVisible = $state(true);

  // --- Window size + initial read ---
  $effect(() => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    function onResize() {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  // --- Network ---
  $effect(() => {
    isOnline = navigator.onLine;
    const on = () => (isOnline = true);
    const off = () => (isOnline = false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  });

  // --- Scroll ---
  $effect(() => {
    function onScroll() {
      scrollY = window.scrollY;
      maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  // --- matchMedia ---
  $effect(() => {
    const motionQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const darkQ = window.matchMedia('(prefers-color-scheme: dark)');
    const mobileQ = window.matchMedia('(max-width: 640px)');

    prefersReducedMotion = motionQ.matches;
    prefersDark = darkQ.matches;
    isMobile = mobileQ.matches;

    const onMotion = (e) => (prefersReducedMotion = e.matches);
    const onDark = (e) => (prefersDark = e.matches);
    const onMobile = (e) => (isMobile = e.matches);

    motionQ.addEventListener('change', onMotion);
    darkQ.addEventListener('change', onDark);
    mobileQ.addEventListener('change', onMobile);

    return () => {
      motionQ.removeEventListener('change', onMotion);
      darkQ.removeEventListener('change', onDark);
      mobileQ.removeEventListener('change', onMobile);
    };
  });

  // --- IntersectionObserver ---
  $effect(() => {
    if (!observedElement) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        observedVisible = entry.isIntersecting;
        intersectionRatio = entry.intersectionRatio;
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(observedElement);
    return () => observer.disconnect();
  });

  // --- ResizeObserver ---
  $effect(() => {
    if (!resizableEl) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        resizableSize = {
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height)
        };
      }
    });
    observer.observe(resizableEl);
    return () => observer.disconnect();
  });

  // --- Mouse ---
  $effect(() => {
    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  });

  // --- Page visibility ---
  $effect(() => {
    pageVisible = !document.hidden;
    function onVisibility() {
      pageVisible = !document.hidden;
    }
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  });

  // === Derived values ===
  let device = $derived(
    windowWidth < 640 ? 'Mobile' : windowWidth < 1024 ? 'Tablet' : 'Desktop'
  );
  let scrollPercent = $derived(Math.round((scrollY / maxScroll) * 100));
</script>

<h1>Browser APIs &amp; Reactive Window State</h1>

<p class="lead">
  The browser is full of signals — size, network, scroll, input, visibility. Each one becomes
  reactive state with a small <code>$effect</code> that subscribes and returns a cleanup function.
</p>

<div class="dashboard">
  <div class="card">
    <h3>Window Size</h3>
    <p class="big">{windowWidth} &times; {windowHeight}</p>
    <p class="detail">{device}{isMobile ? ' (mobile MQ)' : ''}</p>
  </div>

  <div class="card" class:offline={!isOnline}>
    <h3>Network</h3>
    <p class="big">{isOnline ? 'Online' : 'Offline'}</p>
    <p class="detail">{isOnline ? 'Connected' : 'No connection'}</p>
  </div>

  <div class="card">
    <h3>Scroll</h3>
    <p class="big">{scrollY}px</p>
    <div class="progress-bar"><div class="progress" style="width: {scrollPercent}%"></div></div>
    <p class="detail">{scrollPercent}% down</p>
  </div>

  <div class="card">
    <h3>Media Queries</h3>
    <p>Dark: <strong>{prefersDark ? 'yes' : 'no'}</strong></p>
    <p>Reduced motion: <strong>{prefersReducedMotion ? 'yes' : 'no'}</strong></p>
  </div>

  <div class="card">
    <h3>Mouse</h3>
    <p class="big">{mouseX}, {mouseY}</p>
    <p class="detail">Move your mouse</p>
  </div>

  <div class="card" class:hidden-card={!pageVisible}>
    <h3>Page</h3>
    <p class="big">{pageVisible ? 'Visible' : 'Hidden'}</p>
    <p class="detail">Switch tabs to toggle</p>
  </div>
</div>

<section>
  <h2>ResizeObserver</h2>
  <p class="note">
    Drag the corner to resize this textarea. A <code>ResizeObserver</code> reports the new
    content box size whenever it changes.
  </p>
  <textarea
    bind:this={resizableEl}
    bind:value={resizableText}
    class="resizable"
  ></textarea>
  <p class="live">
    Observed size: <strong>{resizableSize.width} &times; {resizableSize.height}</strong>
  </p>
</section>

<section>
  <h2>IntersectionObserver</h2>
  <p class="note">Scroll down until the box comes into view — intersection ratio updates live.</p>
  <div class="intersection-hint">Live intersection ratio: <strong>{intersectionRatio.toFixed(2)}</strong></div>
</section>

<div class="scroll-content">
  <div class="spacer"></div>

  <div
    class="observed-box"
    class:visible={observedVisible}
    bind:this={observedElement}
  >
    {#if observedVisible}
      <span>I am visible! ({Math.round(intersectionRatio * 100)}% in view)</span>
    {:else}
      <span>Scroll to find me...</span>
    {/if}
  </div>

  <div class="spacer"></div>
</div>

<div class="tips">
  <h3>Pitfalls to avoid</h3>
  <ul>
    <li>
      <strong>Always clean up.</strong> Every <code>addEventListener</code> needs a matching
      <code>removeEventListener</code> in the cleanup function.
    </li>
    <li>
      <strong>SSR safety.</strong> Code that touches <code>window</code> must run only in the
      browser. <code>$effect</code> only runs client-side, so it's a safe home for these.
    </li>
    <li>
      <strong>Passive listeners.</strong> For high-frequency events like scroll/touch, pass
      <code>{'{ passive: true }'}</code> to let the browser optimise.
    </li>
    <li>
      <strong>Throttle when needed.</strong> mousemove and scroll fire rapidly — for expensive
      work, wrap in <code>requestAnimationFrame</code>.
    </li>
  </ul>
</div>

<style>
  h1 { color: #333; text-align: center; }
  .lead { color: #555; max-width: 720px; }
  .dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  .card h3 {
    margin: 0 0 0.5rem;
    color: #555;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .big { font-size: 1.4rem; font-weight: bold; margin: 0.25rem 0; color: #333; }
  .detail { font-size: 0.75rem; color: #888; margin: 0.25rem 0 0; }
  .offline { background: #fff3f3; border-color: #ffcdd2; }
  .hidden-card { opacity: 0.5; }
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
  }
  .card p { margin: 0.2rem 0; font-size: 0.85rem; }

  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }
  .note { font-size: 0.85rem; color: #666; }

  .resizable {
    display: block;
    width: 280px;
    height: 120px;
    padding: 0.75rem;
    border: 2px dashed #4f46e5;
    border-radius: 8px;
    resize: both;
    overflow: auto;
    font-family: inherit;
    font-size: 0.9rem;
  }
  .live {
    margin-top: 0.5rem;
    background: #eef2ff;
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    display: inline-block;
    font-size: 0.9rem;
  }

  .intersection-hint {
    background: #fff8e1;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .scroll-content { padding: 2rem 0; }
  .spacer { height: 400px; }
  .observed-box {
    padding: 2.5rem;
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

  .tips {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1.5rem 0;
  }
  .tips h3 { margin: 0 0 0.5rem; }
  .tips ul { padding-left: 1.2rem; margin: 0; }
  .tips li { margin: 0.3rem 0; font-size: 0.9rem; }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
