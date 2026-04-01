import type { ConceptNode, ConceptEdge, ConceptCategory } from '$types/concept';

class GraphState {
	nodes = $state<ConceptNode[]>([]);
	edges = $state<ConceptEdge[]>([]);
	selectedNodeId = $state<string | null>(null);
	filterCategory = $state<ConceptCategory | null>(null);
	searchQuery = $state('');

	selectedNode = $derived(this.nodes.find((n) => n.id === this.selectedNodeId) ?? null);

	filteredNodes = $derived.by(() => {
		let result = this.nodes;
		if (this.filterCategory) {
			result = result.filter((n) => n.category === this.filterCategory);
		}
		if (this.searchQuery) {
			const q = this.searchQuery.toLowerCase();
			result = result.filter(
				(n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
			);
		}
		return result;
	});

	setGraph(nodes: ConceptNode[], edges: ConceptEdge[]) {
		this.nodes = nodes;
		this.edges = edges;
	}

	selectNode(id: string | null) {
		this.selectedNodeId = id;
	}

	setFilter(category: ConceptCategory | null) {
		this.filterCategory = category;
	}

	getPrerequisites(nodeId: string): ConceptNode[] {
		const prereqIds = this.edges
			.filter((e) => e.target === nodeId && e.type === 'prerequisite')
			.map((e) => e.source);
		return this.nodes.filter((n) => prereqIds.includes(n.id));
	}

	getDependents(nodeId: string): ConceptNode[] {
		const depIds = this.edges
			.filter((e) => e.source === nodeId && e.type === 'prerequisite')
			.map((e) => e.target);
		return this.nodes.filter((n) => depIds.includes(n.id));
	}
}

export const graphState = new GraphState();
