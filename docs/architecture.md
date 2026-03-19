# SVELTE PE7 MASTERY — COURSE ARCHITECTURE v5 FINAL

JavaScript + TypeScript + Svelte 5 + SvelteKit + SEO
Taught Through Building — DiCenso Method

Course 1 (Frontend): 21 Modules · 155 Lessons · 7 Phases
Course 2 (Full Stack): 28 Modules · 190 Lessons · 10 Phases

Billy Ribeiro · March 2026

## Course Philosophy

- **DiCenso Method:** Every concept introduced at the moment the student needs it. No isolation.
- **Vehicle:** SvelteKit from Lesson 0.2. `$state(0)` before a standalone variable.
- **TypeScript:** Enters Module 8 when untyped props create friction. Permanent from that point.
- **Two Courses:** Course 1 (Frontend) is standalone. Course 2 adds server modules. No repeated content.
- **PE7 Tiers:** MUST MASTER 75%, KNOW WELL 20%, CUTTING EDGE 5%.
- **Prerequisites:** HTML and CSS. Zero JavaScript. Zero TypeScript. Zero frameworks.

---

## COURSE 1: FRONTEND

21 Modules · 150 Lessons · 7 Phases · 6 Projects · 6 Checkpoints · 1 Capstone

### PHASE 1: FIRST STEPS (Modules 0–4) · 32 lessons

