import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import type { TutorSuggestion } from '$types/tutor';

const SYSTEM_PROMPT = `You are an AI tutor for the SvelteForge learning platform, teaching Svelte 5 with the DiCenso Method.

Core teaching rules:
- Never give away the full answer directly. Guide the student to discover it themselves.
- Use Socratic questioning: ask questions that lead the student toward understanding.
- When a student has errors, help them understand WHY the error occurs before showing the fix.
- Reference the specific code the student is working on when possible.
- Keep responses concise and focused — students are in the middle of coding.
- Use inline code formatting with backticks for code references.
- Celebrate progress and build confidence.
- If the student is stuck, provide graduated hints: conceptual first, then more specific.

Response format:
- Use **bold** for emphasis on key concepts.
- Use \`backticks\` for inline code.
- Use ### for section headings when needed.
- Keep responses under 200 words unless the student asks for a detailed explanation.`;

interface TutorRequestBody {
	message: string;
	context?: {
		lessonTitle?: string;
		currentCode?: string;
		errors?: string[];
		concepts?: string[];
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const body: TutorRequestBody = await request.json();
	const { message, context } = body;

	if (env.CLAUDE_API_KEY) {
		return handleClaudeResponse(message, context);
	}

	return handleMockResponse(message, context);
};

async function handleClaudeResponse(
	message: string,
	context?: TutorRequestBody['context']
) {
	const userContent = buildUserMessage(message, context);

	try {
		const res = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': env.CLAUDE_API_KEY!,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-sonnet-4-20250514',
				max_tokens: 1024,
				system: SYSTEM_PROMPT,
				messages: [{ role: 'user', content: userContent }]
			})
		});

		if (!res.ok) {
			console.error('Claude API error:', res.status, await res.text());
			return handleMockResponse(message, context);
		}

		const data = await res.json();
		const response = data.content?.[0]?.text ?? 'I could not generate a response. Please try again.';

		return json({
			response,
			suggestions: generateSuggestions(message, context)
		});
	} catch (err) {
		console.error('Claude API fetch error:', err);
		return handleMockResponse(message, context);
	}
}

function buildUserMessage(message: string, context?: TutorRequestBody['context']): string {
	let parts = [`Student question: ${message}`];

	if (context?.lessonTitle) {
		parts.push(`Current lesson: ${context.lessonTitle}`);
	}
	if (context?.currentCode) {
		parts.push(`Student's current code:\n\`\`\`svelte\n${context.currentCode}\n\`\`\``);
	}
	if (context?.errors && context.errors.length > 0) {
		parts.push(`Compilation errors:\n${context.errors.join('\n')}`);
	}
	if (context?.concepts && context.concepts.length > 0) {
		parts.push(`Concepts being studied: ${context.concepts.join(', ')}`);
	}

	return parts.join('\n\n');
}

function handleMockResponse(
	message: string,
	context?: TutorRequestBody['context']
) {
	const lower = message.toLowerCase();
	let response: string;

	// Check for error-related questions
	if (context?.errors && context.errors.length > 0) {
		const errorText = context.errors[0];
		response =
			`I can see you're hitting an error: \`${errorText}\`\n\n` +
			`Before I explain the fix, let me ask you: **what do you think this error is telling you?** ` +
			`Understanding error messages is a superpower in programming.\n\n` +
			`Hint: Look at where the error points in your code and think about what Svelte expects there.`;
	}
	// Check for code-specific questions
	else if (context?.currentCode && (lower.includes('my code') || lower.includes('wrong') || lower.includes('not working') || lower.includes('help'))) {
		response =
			`I can see your code${context.lessonTitle ? ` in the **${context.lessonTitle}** lesson` : ''}. ` +
			`Let me guide you through this.\n\n` +
			`**First**, can you describe what you *expected* your code to do versus what it actually does? ` +
			`This will help me pinpoint exactly where we should focus.`;
	}
	// Reactivity questions
	else if (lower.includes('$state') || lower.includes('reactive') || lower.includes('rune')) {
		response =
			`Great question about **Svelte 5 reactivity**! Runes like \`$state\` make reactivity explicit.\n\n` +
			`Think of it this way: in Svelte 5, a variable is only reactive if you *tell* Svelte it should be. ` +
			`What happens in your code when you change a variable that is **not** wrapped in \`$state()\`?`;
	}
	// Derived state
	else if (lower.includes('$derived') || lower.includes('computed') || lower.includes('derived')) {
		response =
			`\`$derived\` is perfect for values that are **calculated from other state**.\n\n` +
			`Here's the key insight: \`$derived\` automatically tracks which \`$state\` values it reads. ` +
			`Can you think of a value in your current code that always depends on another piece of state?`;
	}
	// Effects
	else if (lower.includes('$effect') || lower.includes('side effect') || lower.includes('effect')) {
		response =
			`The \`$effect\` rune runs **after** the DOM updates and is for side effects — things like logging, API calls, or manual DOM manipulation.\n\n` +
			`**Important distinction**: unlike \`$derived\`, effects don't return a value. ` +
			`When would you use \`$effect\` vs \`$derived\`? Think about whether you need a *value* or an *action*.`;
	}
	// Each blocks
	else if (lower.includes('each') || lower.includes('loop') || lower.includes('list') || lower.includes('array')) {
		response =
			`When rendering lists in Svelte, the \`{#each}\` block is your tool.\n\n` +
			`**Pro tip**: always add a key for optimal performance: \`{#each items as item (item.id)}\`. ` +
			`Why do you think keys matter? Think about what happens when an item in the middle of the list changes.`;
	}
	// General/fallback
	else {
		response = context?.lessonTitle
			? `That's a thoughtful question about **${context.lessonTitle}**! ` +
			  `Let me help you work through this.\n\n` +
			  `Can you be a bit more specific about what part is confusing? ` +
			  `Are you stuck on the **concept** or the **syntax**? That way I can guide you more effectively.`
			: `That's a great question! Let me help you think through this.\n\n` +
			  `**Before I answer directly**, try to identify the specific part that's confusing you. ` +
			  `Is it a concept, a syntax issue, or something about how the pieces fit together? ` +
			  `The more specific you can be, the better I can guide you.`;
	}

	return json({
		response,
		suggestions: generateSuggestions(message, context)
	});
}

function generateSuggestions(
	message: string,
	context?: TutorRequestBody['context']
): TutorSuggestion[] {
	const suggestions: TutorSuggestion[] = [];

	if (context?.errors && context.errors.length > 0) {
		suggestions.push({
			id: crypto.randomUUID(),
			label: 'Explain this error',
			prompt: `Can you explain what this error means: ${context.errors[0]}`,
			type: 'debug'
		});
	}

	if (context?.currentCode) {
		suggestions.push({
			id: crypto.randomUUID(),
			label: 'Review my code',
			prompt: 'Can you review my current code and suggest improvements?',
			type: 'review'
		});
	}

	suggestions.push({
		id: crypto.randomUUID(),
		label: 'Give me a hint',
		prompt: 'I\'m stuck. Can you give me a hint without revealing the answer?',
		type: 'hint'
	});

	suggestions.push({
		id: crypto.randomUUID(),
		label: 'Explain the concept',
		prompt: context?.lessonTitle
			? `Can you explain the main concept behind the "${context.lessonTitle}" lesson?`
			: 'Can you explain this concept in simpler terms?',
		type: 'explain'
	});

	return suggestions;
}
