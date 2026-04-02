import type { Lesson } from '$types/lesson';

export const dataTables: Lesson = {
	id: 'projects.build-a-dashboard.data-tables',
	slug: 'data-tables',
	title: 'Data Tables',
	description:
		'Build a feature-rich data table with sortable columns, inline search, pagination, and row selection using Svelte 5 runes.',
	trackId: 'projects',
	moduleId: 'build-a-dashboard',
	order: 3,
	estimatedMinutes: 30,
	concepts: ['svelte5.runes.derived', 'svelte5.runes.state', 'svelte5.control-flow.each'],
	prerequisites: ['projects.build-a-dashboard.data-visualization'],

	content: [
		{
			type: 'text',
			content: `# Building Data Tables

Data tables are the workhorse of any dashboard. Charts give you the big picture; tables give you the details. In this lesson you will build a fully interactive data table with sortable columns, a search filter, pagination, and row selection. Every feature will be powered by Svelte 5 runes, demonstrating how complex UI interactions emerge naturally from reactive derived state.

## The Data Model

Our table will display user records — a realistic dataset for a dashboard:

\`\`\`ts
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  revenue: number;
}
\`\`\`

We start with a \`$state\` array of seed users. In a real application this data would come from an API, but the reactive patterns are identical — replace the static array with fetched data and every downstream computation still works.

## Column-Based Sorting

Sorting is the most-requested table feature. We need two pieces of state: which column is sorted, and the sort direction:

\`\`\`ts
let sortColumn = $state<keyof User>('name');
let sortDirection = $state<'asc' | 'desc'>('asc');

function toggleSort(column: keyof User) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
}
\`\`\`

Clicking a column header calls \`toggleSort\`. If you click the same column, it flips the direction. If you click a different column, it switches to that column in ascending order. This is the universally expected behavior in data tables.

The sorted data is a \`$derived\` computation:

\`\`\`ts
let sortedUsers = $derived(
  [...users].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  })
);
\`\`\`

The spread operator (\`[...users]\`) creates a shallow copy before sorting, so we never mutate the original array. This is important — mutating a \`$state\` array triggers reactivity, which would cause an infinite loop if the sort itself triggers a re-computation.

## Search Filtering

Layer search on top of sorting. The search query checks multiple fields:

\`\`\`ts
let searchQuery = $state('');

let filteredUsers = $derived(
  sortedUsers.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  })
);
\`\`\`

This derived chain — raw data -> sorted -> filtered -> paginated — is the same pipeline pattern you saw in the blog listing lesson. The pattern is universal because it decomposes complex transformations into small, testable, composable steps.

## Pagination

Paginate the filtered results:

\`\`\`ts
let currentPage = $state(1);
const PAGE_SIZE = 10;

let totalPages = $derived(Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)));
let paginatedUsers = $derived(
  filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
);

$effect(() => {
  searchQuery;
  sortColumn;
  sortDirection;
  currentPage = 1;
});
\`\`\`

The \`$effect\` resets pagination whenever any upstream filter changes, preventing empty pages.

## Row Selection

Dashboards often need batch operations — delete selected users, export them, change their status. We track selected row IDs in a \`$state\` Set:

\`\`\`ts
let selectedIds = $state(new Set<number>());

function toggleRow(id: number) {
  if (selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
  }
}

function toggleAll() {
  if (selectedIds.size === paginatedUsers.length) {
    selectedIds.clear();
  } else {
    paginatedUsers.forEach(u => selectedIds.add(u.id));
  }
}

let allSelected = $derived(
  paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id))
);
\`\`\`

Svelte 5 tracks Set mutations (add, delete, clear), so the UI updates automatically when you toggle selections. The "select all" checkbox uses the \`$derived\` \`allSelected\` value to stay in sync.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.derived'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Data Table

Open the starter code. You will find a \`DataTable.svelte\` shell and seed data in \`App.svelte\`.

1. Implement column sorting with \`$state\` for sort column and direction, and \`$derived\` for sorted data.
2. Add search filtering with a text input bound to \`$state\`.
3. Add pagination with Previous/Next controls and page reset.
4. Implement row selection with checkboxes and a "select all" toggle.`
		},
		{
			type: 'checkpoint',
			content: 'cp-table-sort'
		},
		{
			type: 'text',
			content: `## Rendering Sort Indicators

Column headers should show which column is sorted and in which direction. Use a small arrow indicator:

\`\`\`svelte
<th onclick={() => toggleSort('name')}>
  Name
  {#if sortColumn === 'name'}
    <span class="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  {/if}
</th>
\`\`\`

Make headers clickable with a pointer cursor and a subtle hover background. This visual affordance tells users that columns are interactive — without it, the sorting feature is invisible.

## Status Badges

The \`status\` field renders as a colored badge — green for "active", gray for "inactive". This is a common dashboard pattern:

\`\`\`svelte
<span class="badge" class:active={user.status === 'active'}>
  {user.status}
</span>
\`\`\`

The \`class:\` directive is ideal here — it applies the "active" class conditionally without string concatenation or ternary operators.

## Revenue Formatting

Display the \`revenue\` field as formatted currency using \`toLocaleString\`:

\`\`\`svelte
<td>\${user.revenue.toLocaleString()}</td>
\`\`\`

Right-align numeric columns for readability — this is a table design convention that makes numbers easier to compare visually.`
		},
		{
			type: 'checkpoint',
			content: 'cp-table-search'
		},
		{
			type: 'checkpoint',
			content: 'cp-table-select'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import DataTable from './DataTable.svelte';

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinedAt: string;
    revenue: number;
  }

  const users: User[] = [
    { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active', joinedAt: '2024-01-15', revenue: 12500 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active', joinedAt: '2024-02-20', revenue: 8300 },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-03-10', revenue: 3200 },
    { id: 4, name: 'Diana Wilson', email: 'diana@example.com', role: 'Editor', status: 'active', joinedAt: '2024-04-05', revenue: 9800 },
    { id: 5, name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'active', joinedAt: '2024-05-12', revenue: 15600 },
    { id: 6, name: 'Frank Brown', email: 'frank@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-06-18', revenue: 2100 },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'active', joinedAt: '2024-07-22', revenue: 7400 },
    { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-08-30', revenue: 4500 },
    { id: 9, name: 'Iris Martinez', email: 'iris@example.com', role: 'Admin', status: 'active', joinedAt: '2024-09-14', revenue: 18200 },
    { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'inactive', joinedAt: '2024-10-01', revenue: 6100 },
    { id: 11, name: 'Karen White', email: 'karen@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-10-15', revenue: 3800 },
    { id: 12, name: 'Leo Garcia', email: 'leo@example.com', role: 'Admin', status: 'active', joinedAt: '2024-11-02', revenue: 14300 },
  ];
</script>

<div class="app">
  <h1>User Management</h1>
  <DataTable {users} />
</div>

<style>
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		},
		{
			name: 'DataTable.svelte',
			path: '/DataTable.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinedAt: string;
    revenue: number;
  }

  let { users }: { users: User[] } = $props();

  // TODO: Add $state for sortColumn, sortDirection, searchQuery, currentPage, selectedIds
  // TODO: Add $derived for sortedUsers, filteredUsers, totalPages, paginatedUsers, allSelected
  // TODO: Add toggleSort, toggleRow, toggleAll functions
  // TODO: Add $effect to reset page on filter changes
</script>

<!-- TODO: Search input -->
<!-- TODO: Table with sortable headers, checkboxes, and data rows -->
<!-- TODO: Pagination controls -->

<style>
  /* Add your table styles here */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'DataTable.svelte',
			path: '/DataTable.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinedAt: string;
    revenue: number;
  }

  let { users }: { users: User[] } = $props();

  let sortColumn = $state<keyof User>('name');
  let sortDirection = $state<'asc' | 'desc'>('asc');
  let searchQuery = $state('');
  let currentPage = $state(1);
  let selectedIds = $state(new Set<number>());
  const PAGE_SIZE = 5;

  function toggleSort(column: keyof User) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
  }

  function toggleRow(id: number) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
  }

  function toggleAll() {
    if (allSelected) {
      selectedIds.clear();
    } else {
      paginatedUsers.forEach(u => selectedIds.add(u.id));
    }
  }

  let sortedUsers = $derived(
    [...users].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    })
  );

  let filteredUsers = $derived(
    sortedUsers.filter(user => {
      const q = searchQuery.toLowerCase();
      return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q);
    })
  );

  let totalPages = $derived(Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)));
  let paginatedUsers = $derived(filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));
  let allSelected = $derived(paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id)));

  $effect(() => {
    searchQuery;
    sortColumn;
    sortDirection;
    currentPage = 1;
  });
