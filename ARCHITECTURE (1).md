**SVELTE PE7 MASTERY**

**COURSE ARCHITECTURE v5 — FINAL**

JavaScript + TypeScript + Svelte 5 + SvelteKit + SEO

Taught Through Building — DiCenso Method

Course 1 (Frontend): 21 Modules · 155 Lessons · 7 Phases

Course 2 (Full Stack): 28 Modules · 190 Lessons · 10 Phases

v5: All v4 fixes + getAbortSignal, Spring/Tween classes, prefersReducedMotion, flushSync, blur/scale/draw transitions, SvelteURLSearchParams, mount/unmount/hydrate, $app/paths (resolve/asset/match replacing deprecated base/assets), $app/environment version. Every Svelte 5 + SvelteKit March 2026 API verified.

Billy Ribeiro · March 2026

**Course Philosophy**

-   **DiCenso Method:** Every concept introduced at the moment the student needs it. No isolation.

-   **Vehicle:** SvelteKit from Lesson 0.2. $state(0) before a standalone variable.

-   **TypeScript:** Enters Module 8 when untyped props create friction. Permanent from that point.

-   **Two Courses:** Course 1 (Frontend) is standalone. Course 2 adds server modules. No repeated content.

-   **PE7 Tiers:** MUST MASTER 75%, KNOW WELL 20%, CUTTING EDGE 5%.

-   **Prerequisites:** HTML and CSS. Zero JavaScript. Zero TypeScript. Zero frameworks.

**What Changed from v3**

**Structural fixes:**

-   Git + Prettier moved to Module 0 (Lesson 0.8). Student version-controls and auto-formats from the first project.

-   How the Web Works moved to Module 5 (Phase 2). Student understands client/server/HTTP/DOM BEFORE forms and routing.

-   Forms module now comes AFTER web fundamentals and TypeScript — the student knows what POST means before they use it.

**Svelte depth fixes:**

-   Reactivity Boundaries lesson: what breaks reactivity, pass-by-value, destructuring kills the link, getter pattern for modules.

-   untrack() from svelte taught alongside $effect — core for controlling dependencies.

-   Universal vs Server Load: dedicated comparison lesson with serialization boundary, rerunning rules, decision framework.

-   Data Invalidation Patterns: depends(), invalidate() with custom IDs, invalidateAll(), cross-route invalidation.

-   Async Svelte split into 2 lessons: ($effect.pending + settled) and (fork + concurrent rendering).

-   use: directive taught alongside {@attach} — students WILL encounter it in every existing tutorial/library.

-   Hydration model: what it is, SSR + hydration, mismatch warnings, boundary pending/failed for SSR.

-   $app/server: getRequestEvent() and read() for file access.

-   contenteditable bindings (bind:innerHTML, bind:textContent) and <details> bind:open added to forms module.

-   Error recovery: reset function in failed snippets, retry patterns, graceful degradation.

-   svelte/motion: spring() and tweened() for physics-based and eased value animation.

-   crossfade from svelte/transition: shared element transitions between containers.

-   svelte/reactivity/window: reactive innerWidth, scrollY, online imports that auto-update without $effect.

**v5 API completeness fixes:**

-   getAbortSignal() from svelte: replaces manual AbortController pattern. Auto-aborts when $derived/$effect re-runs.

-   Spring/Tween CLASSES: new Spring(value), new Tween(value) with .target/.current/.set()/Spring.of()/Tween.of(). Replaces deprecated spring()/tweened() store functions.

-   prefersReducedMotion from svelte/motion: built-in MediaQuery for prefers-reduced-motion.

-   flushSync from svelte: forces synchronous state application for DOM measurement after state changes.

-   blur, scale, draw transitions from svelte/transition: complete set alongside fade/fly/slide/crossfade.

-   SvelteURLSearchParams from svelte/reactivity: reactive query params independent of SvelteURL.

-   mount/unmount/hydrate imperative API from svelte: programmatic component creation, unmount with { outro: true } for exit transitions.

-   $app/paths: resolve() and asset() replace deprecated base/assets. match() (since 2.52) for programmatic route matching. $app/environment: version added.

**Production fixes:**

-   Intl APIs expanded: Intl.NumberFormat, Intl.RelativeTimeFormat, Intl.Collator alongside Date.

-   svelte-package for building component libraries added to production module.

-   Load function rerunning rules: when they re-run, what triggers it, dependency tracking, search params tracking.

**COURSE 1: FRONTEND**

**21 Modules · 150 Lessons · 7 Phases · 6 Projects · 6 Checkpoints · 1 Capstone**

