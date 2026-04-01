import type { TutorMessage, TutorSuggestion } from '$types/tutor';

class TutorState {
	messages = $state<TutorMessage[]>([]);
	isLoading = $state(false);
	isOpen = $state(false);
	suggestions = $state<TutorSuggestion[]>([]);

	messageCount = $derived(this.messages.length);

	addUserMessage(content: string) {
		this.messages = [
			...this.messages,
			{
				id: crypto.randomUUID(),
				role: 'user',
				content,
				timestamp: Date.now()
			}
		];
	}

	addAssistantMessage(content: string) {
		this.messages = [
			...this.messages,
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content,
				timestamp: Date.now()
			}
		];
	}

	setSuggestions(suggestions: TutorSuggestion[]) {
		this.suggestions = suggestions;
	}

	clearConversation() {
		this.messages = [];
		this.suggestions = [];
	}

	toggle() {
		this.isOpen = !this.isOpen;
	}
}

export const tutorState = new TutorState();