</script>

<div class="table-wrapper">
  <div class="toolbar">
    <input class="search" bind:value={searchQuery} placeholder="Search users..." />
    {#if selectedIds.size > 0}
      <span class="selection-count">{selectedIds.size} selected</span>
    {/if}
  </div>

  <table>
    <thead>
      <tr>
        <th class="checkbox-col">
          <input type="checkbox" checked={allSelected} onchange={toggleAll} />
        </th>
        <th onclick={() => toggleSort('name')}>
          Name {sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('email')}>
          Email {sortColumn === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('role')}>
          Role {sortColumn === 'role' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('status')}>
          Status {sortColumn === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('revenue')} class="numeric">
          Revenue {sortColumn === 'revenue' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
        </th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedUsers as user (user.id)}
        <tr class:selected={selectedIds.has(user.id)}>
          <td class="checkbox-col">
            <input type="checkbox" checked={selectedIds.has(user.id)} onchange={() => toggleRow(user.id)} />
          </td>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>
            <span class="badge" class:active={user.status === 'active'}>{user.status}</span>
          </td>
          <td class="numeric">\${user.revenue.toLocaleString()}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div class="pagination">
    <span class="info">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}</span>
    <div class="controls">
      <button onclick={() => currentPage--} disabled={currentPage === 1}>Previous</button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onclick={() => currentPage++} disabled={currentPage >= totalPages}>Next</button>
    </div>
  </div>