+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 1: First Steps (Modules 0--4) · 32 lessons**                                                                                                                                                                                                                           |
|                                                                                                                                                                                                                                                                                  |
| Dev setup, Git, Prettier from day 1. Variables, types, null/undefined, type coercion. Objects, arrays, destructuring, spread, Object utilities. Components, props, {#if}, {#each}. Array methods, strings, regex, Math, Date, Intl. Events, bubbling, keyboard, scope, closures. |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 2: Foundations (Modules 5--8) · 25 lessons**                                                                                                                                                                                |
|                                                                                                                                                                                                                                       |
| How the Web Works (HTTP, DOM, URLs, storage, browser APIs) BEFORE forms. $derived, $effect, reactivity boundaries, untrack(), timers/debounce, $inspect, event loop. Error handling, JSON, structuredClone. TypeScript: 7 lessons. |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 3: Components & Forms (Modules 9--11) · 22 lessons**                                                                                                                                                    |
|                                                                                                                                                                                                                   |
| Forms (bind, validation, function bindings, this, contenteditable). Snippets, context, modules, {#key}/{@const}/{@debug}, packages, compound components. SvelteKit routing, layouts, link options, images, icons. |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 4: Data & Async (Modules 12--13) · 14 lessons**                                                                                                                                      |
|                                                                                                                                                                                                |
| Promises, event loop, async/await, fetch, Promise.all/allSettled, AbortController. Load functions (universal + server + decision framework). Streaming. Form actions, use:enhance, validation. |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 5: Advanced (Modules 14--17) · 32 lessons**                                                                                                                                                                                                                                                                                                                                                                 |
|                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Every remaining rune. {@attach} + use: awareness. <svelte:boundary> + error recovery. Async Svelte (2 lessons). Transitions (fade/fly/slide/scale/blur/draw/crossfade), Spring/Tween classes, animate:flip. Imperative API (mount/unmount/hydrate). Classes, generics, Symbol, WeakMap, dynamic import. Hooks, advanced routing, security, data invalidation, transport. Legacy awareness (stores, onMount, slots). |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------------------------+
| **Phase 6: SEO (Module 18) · 8 lessons**                                                                                        |
|                                                                                                                                 |
| Google March 2026 Core Update, E-E-A-T, Information Gain, CWV, structured data, sitemaps, prerender strategy, content strategy. |
+---------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 7: Production (Modules 19--20) · 17 lessons**                                                                                                      |
|                                                                                                                                                              |
| CSS PE7, ESLint/svelte-check, Vitest, Playwright, debugging, performance, accessibility, file organization, svelte-package, deployment. Capstone: 7 lessons. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------+

**PHASE 1: FIRST STEPS**

Modules 0--4 · 32 lessons

**Module 0 — First Contact (8 lessons)**

**0.1 Set Up Your Machine**

**JS:** What is a terminal? Mac Terminal vs Windows PowerShell vs Linux. cd, ls/dir, mkdir. Installing Node.js (LTS). Installing pnpm globally. Installing VS Code. Svelte extension. OS-specific path separators and gotchas.

**Svelte:** Why these tools: Node runs JS outside the browser. pnpm manages packages. VS Code + Svelte extension = autocomplete + error detection.

**0.2 Your First SvelteKit Project**

**JS:** pnpm create svelte@latest. Tour of project structure (every file explained). pnpm dev. What is HMR: page updates when you save. Opening browser DevTools console.

**Svelte:** $state(0) — first reactive variable. {count} in markup. The .svelte file: <script> + markup + <style>. pnpm dev and the browser.

**0.3 Seeing Your Data & Leaving Notes**

**JS:** console.log() — see values in the browser console. Comments: // single line, /\* multi-line \*/, <!\-- HTML comment \-->. Reading error messages: what the red text means. Commenting out code to test ideas.

**Svelte:** console.log(count) shows the current value. {JSON.stringify(obj)} in markup to see object contents. Error messages tell you what file and line number.

**0.4 Functions & Making Things Happen**

**JS:** Function declarations. Arrow functions. Parameters and return values. Calling functions. Why () => count++ works. Assignment operators: +=, -=, \*=, ++, \--.

**Svelte:** onclick={handler}. Inline: onclick={() => count++}. Multiple handlers on a page.

**0.5 Text, Numbers & Booleans**

**JS:** Primitives: string, number, boolean. typeof. Template literals: \`Hello ${name}\`. Type coercion: 5 + 3 = 53, 5 \* 3 = 15. Number(), String(), Boolean(). Why type coercion causes bugs.

**Svelte:** $state(hello), $state(42), $state(true). Displaying each in markup. Template literals in Svelte: same as JS.

**0.6 The Void: null, undefined & Falsy**

**JS:** null vs undefined: when each occurs. Falsy: 0, , false, null, undefined, NaN. Truthiness. Cannot read property of undefined — the #1 beginner error. Optional chaining (?.), nullish coalescing (??).

**Svelte:** $state() with no argument = undefined. {#if user} only renders when defined. {user?.name ?? Anonymous}.

**0.7 let vs const**

**JS:** let: can be reassigned. const: cannot (but objects/arrays CAN be mutated). When to use each.

**Svelte:** $state (reactive, will change) vs const (config, labels, fixed values).

**0.8 Git & Prettier: Save Your Work**

**JS:** What is version control? Why: undo mistakes, track changes, deploy. git init, git add ., git commit -m message. .gitignore: node_modules, .svelte-kit, .env. Prettier: what auto-formatting is. Setting up format-on-save in VS Code. .prettierrc config.

**Svelte:** From this moment: every milestone gets a git commit. Every save auto-formats. This is professional workflow from day 1.

**Module 1 — Working with Data (6 lessons)**

**1.1 Objects: Grouping Related Data**

**JS:** Object literals { key: value }. Dot notation, bracket notation. Nested objects. Property shorthand.

**Svelte:** Reactive objects: $state({ name: Billy, age: 30 }). {user.name} in markup.

**1.2 Arrays: Lists of Things**

**JS:** Array literals. Indexing (arr[0]). .length, .push(), .pop(). Arrays of objects.

**Svelte:** Reactive arrays: $state([]). Deep reactivity: todos[0].done = true triggers updates.

**1.3 Destructuring**

**JS:** Object destructuring, array destructuring, defaults, renaming.

**Svelte:** $props() returns an object you destructure: let { title, count } = $props().

**1.4 Spread & Copying**

**JS:** Spread arrays [\...arr]. Spread objects {\...obj}. Shallow copy: only one level deep. Why this matters for nested state.

**Svelte:** <button {\...rest}>. Component rest props.

**1.5 Operators & Comparisons**

**JS:** Arithmetic: +, -, \*, /, %. Comparison: ===, !==, <, >. Logical: &&, \|\|, !. Ternary. Why === not ==.

**Svelte:** Conditional markup: {isActive ? on : off}. Logical AND: {isAdmin && Badge}.

**1.6 Object Utilities**

**JS:** Object.keys(), Object.values(), Object.entries(). The in operator. Iterating objects with entries().forEach() or {#each Object.entries()}.

**Svelte:** Rendering object properties dynamically: {#each Object.entries(settings) as [key, value]}.

**Module 2 — Components & Props (5 lessons)**

**2.1 Your First Component**

**JS:** import keyword. What modules are. File organization.

**Svelte:** Creating .svelte files. import Card from ./Card.svelte. <Card />.

**2.2 Passing Data: $props()**

**JS:** Function parameters = component props.

**Svelte:** $props() with destructuring. Default values. Rest props.

**2.3 Conditional Rendering: {#if}**

**JS:** if/else through {#if}. Truthiness revisited.

**Svelte:** When to use inline ternary vs {#if} block.

**2.4 List Rendering: {#each}**

**JS:** Iteration. Index variable. Why keys matter.

**Svelte:** Keyed: {#each items as item (item.id)}. {:else} for empty. {#each {length: 5}, i}.

**2.5 Component Patterns**

**JS:** Objects in arrays, destructuring in loops.

**Svelte:** Reusable Card. Passing different data. Composing pages.

**Module 3 — Transforming Data (7 lessons)**

**3.1 Control Flow: if/else, switch**

**JS:** if/else in <script>. Early returns. Guard clauses. switch/case/break/default.

**Svelte:** Script logic driving render. switch for state machines.

**3.2 Loops & Recursion**

**JS:** for, for\...of, while, break/continue. When loops > array methods. Recursion: base case + recursive case. Tree traversal.

**Svelte:** Building data in <script> with loops. Recursive components for nested trees (menus, comments, file systems).

**3.3 Array Methods: map, filter, find**

**JS:** map, filter, find, some, every, findIndex. Chaining.

**Svelte:** items.filter(i => i.active) in {#each}. Search: filter as user types.

**3.4 Sorting, Reducing & Mutating**

**JS:** sort with comparators. reduce for aggregation. slice (non-mutating) vs splice (mutating). flat, includes, concat, Array.from, Array.isArray.

**Svelte:** Sortable lists. Cart totals via reduce. Removing items.

**3.5 String Methods**

**JS:** split, join, trim, includes, startsWith, endsWith, slice, replace, replaceAll, toLowerCase, toUpperCase, padStart, repeat. Tagged templates.

**Svelte:** Text processing: formatting, truncation, search.

**3.6 Regular Expressions**

**JS:** RegExp: /pattern/flags. test, match, replace with regex. \\d, \\w, \\s, quantifiers, groups. Common patterns.

**Svelte:** Form validation. Input formatting. Search highlighting.

**3.7 Math, Numbers, Dates & Intl**

**JS:** Math.floor/ceil/round/random/min/max/abs. parseInt, parseFloat, NaN, isNaN. new Date(), toLocaleDateString, toISOString, date math. Intl.NumberFormat (currency, percentages). Intl.DateTimeFormat (locale dates). Intl.RelativeTimeFormat (3 hours ago). Intl.Collator (locale-aware sorting).

**Svelte:** Formatted prices, dates, relative time. Age calculation. Locale-aware number/date display.

**Module 4 — Events & Interactivity (5 lessons)**

**4.1 Events Deep Dive**

**JS:** Event object. event.target vs event.currentTarget. Mouse, form, focus events.

**Svelte:** onclick, oninput, onsubmit, onfocus, onblur. Svelte event delegation. on() from svelte/events.

**4.2 Bubbling & stopPropagation**

**JS:** Bubbling: child → parent. Capturing. stopPropagation, preventDefault. composedPath.

**Svelte:** Why stopPropagation behaves differently with delegation. When to preventDefault.

**4.3 Keyboard Events & Accessibility**

**JS:** keydown, keyup. event.key values. Focus management. tabindex. Tab order.

**Svelte:** Escape to close, Enter to submit, Arrow keys to navigate.

**4.4 Callbacks & Communication**

**JS:** Callbacks as props. Higher-order functions. Passing behavior up.

**Svelte:** onclick: (item: Item) => void. Child notifies parent via callback.

**4.5 Scope & Closures**

**JS:** Block scope, function scope. Closures: functions remember their creation environment. Why loop variables are captured correctly. This is WHY event handlers work.

**Svelte:** Every onclick={() => count++} is a closure. $effect teardowns are closures. Snippet scope is closure scope.

+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 1 Project: Interactive Product Catalog**                                                                                                                                                                                |
|                                                                                                                                                                                                                                 |
| Search with regex, filter by category, sort by price/name, keyboard navigation, cart total via reduce, formatted prices with Intl.NumberFormat, recursive category tree, relative time display. Git: commit at every milestone. |
+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+------------------------------------------------------------------------------------------------------------------------------------------------+
| **Checkpoint: Before Phase 2**                                                                                                                 |
|                                                                                                                                                |
| What is null vs undefined? What is type coercion? Destructure this object. Write a for\...of loop. What is a closure? What does git commit do? |
+------------------------------------------------------------------------------------------------------------------------------------------------+

**PHASE 2: FOUNDATIONS**

Modules 5--8 · 25 lessons

**Module 5 — How the Web Works (5 lessons)**

*MOVED HERE from Phase 3. The student needs client/server/HTTP/DOM before forms POST data and before SvelteKit routing.*

**5.1 Client, Server & HTTP**

**JS:** What is a server (computer responding to requests)? Client = browser. HTTP request/response. Methods: GET, POST, PUT, DELETE. Status codes: 200, 301, 404, 500. Headers. What SSR means.

**Svelte:** Why SvelteKit has +page.js (client) and +page.server.js (server). What happens when you visit a SvelteKit page (SSR → hydration → CSR).

**5.2 The DOM & Hydration**

**JS:** DOM tree: browser parses HTML into objects. querySelector. Why Svelte manages the DOM for you. Hydration: the server renders HTML, then the browser makes it interactive. What happens when server/client HTML mismatch.

**Svelte:** bind:this gives the real DOM node. {@attach} receives the element. When you need DOM directly: canvas, third-party libs, measurements.

**5.3 URLs, Query Strings & URL API**

**JS:** URL anatomy: protocol://host:port/path?search#hash. URLSearchParams. Constructing URLs. encodeURIComponent.

**Svelte:** page.url in SvelteKit. Reading search params. Building dynamic links.

**5.4 Browser Storage**

**JS:** localStorage (persists), sessionStorage (tab only). setItem/getItem/removeItem. Must JSON.stringify. 5MB limit. Cross-tab sync via storage events.

**Svelte:** Persisting preferences. typeof window === undefined guard for SSR. The browser check: import { browser } from $app/environment.

**5.5 Browser APIs & Reactive Window State**

**JS:** Clipboard API. IntersectionObserver. matchMedia. ResizeObserver. requestAnimationFrame. Reactive window values without $effect: import { innerWidth, scrollY, online } from svelte/reactivity/window — these auto-update and can be used directly in markup or $derived. Two approaches: bind:innerWidth on <svelte:window> OR import from svelte/reactivity/window. The import is newer and works anywhere (not just in markup).

**Svelte:** All browser APIs go inside $effect (server doesn't have them). The browser guard: import { browser } from $app/environment. Reactive window imports work in $derived and markup without $effect.

**Module 6 — Derived State & Effects (9 lessons)**

**6.1 $derived: Computed Values**

**JS:** Expressions depending on other values. Pure computation.

**Svelte:** $derived(count \* 2). $derived.by(() => { }). Dependency tracking. Push-pull reactivity.

**6.2 Derived Chains & Destructuring**

**JS:** Chains. Intermediate results.

**Svelte:** Derived from props. let { a, b } = $derived(compute()). Each property independently reactive.

**6.3 Overriding Derived (Optimistic UI)**

**JS:** Reassignment. Temporary values. Rollback.

**Svelte:** $derived overrides (since 5.25). Try/catch for server failure rollback.

**6.4 $effect: Side Effects**

**JS:** Pure vs side effects. DOM, network, timers, logging.

**Svelte:** $effect(() => { }). Dependency tracking. Teardown: return () => cleanup.

**6.5 When NOT to Use $effect**

**JS:** Escape hatch mentality. $derived over $effect for state sync.

**Svelte:** Anti-patterns: setting $state inside $effect. Best practices.

**6.6 Reactivity Boundaries: What Breaks**

**JS:** Pass-by-value: $state values are current values when read, not live references. Destructuring reactive objects breaks the reactive link. Why: let { name } = user captures the current value, not a binding. The getter pattern for cross-module reactivity: export const state = { get count() { return count; } }.

**Svelte:** This is the #1 source of intermediate Svelte bugs. Understanding this prevents hours of debugging.

**6.7 untrack() & Dependency Control**

**JS:** untrack(): read state without creating a dependency. Why: sometimes you need to read a value inside $effect without re-triggering on its change.

**Svelte:** import { untrack } from svelte. untrack(() => value) inside $effect. SvelteKit load functions have their own untrack parameter.

**6.8 Timers, Cleanup & Debounce**

**JS:** setTimeout, setInterval. Why cleanup prevents memory leaks. Debounce: delay until user stops acting. Throttle: limit execution rate.

**Svelte:** $effect with setInterval + teardown. Debounced search: wait 300ms after last keystroke.

**6.9 $inspect, flushSync, Event Loop & Timing**

**JS:** Why console.log shows Proxy. Event loop: call stack, task queue, microtask queue. setTimeout(fn, 0) defers. $effect runs in microtasks after DOM updates. flushSync(): forces all pending state changes to apply synchronously — needed when you must read DOM measurements immediately after a state change (e.g., measuring element height after adding an item to a list). Also critical in testing.

**Svelte:** $inspect(value). $inspect.trace(). tick() for waiting until DOM updates. flushSync(() => { count++ }) — DOM is updated before the next line runs. Why synchronous code runs before effects. When to use tick() vs flushSync(): tick waits for next microtask, flushSync forces it NOW.

**Module 7 — Error Handling & JSON (4 lessons)**

**7.1 try/catch/finally**

**JS:** try/catch/finally. throw new Error(). When to throw vs return null.

**Svelte:** Wrapping fetch, JSON.parse, DOM access.

**7.2 Error Types & Stack Traces**

**JS:** TypeError, ReferenceError, SyntaxError, RangeError. Stack trace anatomy. Debug workflow: read → find file → find line → understand.

**Svelte:** Common Svelte runtime errors. DevTools Sources panel.

**7.3 Custom Errors & Patterns**

**JS:** class AppError extends Error. Result pattern: { ok, data } \| { ok: false, error }.

**Svelte:** Structured error handling in components. User-friendly messages.

**7.4 JSON & Deep Copying**

**JS:** JSON.parse/stringify. JSON vs JS objects. structuredClone() for deep copy. Shallow (spread) vs deep (structuredClone).

**Svelte:** $state.snapshot() for plain objects from proxies. structuredClone for external APIs.

**Module 8 — TypeScript: The Switch (7 lessons)**

**Every file is lang=ts from this point forward.**

**8.1 Why Types & lang=ts**

**JS:** Type annotations. Basic types: string, number, boolean, string[], number[].

**Svelte:** <script lang=ts>. Annotating $state. Editor catches mistakes.

**TS:** Basic annotations.

**8.2 Interfaces for Props**

**JS:** interface. Required vs optional (?). extends.

**Svelte:** interface Props { }. Typed $props(). Typed snippets: Snippet<[T]>.

**TS:** interface, ?, extends.

**8.3 Union Types, Literals & as const**

**JS:** Union: string \| number. Literal: sm \| md. as const. Narrowing.

**Svelte:** Typed variants. Typed handlers.

**TS:** Union, literal, as const, narrowing.

**8.4 Type Guards & Discriminated Unions**

**JS:** typeof, in, instanceof guards. Discriminated: { status: success; data } \| { status: error; message }. Exhaustive never.

**Svelte:** Type-safe API response handling. Conditional rendering per type.

**TS:** Discriminated unions, exhaustive.

**8.5 Generic Functions & unknown**

**JS:** function first<T>(arr: T[]): T \| undefined. unknown vs any. Typing catch: (err: unknown).

**Svelte:** Type-safe utility functions. Safe error handling.

**TS:** Generics, unknown, as.

**8.6 Utility Types & Aliases**

**JS:** type alias. Partial, Required, Pick, Omit, Record. keyof. Indexed access.

**Svelte:** Complex props. Omit for rest props.

**TS:** Partial, Pick, Omit, Record, keyof.

**8.7 satisfies, ReturnType & app.d.ts**

**JS:** satisfies: validate without widening. ReturnType, Parameters. .d.ts files. App namespace.

**Svelte:** actions satisfies Actions. App.Locals, App.Error, App.PageState.

**TS:** satisfies, ReturnType, declaration files.

+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 2 Project: Real-Time Dashboard**                                                                                                                                                  |
|                                                                                                                                                                                           |
| Form inputs filter/sort data, $derived statistics, debounced search, validation with regex, custom error classes, localStorage persistence. All TypeScript. Git branch for feature work. |
+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Checkpoint: Before Phase 3**                                                                                                                        |
|                                                                                                                                                       |
| What is $derived vs $effect? What breaks reactivity? What is untrack? Write a discriminated union. What is HTTP? What is the DOM? What is debounce? |
+-------------------------------------------------------------------------------------------------------------------------------------------------------+

**PHASE 3: COMPONENTS & FORMS**

Modules 9--11 · 22 lessons

**Module 9 — Forms & Binding (7 lessons)**

**9.1 Two-Way Binding: bind:value**

**JS:** HTML inputs. The value property. One-way vs two-way.

**Svelte:** bind:value on text, email, number, textarea. State syncs both directions.

**9.2 Checkboxes, Radios, Selects & Details**

**JS:** Radio groups. Multi-select. Native accordions.

**Svelte:** bind:checked. bind:group. bind:value on <select>/<select multiple>. bind:open on <details>.

**9.3 Function Bindings (Since 5.9)**

**JS:** Getter/setter. Validation on set. Transformation.

**Svelte:** bind:value={() => val, (v) => val = v.trim().toLowerCase()}. bind:clientWidth={null, callback}.

**9.4 Reactive Forms: Validation**

**JS:** Form validation logic. Error states.

**Svelte:** $state for form data, $derived for validation, {#if} for errors.

**TS:** interface FormData { email: string; password: string; }.

**9.5 Files, Dimensions & DOM References**

**JS:** FileList, DataTransfer. Element measurement.

**Svelte:** bind:files. bind:clientWidth/clientHeight. bind:this (use inside $effect or event handler).

**9.6 Contenteditable & Special Bindings**

**JS:** contenteditable attribute. innerHTML vs textContent vs innerText.

**Svelte:** bind:innerHTML on contenteditable. bind:textContent. Audio/video bindings: bind:currentTime, bind:paused.

**9.7 The this Keyword**

**JS:** Execution context. Why this changes. Regular function: caller. Arrow: surrounding scope. Method: the object.

**Svelte:** Why onclick={todo.reset} breaks. Fix: () => todo.reset() or arrow method. bind:this for DOM.

**Module 10 — Component Composition (7 lessons)**

**10.1 Snippets: Reusable Markup**

**JS:** Closures revisited: snippets capture scope.

**Svelte:** snippets, {@render}, scope rules, recursive snippets.

**10.2 Passing Snippets to Components**

**JS:** Higher-order: passing content, not just data.

**Svelte:** Explicit/implicit snippet props. Implicit children. Optional: {@render children?.()}.

**TS:** Snippet<[T]> typing.

**10.3 Context: Sharing Without Props**

**JS:** Why prop drilling fails at depth 3+.

**Svelte:** setContext, getContext. createContext (5.49): type-safe.

**TS:** createContext<T>().

**10.4 Modules & Shared State**

**JS:** Named/default exports. $lib. .svelte.ts reactive modules.

**Svelte:** Exporting objects (not reassigned state). Getter pattern. Context vs module state. SSR safety.

**TS:** Module declarations.

**10.5 {#key}, {@const} & {@debug}**

**JS:** Force remount. Inline computed. Template debugging.

**Svelte:** Key blocks, const in each, debug pausing.

**10.6 Packages & Dependencies**

**JS:** package.json. dependencies/devDependencies. pnpm add. Semver. Lock files.

**Svelte:** Installing Iconify. import { Icon } from @iconify/svelte. Using icons.

**10.7 Compound Components**

**JS:** Composition over configuration. Related components sharing context.

**Svelte:** Tabs + TabPanel. Accordion with snippets + context.

**Module 11 — SvelteKit Routing (8 lessons)**

**11.1 File-Based Routing**

**JS:** File → URL mapping.

**Svelte:** src/routes. +page.svelte, +layout.svelte, +page.js, +page.server.js, +server.js, +error.svelte. $types.

**11.2 Layouts: Shared UI**

**JS:** Parent-child.

**Svelte:** children snippet. Nested layouts. +layout.js.

**11.3 Dynamic Routes & Params**

**JS:** URL parameters.

**Svelte:** [slug], [\...rest], [[optional]]. params object.

**11.4 Navigation & $app/state**

**JS:** Anchors. Programmatic nav.

**Svelte:** page, navigating, updated from $app/state. goto(). Active links.

**11.5 <svelte:head> & Metadata**

**JS:** Browser tab, SEO, social sharing.

**Svelte:** Dynamic titles/meta/OG per page from load data.

**11.6 Error Pages & <svelte:boundary>**

**JS:** Graceful degradation. Error recovery.

**Svelte:** page.status/error. <svelte:boundary> with failed(error, reset) snippet. The reset function: retry rendering. Nesting boundaries for granular error isolation.

**11.7 Link Options & Preloading**

**JS:** Preloading. Scroll behavior. Replace state.

**Svelte:** data-sveltekit-preload-data=hover. noscroll. replacestate. reload.

**11.8 Config, Assets, Images & Icons**

**JS:** svelte.config.js: adapter, preprocess, alias. static/ folder (favicon, robots.txt). Image optimization. Icons.

**Svelte:** $app/paths: resolve() (since 2.26, replaces deprecated base) — resolves pathnames with base path and populates route params: resolve(/blog/[slug], { slug: hello }). asset() (since 2.26, replaces deprecated assets) — resolves static asset URLs: asset(/logo.png). match() (since 2.52) — programmatic route matching: await match(/blog/hello) returns { id: /blog/[slug], params: { slug: hello } }. base/assets still work but are deprecated. $app/environment: browser, dev, building, version (version from config.kit.version.name, used with updated.check()). @sveltejs/enhanced-img. Iconify + Phosphor/Carbon.

+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 3 Project: Multi-Page App**                                                                                                                                               |
|                                                                                                                                                                                   |
| Recipe book / knowledge base: shared layout, dynamic routes, search, localStorage, context theme, compound Tabs, icons, form validation, contenteditable notes, error boundaries. |
+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------------------------------------------------+
| **Checkpoint: Before Phase 4**                                                                                              |
|                                                                                                                             |
| How does routing work? What is context? What does {#key} do? How do you install a package? What is this? What is bind:open? |
+-----------------------------------------------------------------------------------------------------------------------------+

**PHASE 4: DATA & ASYNC**

Modules 12--13 · 14 lessons

**Module 12 — Async JavaScript & Data Loading (9 lessons)**

**12.1 Promises & Event Loop**

**JS:** Promise states. .then/.catch/.finally. Event loop. setTimeout(fn,0). Microtask vs macrotask.

**Svelte:** Load functions return promises. $effect runs in microtasks. Timing awareness.

**12.2 async/await**

**JS:** async returns Promise. await pauses. Sequential vs parallel.

**Svelte:** Load functions are async. Event handlers can be async.

**12.3 fetch API**

**JS:** fetch(url, opts). Response: .ok, .status, .json(). Methods, headers, body.

**Svelte:** SvelteKit enhanced fetch: cookies during SSR, relative URLs, response inlining for hydration.

**12.4 Parallel Async & Partial Failures**

**JS:** Promise.all, .allSettled, .race, .any.

**Svelte:** Loading 3 APIs in parallel. Handling partial failures.

**12.5 AbortController, Cancellation & getAbortSignal**

**JS:** AbortController + signal on fetch. Cancel stale requests. Manual pattern: create controller in $effect, pass signal to fetch, abort in teardown. Then the modern Svelte way: getAbortSignal() from svelte — one function call that returns an AbortSignal which auto-aborts when the current $derived or $effect re-runs or is destroyed. Replaces the entire manual pattern.

**Svelte:** Manual: const ctrl = new AbortController(); fetch(url, { signal: ctrl.signal }); return () => ctrl.abort(). Modern: const data = $derived(await getData(id, { signal: getAbortSignal() })). One line replaces the entire AbortController + teardown pattern. Must be called inside a $derived or $effect.

**12.6 Universal Load (+page.js)**

**JS:** Export function. Return = data prop.

**Svelte:** load({ params, fetch, url, depends, untrack }). data prop. $types. PageLoad, PageProps.

**12.7 Server Load (+page.server.js)**

**JS:** Server-only: databases, env vars, cookies.

**Svelte:** PageServerLoad. event.cookies. $env/static/private.

**12.8 Universal vs Server: The Decision**

**JS:** When to use which. Serialization boundary (devalue): server must return serializable data; universal can return anything (component constructors, classes). Rerunning rules: what triggers a re-run (params change, parent reran, search params). depends() for custom dependencies. untrack in load.

**Svelte:** The decision framework: need cookies/db/secrets → server. Need to return non-serializable values → universal. Need both → server feeds universal via data property.

**12.9 Streaming, {#await} & Parallel Loading**

**JS:** Returning promises without await. Non-blocking render.

**Svelte:** Streaming from server load. {#await data.comments}. SvelteKit runs sibling load functions concurrently.

**Module 13 — Form Actions & Mutations (5 lessons)**

**13.1 HTML Forms & FormData**

**JS:** <form method=POST>. FormData. Progressive enhancement principle.

**Svelte:** SvelteKit actions: server receives FormData. No fetch needed.

**13.2 Default & Named Actions**

**JS:** POST. Request/response for forms.

**Svelte:** actions = { default, login, register }. ?/login URLs.

**13.3 Validation, fail() & Errors**

**JS:** Server validation. Structured error returns.

**Svelte:** fail(400, { email, missing: true }). form prop. Repopulating.

**13.4 use:enhance**

**JS:** Works without JS, better with JS.

**Svelte:** enhance from $app/forms. Custom callback. applyAction. deserialize.

**13.5 Redirects & Post-Action Loading**

**JS:** HTTP 303. Post-Redirect-Get. Cookie updates in actions.

**Svelte:** redirect(303, /dashboard). Load re-runs after action.

+--------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 4 Project: Blog with CMS**                                                                                                                     |
|                                                                                                                                                        |
| API data loading, dynamic [slug], comment form with server validation, progressive enhancement, streaming, parallel loading, AbortController search. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------+
| **Checkpoint: Before Phase 5**                                                                                     |
|                                                                                                                    |
| What is a Promise? +page.js vs +page.server.js? When use which? What does depends() do? How does use:enhance work? |
+--------------------------------------------------------------------------------------------------------------------+

**PHASE 5: ADVANCED MASTERY**

Modules 14--17 · 30 lessons

**Module 14 — Advanced Runes (5 lessons)**

**14.1 $state.raw & $state.snapshot**

**JS:** Proxies. Performance. Object identity.

**Svelte:** $state.raw for large read-only data. $state.snapshot for external libs.

**14.2 $state.eager & Sync Updates**

**JS:** Immediate UI feedback during async.

**Svelte:** $state.eager(pathname) for nav bar during navigation.

**14.3 $effect.pre, $effect.tracking, $effect.root**

**JS:** Timing: pre = before DOM. tracking() = context detection. root() = manual scope.

**Svelte:** $effect.pre for autoscroll. $effect.tracking() for libraries. $effect.root for manual cleanup.

**14.4 $bindable & Two-Way Component Binding**

**JS:** Data flowing up. When bidirectional is appropriate.

**Svelte:** $bindable() in $props. bind:value on custom components. Ownership warnings.

**14.5 $props.id() & Accessible Components**

**JS:** Unique IDs. Hydration-safe.

**Svelte:** $props.id() since 5.20. for/id linking. aria-labelledby.

**Module 15 — Advanced Components (11 lessons)**

**15.1 {@attach} & use: Directive Awareness**

**JS:** What use:action was (students WILL encounter it). Why {@attach} replaces it (reactive, effect-based). How to READ use: syntax in existing code.

**Svelte:** use:action syntax: <div use:tooltip={content}>. {@attach} syntax: <div {@attach tooltip(content)}>. Factory pattern. Inline. Conditional. Cleanup. Component spread with Symbol keys.

**TS:** Attachment type. createAttachmentKey. fromAction for migration.

**15.2 <svelte:boundary>: Error Recovery**

**JS:** Error boundaries. The reset function. Retry patterns. Graceful degradation: part of the page works, part shows error.

**Svelte:** failed(error, reset): reset recreates content. onerror for logging. Nesting boundaries: inner catches before outer. pending snippet for async.

**15.3 Async Svelte: Rendering & Pending (Experimental)**

**JS:** Top-level await. Synchronized updates.

**Svelte:** await in <script>, $derived, markup. $effect.pending() for loading indicators. settled() for post-update work.

**15.4 Async Svelte: Forking & Concurrency (Experimental)**

**JS:** Preloading future UI. Concurrent rendering.

**Svelte:** fork() for preloading on hover/focus. fork().commit() to apply. fork().discard() to cancel. Concurrency: independent await expressions run in parallel.

**15.5 Transitions & Animations**

**JS:** CSS transitions vs Svelte transitions.

**Svelte:** All from svelte/transition: fade (opacity), fly (position + opacity), slide (height/width), scale (size + opacity), blur (blur filter + opacity), draw (SVG stroke animation for path/polyline). Parameters: fly={{ y: -20, duration: 300 }}. Easing from svelte/easing (30+ functions: linear, cubicOut, elasticOut, etc.). Local vs global transitions. in: vs out: vs transition: (bidirectional). crossfade: shared element transitions between containers (todo → done list). Returns [send, receive] pair with key matching.

**15.6 Spring & Tween Classes: Motion Primitives**

**JS:** Physics-based and eased animation values. The class-based API (new in Svelte 5, replaces deprecated spring()/tweened() store functions).

**Svelte:** import { Spring, Tween, prefersReducedMotion } from svelte/motion. new Spring(value, { stiffness, damping, precision }) — .target (set destination), .current (read animated value), .set(value, { instant, preserveMomentum }). new Tween(value, { duration, easing }) — .target, .current, .set(value, opts). Spring.of(() => props.value) and Tween.of(() => props.value) for reactive binding to props. prefersReducedMotion.current — built-in MediaQuery for reduced motion, use to skip animation: duration: prefersReducedMotion.current ? 0 : 300. Legacy: spring()/tweened() from stores era — still work but deprecated.

**15.7 animate:flip & List Reordering**

**JS:** FLIP: First, Last, Invert, Play.

**Svelte:** animate:flip on {#each}. Combining: in:fade + animate:flip. Drag-and-drop reorder with smooth position animation.

**15.8 Special Elements**

**JS:** Window, document, body, dynamic tags.

**Svelte:** <svelte:window/document/body bind:scrollY>. <svelte:element this={tag}>.

**15.9 Dynamic Classes & Styles**

**JS:** Class manipulation. Inline styles.

**Svelte:** class={[btn, large && lg, { active }]}. style:color={c}. <Child \--brand=red>.

**15.10 Legacy Awareness**

**JS:** What Svelte 4 and pre-2.12 SvelteKit code looks like. What students will find when Googling.

**Svelte:** <svelte:options runes={true}>. onMount/onDestroy → $effect. Stores (writable/readable/$store) → runes. Slots → snippets. on:click → onclick. export let → $props. createRawSnippet. Exporting snippets from <script module>. SvelteKit legacy: $app/stores (page, navigating, updated as Svelte stores with $page/$navigating/$updated) → replaced by $app/state (since 2.12, runes-compatible). $app/paths: base/assets → replaced by resolve()/asset(). resolveRoute → replaced by resolve(). Students WILL find old tutorials using these — know what they were and what replaced them.

**15.11 Imperative API: mount, unmount & hydrate**

**JS:** Programmatically creating components outside of templates. Used in testing, tooltips, dynamic rendering, embedding Svelte in non-Svelte pages.

**Svelte:** import { mount, unmount, hydrate } from svelte. mount(Component, { target, props, context, intro }): creates component, returns exports. unmount(component, { outro: true }): removes component, plays exit transitions when outro is true (returns Promise). hydrate(Component, { target, props, recover }): takes server-rendered HTML and makes it interactive. Testing: const app = mount(MyComponent, { target: container, props: { name: test } }). Why this exists: Svelte 5 components are functions, not classes — you can't do new Component() anymore.

**Module 16 — Classes, Generics & Advanced JS (7 lessons)**

**16.1 Classes with $state Fields**

**JS:** class, constructor, methods, getters/setters. Arrow methods for this.

**Svelte:** class Todo { done = $state(false); toggle = () => { this.done = !this.done; }; }.

**TS:** Typing properties.

**16.2 Private Fields, Static & Inheritance**

**JS:** Private: #count. Static: ClassName.create(). extends, super(). Composition > inheritance.

**Svelte:** #items = $state([]). Static factories.

**16.3 Reactive Built-ins**

**JS:** When Map > objects. When Set > arrays.

**Svelte:** SvelteMap, SvelteSet, SvelteDate, SvelteURL, SvelteURLSearchParams from svelte/reactivity. SvelteURLSearchParams: reactive query parameter manipulation independent of SvelteURL — .get(), .set(), .append(), .delete() all trigger reactive updates. Note: values in reactive Map/Set are NOT deeply reactive.

**16.4 Generic Components**

**JS:** Generics: code for any type.

**Svelte:** <script generics=T extends { id: string }>. List<T>, Table<T>.

**TS:** Generics, extends, Snippet<[T]>.

**16.5 Component Type & Wrappers**

**JS:** Component as value. ComponentProps. Wrapper patterns.

**Svelte:** Component<Props>, ComponentProps<T>. HTMLButtonAttributes from svelte/elements.

**TS:** Wrapper typing, SvelteHTMLElements.

**16.6 Symbol, WeakMap & Iterators**

**JS:** Symbol: unique keys. WeakMap: no memory leaks. Iterator protocol.

**Svelte:** createAttachmentKey uses Symbol. WeakMap for caching. for\...of on SvelteMap.

**16.7 Dynamic import() & Code Splitting**

**JS:** Static vs dynamic import(). Lazy loading. Bundle size reduction.

**Svelte:** const Module = await import(./Heavy.svelte). SvelteKit auto-splits per route.

**Module 17 — SvelteKit Advanced & Security (9 lessons)**

**17.1 Hooks: handle, handleError, init**

**JS:** Middleware. Request pipeline.

**Svelte:** handle({ event, resolve }). event.locals. sequence(). handleError. init for DB connections.

**17.2 $app/navigation & Lifecycle**

**JS:** Programmatic nav. History. Cache.

**Svelte:** goto, invalidate, invalidateAll, refreshAll. preloadData/Code. beforeNavigate, afterNavigate, onNavigate.

**17.3 $app/server: getRequestEvent & read**

**JS:** Shared server logic. File access.

**Svelte:** getRequestEvent() for auth guards in any server function. read() for reading deployed static files (replaces fs in Cloudflare).

**17.4 Page Options: prerender, ssr, csr, trailingSlash**

**JS:** Static vs dynamic. Build-time vs runtime. URL normalization.

**Svelte:** prerender = true/false/auto. entries() for dynamic prerender paths. ssr = false for browser-only pages. csr = false for zero-JS pages. trailingSlash = never/always/ignore — controls whether URLs end with /. config for per-route adapter options.

**17.5 Advanced Routing & Layout Groups**

**JS:** Matchers. Groups. Optional params.

**Svelte:** (marketing) vs (app) layout groups. [[lang]]. [id=integer] matchers.

**17.6 Shallow Routing & Snapshots**

**JS:** History state without navigation. Ephemeral UI.

**Svelte:** pushState, replaceState, page.state. export const snapshot.

**17.7 Data Invalidation Patterns**

**JS:** depends() with custom identifiers (app:data). invalidate() targeting specific data. invalidateAll(). When load functions re-run: params change, parent reran, search params changed, depends() URL invalidated. Cross-route invalidation: submit on /posts/new, invalidate list on /posts.

**Svelte:** The glue of production SvelteKit apps. Without this, data gets stale.

**17.8 Security: XSS, CSRF & CSP**

**JS:** {@html} = XSS vector. CSRF: SvelteKit auto-checks Origin. CSP: restricting scripts.

**Svelte:** DOMPurify for {@html}. NEVER raw user input. CSP headers in handle(). Input sanitization.

**17.9 Environment, Server-Only & Transport**

**JS:** Secrets. Build vs runtime. Custom serialization.

**Svelte:** $env modules. $lib/server/ restrictions. transport hook for Date/Map/custom classes across server/client.

+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| **Phase 5 Project: Feature-Rich App**                                                                                                                                                                        |
|                                                                                                                                                                                                              |
| Reactive classes, generic List<T>, {@attach} tooltips, <svelte:boundary> recovery, hooks auth, prerendered + dynamic, shallow routing modals, code-split, security hardened, data invalidation patterns. |
+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------------------------------------------------+
| **Checkpoint: Before Phase 6**                                                                                                             |
|                                                                                                                                            |
| What is $state.raw? {@attach} vs use:? How do hooks work? What is XSS? What did onMount do? What is depends()? Write a generic component. |
+--------------------------------------------------------------------------------------------------------------------------------------------+

**PHASE 6: SEO**

Module 18 · 8 lessons

**Module 18 — SEO: Search Engine Optimization (8 lessons)**

**18.1 Crawling, Indexing, Ranking**

**JS:** Googlebot. robots.txt, sitemap.xml. How ranking works.

**Svelte:** SSR = visible to Google. CSR-only = invisible. Prerendering for static.

**18.2 E-E-A-T & March 2026 Google Core Update**

**JS:** Experience, Expertise, Authoritativeness, Trust. March 2026: Information Gain (new content rewarded, rehashed punished). Gemini 4.0 Semantic Filter. Scaled content abuse. +22% visibility for original research. Parasitic SEO now algorithmic.

**Svelte:** Author signals, unique content, first-party data.

**18.3 Technical SEO in SvelteKit**

**JS:** Titles <60 chars, meta <160, canonical, OG, Twitter cards. h1→h2→h3. Clean URLs.

**Svelte:** <svelte:head> per page. Generating meta from load data. Canonical from page.url.

**18.4 Structured Data & JSON-LD**

**JS:** Schema.org: Article, FAQ, Organization, Breadcrumb, Product. +25-35% CTR confirmed.

**Svelte:** JSON-LD in <svelte:head>. Dynamic per page. Rich Results Test.

**TS:** Schema typing.

**18.5 Core Web Vitals**

**JS:** LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. March 2026: holistic site-wide. 43% fail INP.

**Svelte:** SSR for LCP. Compiled JS for INP. enhanced-img. Font loading. Measuring with Lighthouse.

**18.6 SSR, Prerender & SEO Architecture**

**JS:** When: SSR (dynamic), prerender (static), CSR (auth). Mixing.

**Svelte:** prerender for blog. SSR for search. CSR for dashboard. entries().

**18.7 Sitemaps, Robots & Indexing**

**JS:** XML sitemap. robots.txt. noindex. Google Search Console.

**Svelte:** Dynamic sitemap via +server.js. Per-page meta robots.

**18.8 Content Strategy Post-March 2026**

**JS:** Information Gain. Depth > breadth. Original research. 69% zero-click searches.

**Svelte:** mdsvex for markdown content. Architecture serving users AND search engines.

**PHASE 7: PRODUCTION**

Modules 19--20 · 17 lessons

**Module 19 — Production Tooling (10 lessons)**

**19.1 CSS PE7: Two-Tier Architecture**

**JS:** Cascade layers + scoped styles.

**Svelte:** @layer in app.css + unlayered <style>. Tokens via var(\--\*).

**19.2 Styling: Variants, :global() & Component Props**

**JS:** data-\* variants. When scoped fails.

**Svelte:** [data-variant]. @container. :global(). <Child \--color=red>.

**19.3 Code Quality: ESLint & svelte-check**

**JS:** Lint errors. Type checking CI.

**Svelte:** pnpm svelte-check. eslint config. CI integration. (Prettier already set up in Module 0.)

**19.4 Unit Testing with Vitest**

**JS:** Assertions. describe/it. Mocking.

**Svelte:** Testing .svelte.ts. mount() for components. Mocking fetch.

**19.5 E2E Testing with Playwright**

**JS:** Browser automation. User flows.

**Svelte:** Navigation, forms, errors. CI with GitHub Actions.

**19.6 Debugging & Performance**

**JS:** DevTools. Breakpoints. Profiling.

**Svelte:** $inspect. {@debug}. Svelte DevTools. $state.raw. Code splitting. Lighthouse ≥ 90.

**19.7 Accessibility**

**JS:** ARIA. Keyboard. Screen readers. WCAG.

**Svelte:** Compiler a11y warnings. Focus management on navigation. $props.id(). Semantic HTML.

**19.8 File Organization & Naming**

**JS:** PascalCase components. kebab-case routes. $lib structure. When to extract.

**Svelte:** Barrel exports. Co-location. Route grouping.

**19.9 Building Component Libraries: svelte-package**

**JS:** @sveltejs/package. The exports field in package.json. Publishing to npm. Package best practices.

**Svelte:** svelte-package compiles .svelte to distributable JS. index.ts barrel exports. README with usage examples.

**19.10 Deployment**

**JS:** pnpm build. pnpm preview. Adapters.

**Svelte:** adapter-cloudflare (Workers/Pages). adapter-static. adapter-node. adapter-auto. Env vars per platform.

**Module 20 — Capstone: Build What You Imagine (7 lessons)**

**20.1 Architecture & Planning**

**JS:** Project planning. Component tree. Route structure. State strategy. SEO plan.

**20.2 Design System Setup**

**JS:** app.css @layer. oklch tokens. Type scale. Motion tokens. Dark mode.

**20.3 Core Components**

**JS:** Button, Card, Input, Dialog, Nav, Badge, Toggle, Prose. Typed, tokenized, variant-driven, container-responsive.

**20.4 Page Architecture & Data**

**JS:** Routes, layouts, load functions, form actions, error boundaries.

**20.5 SEO Implementation**

**JS:** <svelte:head>, JSON-LD, sitemap, prerendering, CWV optimization.

**20.6 Testing & Audit**

**JS:** Vitest + Playwright. Lighthouse ≥ 95 accessibility, ≥ 90 performance.

**20.7 Deploy & Ship**

**JS:** Git push. Adapter. Env vars. DNS. LIVE.

**END OF COURSE 1 — FRONTEND**

*The student can build any frontend application they can imagine.*

**COURSE 2: FULL STACK**

**Course 1 + Modules 21--27 · 35 additional lessons**

**Module 21 — Server Endpoints & APIs (5 lessons)**

**21.1 +server.js: API Routes**

**JS:** REST. JSON APIs.

**Svelte:** GET/POST/PUT/DELETE handlers. json(). error(). Content negotiation.

**TS:** RequestHandler.

**21.2 Request & Response**

**JS:** Reading bodies. Headers. Streaming.

**Svelte:** request.formData/json(). new Response(). ReadableStream.

**21.3 Cookies & Sessions**

**JS:** HTTP cookies. Session tokens.

**Svelte:** event.cookies. httpOnly, secure, sameSite.

**21.4 handleFetch**

**JS:** API proxying. Internal requests.

**Svelte:** Rewriting URLs. Cookie forwarding.

**21.5 Server-Sent Events**

**JS:** Real-time without WebSocket.

**Svelte:** ReadableStream SSE. EventSource on client.

**Module 22 — Remote Functions (6 lessons) — CUTTING EDGE**

**22.1 query**

**JS:** Type-safe RPC. Standard Schema validation.

**22.2 query.batch**

**JS:** N+1 problem. Batching.

**22.3 form**

**JS:** Schema-driven forms. fields API.

**22.4 command**

**JS:** Button-triggered mutations.

**22.5 prerender**

**JS:** Build-time data. CDN caching.

**22.6 Single-Flight Mutations**

**JS:** refresh, set, withOverride.

**Module 23 — Database (5 lessons)**

**23.1 PostgreSQL & Drizzle**

**JS:** Tables, rows, columns. Schema.

**23.2 Schema Design & Migrations**

**JS:** Relationships. Migration workflow.

**23.3 CRUD**

**JS:** select/insert/update/delete. Type-safe.

**23.4 Database in SvelteKit**

**JS:** $lib/server/db. Load functions + remote functions.

**23.5 Transactions**

**JS:** Atomic operations. Rollback.

**Module 24 — Authentication (5 lessons)**

**24.1 Auth Concepts**

**JS:** Sessions, tokens, hashing.

**24.2 BetterAuth**

**JS:** Registration, login.

**24.3 Protected Routes**

**JS:** Auth guards via hooks + getRequestEvent.

**24.4 Roles & Permissions**

**JS:** RBAC.

**24.5 OAuth**

**JS:** Google/GitHub login.

**Module 25 — Full Stack Deployment (4 lessons)**

**25.1 adapter-cloudflare**

**JS:** Workers/Pages. KV, D1, DO.

**25.2 adapter-node**

**JS:** Custom server. Docker.

**25.3 Environment Variables**

**JS:** $env per platform.

**25.4 CI/CD & Monitoring**

**JS:** GitHub Actions. Observability.

**Module 26 — Full Stack SEO (3 lessons)**

**26.1 Dynamic Sitemaps**

**JS:** DB-driven sitemap.

**26.2 Performance at Scale**

**JS:** Edge caching. Stale-while-revalidate.

**26.3 Monitoring & Recovery**

**JS:** Lighthouse CI. CWV alerts. Recovery playbook.

**Module 27 — Full Stack Capstone (5 lessons)**

**27.1 Architecture & Schema**

**JS:** Full stack planning.

**27.2 Backend**

**JS:** Drizzle + BetterAuth + endpoints/remote functions.

**27.3 Frontend**

**JS:** Components. Pages. Load. Actions.

**27.4 SEO, Testing & Accessibility**

**JS:** JSON-LD, sitemap, Vitest, Playwright, Lighthouse ≥ 95.

**27.5 Deploy & Ship**

**JS:** LIVE.

**END OF COURSE 2 — FULL STACK**

*The student can build, deploy, and maintain any web application.*

**Final Summary**

**Course 1: Frontend (155 lessons)**

-   21 modules, 7 phases, 6 projects, 6 checkpoints, 1 capstone

-   JS from zero: primitives, null/undefined, type coercion, objects, arrays, destructuring, spread, Object utilities, if/switch, for/for\...of/while/recursion, array methods (map/filter/find/reduce/sort/slice/splice), strings, regex, Math, Date, Intl (NumberFormat/DateTimeFormat/RelativeTimeFormat/Collator), closures, scope, this, events (bubbling/delegation/keyboard/composedPath), timers, debounce, AbortController, event loop (microtask/macrotask), structuredClone, JSON, dynamic import, classes (private/#/static/extends), Symbol, WeakMap, iterators

-   TS: 7 lessons + ongoing. interfaces, unions, as const, discriminated unions, type guards (typeof/in/instanceof), generics, unknown, Partial/Pick/Omit/Record/keyof, satisfies, ReturnType, app.d.ts

-   Svelte 5 COMPLETE: $state (deep/raw/snapshot/eager), $derived (overrides, destructured, chains), $effect (pre/tracking/pending/root), $props ($props.id()), $bindable, $inspect (trace), snippets ({#snippet}/{@render}, typed Snippet<[T]>, exported, createRawSnippet, implicit children, optional), {@attach} (factories/inline/conditional/spread/fromAction/createAttachmentKey), {#if}/{#each}/{#key}/{#await}, {@const}/{@debug}/{@html}, bind: (value/checked/group/files/this/clientWidth/clientHeight/innerHTML/textContent/open/paused/currentTime, function bindings), class (clsx arrays/objects), style:, transitions (fade/fly/slide/scale/blur/draw/crossfade with send/receive), animate:flip, Spring/Tween CLASSES from svelte/motion (.target/.current/.set()/Spring.of()/Tween.of()), prefersReducedMotion, <svelte:boundary> (failed with reset/pending/onerror), <svelte:window/document/body/element/head/options>, context (createContext/getContext/setContext/hasContext/getAllContexts), .svelte.ts modules, reactive built-ins (SvelteMap/Set/Date/URL/URLSearchParams, MediaQuery, createSubscriber), reactive window (innerWidth/scrollY/online/outerWidth/outerHeight/devicePixelRatio/screenLeft/screenTop from svelte/reactivity/window), on() from svelte/events, mount/unmount/hydrate imperative API, flushSync, tick, getAbortSignal, untrack, async await/settled/fork (experimental)

-   SvelteKit COMPLETE: routing, layouts, load (universal+server, decision framework, rerunning rules, dependency tracking, depends/untrack), form actions (default/named, fail, use:enhance, applyAction, deserialize), hooks (handle/handleError/init/handleFetch/handleValidationError/reroute, sequence), page options (prerender/ssr/csr/trailingSlash/config, entries), $app/state (page/navigating/updated), $app/navigation (goto/invalidate/invalidateAll/refreshAll/preloadData/preloadCode/pushState/replaceState/beforeNavigate/afterNavigate/onNavigate/disableScrollHandling), $app/environment (browser/dev/building/version), $app/paths (resolve/asset/match — base/assets deprecated), $app/server (getRequestEvent/read), $app/forms (enhance/applyAction/deserialize), $env modules (static+dynamic, private+public), $lib, link options, svelte.config.js, adapters, advanced routing (groups/matchers/optional), shallow routing, snapshots, error pages, server-only modules, transport hooks, data invalidation patterns, security (CSRF/XSS/CSP), hydration model

-   SEO: Google March 2026 (E-E-A-T, Information Gain, Gemini 4.0 Semantic Filter, CWV holistic), structured data/JSON-LD, sitemaps, prerender strategy, content strategy

-   Production: CSS PE7, Git (from Module 0), Prettier (from Module 0), ESLint, svelte-check, Vitest, Playwright, debugging, performance, accessibility, file organization, svelte-package, deployment

**Course 2: Full Stack (190 lessons)**

-   28 modules. Adds: +server.js, cookies, SSE, remote functions (query/form/command/prerender), PostgreSQL + Drizzle, BetterAuth, OAuth, RBAC, Cloudflare/Node deployment, CI/CD, full stack SEO, capstone

**Exists Nowhere Else**

-   Zero courses teach JS through Svelte from zero.

-   Zero courses cover every Svelte 5 feature through March 2026.

-   Zero courses teach reactivity boundaries, untrack, load function decision frameworks, data invalidation patterns.

-   Zero courses integrate TypeScript naturally (7 dedicated + ongoing).

-   Zero courses include SEO with March 2026 Google Core Update.

-   Zero courses have Git + Prettier from lesson 1.

-   Zero courses produce builders. They produce framework knowers.

Billy Ribeiro · Svelte PE7 Mastery · Course Architecture v5 FINAL · March 2026