Dev setup, Git, Prettier from day 1. Variables, types, null/undefined, type coercion. Objects, arrays, destructuring, spread, Object utilities. Components, props, {#if}, {#each}. Array methods, strings, regex, Math, Date, Intl. Events, bubbling, keyboard, scope, closures.

#### Module 0 — First Contact (8 lessons)

**0.1 Set Up Your Machine**
- JS: Terminal basics, Node.js LTS, pnpm, VS Code, Svelte extension
- Svelte: Why these tools

**0.2 Your First SvelteKit Project**
- JS: `pnpm create svelte@latest`, project structure, HMR, DevTools
- Svelte: `$state(0)`, `{count}` in markup, `.svelte` file structure

**0.3 Seeing Your Data & Leaving Notes**
- JS: `console.log()`, comments, error messages
- Svelte: `{JSON.stringify(obj)}` in markup

**0.4 Functions & Making Things Happen**
- JS: Function declarations, arrow functions, parameters, return values, assignment operators
- Svelte: `onclick={handler}`, inline handlers

**0.5 Text, Numbers & Booleans**
- JS: Primitives, typeof, template literals, type coercion
- Svelte: `$state('hello')`, `$state(42)`, `$state(true)`

**0.6 The Void: null, undefined & Falsy**
- JS: null vs undefined, falsy values, optional chaining, nullish coalescing
- Svelte: `$state()` with no argument, `{#if user}`, `{user?.name ?? 'Anonymous'}`

**0.7 let vs const**
- JS: let vs const, mutation vs reassignment
- Svelte: `$state` vs `const`

**0.8 Git & Prettier: Save Your Work**
- JS: Version control, git init/add/commit, .gitignore, Prettier setup
- Svelte: Professional workflow from day 1

#### Module 1 — Working with Data (6 lessons)

**1.1 Objects: Grouping Related Data**
- JS: Object literals, dot/bracket notation, nested objects, shorthand
- Svelte: Reactive objects with `$state({})`

**1.2 Arrays: Lists of Things**
- JS: Array literals, indexing, .length, .push(), .pop()
- Svelte: Reactive arrays, deep reactivity

**1.3 Destructuring**
- JS: Object/array destructuring, defaults, renaming
- Svelte: `$props()` destructuring

**1.4 Spread & Copying**
- JS: Spread arrays/objects, shallow copy
- Svelte: `<button {...rest}>`, rest props

**1.5 Operators & Comparisons**
- JS: Arithmetic, comparison (===), logical, ternary
- Svelte: Conditional markup, logical AND rendering

**1.6 Object Utilities**
- JS: Object.keys/values/entries, `in` operator
- Svelte: Dynamic property rendering

#### Module 2 — Components & Props (5 lessons)

**2.1 Your First Component**
- JS: import, modules, file organization
- Svelte: `.svelte` files, import/use components

**2.2 Passing Data: $props()**
- JS: Function parameters = component props
- Svelte: `$props()`, defaults, rest props

**2.3 Conditional Rendering: {#if}**
- JS: if/else, truthiness
- Svelte: `{#if}` vs ternary

**2.4 List Rendering: {#each}**
- JS: Iteration, index, keys
- Svelte: Keyed each, {:else}, `{#each {length: 5}, i}`

**2.5 Component Patterns**
- JS: Objects in arrays, destructuring in loops
- Svelte: Reusable components, composition

#### Module 3 — Transforming Data (7 lessons)

**3.1 Control Flow: if/else, switch**
**3.2 Loops & Recursion**
**3.3 Array Methods: map, filter, find**
**3.4 Sorting, Reducing & Mutating**
**3.5 String Methods**
**3.6 Regular Expressions**
**3.7 Math, Numbers, Dates & Intl**

#### Module 4 — Events & Interactivity (5 lessons)

**4.1 Events Deep Dive**
**4.2 Bubbling & stopPropagation**
**4.3 Keyboard Events & Accessibility**
**4.4 Callbacks & Communication**
**4.5 Scope & Closures**

**Phase 1 Project: Interactive Product Catalog**

---

### PHASE 2: FOUNDATIONS (Modules 5–8) · 25 lessons

#### Module 5 — How the Web Works (5 lessons)

**5.1 Client, Server & HTTP**
**5.2 The DOM & Hydration**
**5.3 URLs, Query Strings & URL API**
**5.4 Browser Storage**
**5.5 Browser APIs & Reactive Window State**

#### Module 6 — Derived State & Effects (9 lessons)

**6.1 $derived: Computed Values**
**6.2 Derived Chains & Destructuring**
**6.3 Overriding Derived (Optimistic UI)**
**6.4 $effect: Side Effects**
**6.5 When NOT to Use $effect**
**6.6 Reactivity Boundaries: What Breaks**
**6.7 untrack() & Dependency Control**
**6.8 Timers, Cleanup & Debounce**
**6.9 $inspect, flushSync, Event Loop & Timing**

#### Module 7 — Error Handling & JSON (4 lessons)

**7.1 try/catch/finally**
**7.2 Error Types & Stack Traces**
**7.3 Custom Errors & Patterns**
**7.4 JSON & Deep Copying**

#### Module 8 — TypeScript: The Switch (7 lessons)

**8.1 Why Types & lang=ts**
**8.2 Interfaces for Props**
**8.3 Union Types, Literals & as const**
**8.4 Type Guards & Discriminated Unions**
**8.5 Generic Functions & unknown**
**8.6 Utility Types & Aliases**
**8.7 satisfies, ReturnType & app.d.ts**

**Phase 2 Project: Real-Time Dashboard**

---

### PHASE 3: COMPONENTS & FORMS (Modules 9–11) · 22 lessons

#### Module 9 — Forms & Binding (7 lessons)

**9.1 Two-Way Binding: bind:value**
**9.2 Checkboxes, Radios, Selects & Details**
**9.3 Function Bindings (Since 5.9)**
**9.4 Reactive Forms: Validation**
**9.5 Files, Dimensions & DOM References**
**9.6 Contenteditable & Special Bindings**
**9.7 The this Keyword**

#### Module 10 — Component Composition (7 lessons)

**10.1 Snippets: Reusable Markup**
**10.2 Passing Snippets to Components**
**10.3 Context: Sharing Without Props**
**10.4 Modules & Shared State**
**10.5 {#key}, {@const} & {@debug}**
**10.6 Packages & Dependencies**
**10.7 Compound Components**

#### Module 11 — SvelteKit Routing (8 lessons)

**11.1 File-Based Routing**
**11.2 Layouts: Shared UI**
**11.3 Dynamic Routes & Params**
**11.4 Navigation & $app/state**
**11.5 <svelte:head> & Metadata**
**11.6 Error Pages & <svelte:boundary>**
**11.7 Link Options & Preloading**
**11.8 Config, Assets, Images & Icons**

**Phase 3 Project: Multi-Page App**

---

### PHASE 4: DATA & ASYNC (Modules 12–13) · 14 lessons

#### Module 12 — Async JavaScript & Data Loading (9 lessons)

**12.1 Promises & Event Loop**
**12.2 async/await**
**12.3 fetch API**
**12.4 Parallel Async & Partial Failures**
**12.5 AbortController, Cancellation & getAbortSignal**
**12.6 Universal Load (+page.js)**
**12.7 Server Load (+page.server.js)**
**12.8 Universal vs Server: The Decision**
**12.9 Streaming, {#await} & Parallel Loading**

#### Module 13 — Form Actions & Mutations (5 lessons)

**13.1 HTML Forms & FormData**
**13.2 Default & Named Actions**
**13.3 Validation, fail() & Errors**
**13.4 use:enhance**
**13.5 Redirects & Post-Action Loading**

**Phase 4 Project: Blog with CMS**

---

### PHASE 5: ADVANCED MASTERY (Modules 14–17) · 30 lessons

#### Module 14 — Advanced Runes (5 lessons)

**14.1 $state.raw & $state.snapshot**
**14.2 $state.eager & Sync Updates**
**14.3 $effect.pre, $effect.tracking, $effect.root**
**14.4 $bindable & Two-Way Component Binding**
**14.5 $props.id() & Accessible Components**

#### Module 15 — Advanced Components (11 lessons)

**15.1 {@attach} & use: Directive Awareness**
**15.2 <svelte:boundary>: Error Recovery**
**15.3 Async Svelte: Rendering & Pending (Experimental)**
**15.4 Async Svelte: Forking & Concurrency (Experimental)**
**15.5 Transitions & Animations**
**15.6 Spring & Tween Classes: Motion Primitives**
**15.7 animate:flip & List Reordering**
**15.8 Special Elements**
**15.9 Dynamic Classes & Styles**
**15.10 Legacy Awareness**
**15.11 Imperative API: mount, unmount & hydrate**

#### Module 16 — Classes, Generics & Advanced JS (7 lessons)

**16.1 Classes with $state Fields**
**16.2 Private Fields, Static & Inheritance**
**16.3 Reactive Built-ins**
**16.4 Generic Components**
**16.5 Component Type & Wrappers**
**16.6 Symbol, WeakMap & Iterators**
**16.7 Dynamic import() & Code Splitting**

#### Module 17 — SvelteKit Advanced & Security (9 lessons)

**17.1 Hooks: handle, handleError, init**
**17.2 $app/navigation & Lifecycle**
**17.3 $app/server: getRequestEvent & read**
**17.4 Page Options: prerender, ssr, csr, trailingSlash**
**17.5 Advanced Routing & Layout Groups**
**17.6 Shallow Routing & Snapshots**
**17.7 Data Invalidation Patterns**
**17.8 Security: XSS, CSRF & CSP**
**17.9 Environment, Server-Only & Transport**

**Phase 5 Project: Feature-Rich App**

---

### PHASE 6: SEO (Module 18) · 8 lessons

#### Module 18 — SEO: Search Engine Optimization (8 lessons)

**18.1 Crawling, Indexing, Ranking**
**18.2 E-E-A-T & March 2026 Google Core Update**
**18.3 Technical SEO in SvelteKit**
**18.4 Structured Data & JSON-LD**
**18.5 Core Web Vitals**
**18.6 SSR, Prerender & SEO Architecture**
**18.7 Sitemaps, Robots & Indexing**
**18.8 Content Strategy Post-March 2026**

---

### PHASE 7: PRODUCTION (Modules 19–20) · 17 lessons

#### Module 19 — Production Tooling (10 lessons)

**19.1 CSS PE7: Two-Tier Architecture**
**19.2 Styling: Variants, :global() & Component Props**
**19.3 Code Quality: ESLint & svelte-check**
**19.4 Unit Testing with Vitest**
**19.5 E2E Testing with Playwright**
**19.6 Debugging & Performance**
**19.7 Accessibility**
**19.8 File Organization & Naming**
**19.9 Building Component Libraries: svelte-package**
**19.10 Deployment**

#### Module 20 — Capstone: Build What You Imagine (7 lessons)

**20.1 Architecture & Planning**
**20.2 Design System Setup**
**20.3 Core Components**
**20.4 Page Architecture & Data**
**20.5 SEO Implementation**
**20.6 Testing & Audit**
**20.7 Deploy & Ship**

---

## COURSE 2: FULL STACK

Course 1 + Modules 21–27 · 35 additional lessons

#### Module 21 — Server Endpoints & APIs (5 lessons)
#### Module 22 — Remote Functions (6 lessons) — CUTTING EDGE
#### Module 23 — Database (5 lessons)
#### Module 24 — Authentication (5 lessons)
#### Module 25 — Full Stack Deployment (4 lessons)
#### Module 26 — Full Stack SEO (3 lessons)
#### Module 27 — Full Stack Capstone (5 lessons)