</div>

<style>
  .table-wrapper {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .search {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    width: 250px;
  }

  .selection-count {
    font-size: 0.85rem;
    color: #6366f1;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    padding: 0.625rem 0.75rem;
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    background: #f8fafc;
    cursor: pointer;
    user-select: none;
  }

  th:hover { background: #f1f5f9; }

  td {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    color: #374151;
    border-bottom: 1px solid #f1f5f9;
  }

  tr.selected { background: #eff6ff; }

  .numeric { text-align: right; }
  .checkbox-col { width: 40px; }

  .badge {
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    background: #f1f5f9;
    color: #64748b;
  }

  .badge.active {
    background: #dcfce7;
    color: #16a34a;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .info {
    font-size: 0.8rem;
    color: #64748b;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .controls button {
    padding: 0.375rem 0.75rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .controls span {
    font-size: 0.8rem;
    color: #64748b;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import DataTable from './DataTable.svelte';

  interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    joinedAt: string;
    revenue: number;
  }

  const users: User[] = [
    { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active', joinedAt: '2024-01-15', revenue: 12500 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active', joinedAt: '2024-02-20', revenue: 8300 },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-03-10', revenue: 3200 },
    { id: 4, name: 'Diana Wilson', email: 'diana@example.com', role: 'Editor', status: 'active', joinedAt: '2024-04-05', revenue: 9800 },
    { id: 5, name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'active', joinedAt: '2024-05-12', revenue: 15600 },
    { id: 6, name: 'Frank Brown', email: 'frank@example.com', role: 'Viewer', status: 'inactive', joinedAt: '2024-06-18', revenue: 2100 },
    { id: 7, name: 'Grace Lee', email: 'grace@example.com', role: 'Editor', status: 'active', joinedAt: '2024-07-22', revenue: 7400 },
    { id: 8, name: 'Henry Taylor', email: 'henry@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-08-30', revenue: 4500 },
    { id: 9, name: 'Iris Martinez', email: 'iris@example.com', role: 'Admin', status: 'active', joinedAt: '2024-09-14', revenue: 18200 },
    { id: 10, name: 'Jack Anderson', email: 'jack@example.com', role: 'Editor', status: 'inactive', joinedAt: '2024-10-01', revenue: 6100 },
    { id: 11, name: 'Karen White', email: 'karen@example.com', role: 'Viewer', status: 'active', joinedAt: '2024-10-15', revenue: 3800 },
    { id: 12, name: 'Leo Garcia', email: 'leo@example.com', role: 'Admin', status: 'active', joinedAt: '2024-11-02', revenue: 14300 },
  ];
</script>

<div class="app">
  <h1>User Management</h1>
  <DataTable {users} />
</div>

<style>
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-table-sort',
			description: 'Implement column sorting with $state and $derived sorted data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'sortColumn' },
						{ type: 'contains', value: 'sortDirection' },
						{ type: 'contains', value: '.sort(' }
					]
				}
			},
			hints: [
				'Create `let sortColumn = $state<keyof User>(\'name\')` and `let sortDirection = $state<\'asc\' | \'desc\'>(\'asc\')`.',
				'Write a `toggleSort` function that flips direction when clicking the same column, or switches column and resets to ascending.',
				'Derive sorted data with `let sortedUsers = $derived([...users].sort((a, b) => { ... }))` using `localeCompare` for strings and subtraction for numbers, multiplied by a direction modifier.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.runes.derived']
		},
		{
			id: 'cp-table-search',
			description: 'Add search filtering and pagination with automatic page reset',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'searchQuery' },
						{ type: 'contains', value: 'filteredUsers' },
						{ type: 'contains', value: 'paginatedUsers' }
					]
				}
			},
			hints: [
				'Create `let searchQuery = $state(\'\')` and `let filteredUsers = $derived(sortedUsers.filter(...))`.',
				'Add pagination with `let paginatedUsers = $derived(filteredUsers.slice(...))`.',
				'Add `$effect(() => { searchQuery; sortColumn; currentPage = 1; })` to reset pagination when filters change.'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-table-select',
			description: 'Implement row selection with checkboxes and a select-all toggle',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'selectedIds' },
						{ type: 'contains', value: 'toggleRow' },
						{ type: 'contains', value: 'toggleAll' }
					]
				}
			},
			hints: [
				'Create `let selectedIds = $state(new Set<number>())` to track selected rows.',
				'Write `toggleRow(id)` that adds/removes from the Set, and `toggleAll()` that selects/deselects all visible rows.',
				'Derive `let allSelected = $derived(paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id)))` and bind the header checkbox to it.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.control-flow.each']
		}
	]
};
