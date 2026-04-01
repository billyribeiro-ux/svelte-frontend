import * as v from 'valibot';
import { query } from '$app/server';
import { env } from '$env/dynamic/private';
import type { TutorSuggestion } from '$types/tutor';

const SYSTEM_PROMPT = `You are an AI tutor for the SvelteForge learning platform, teaching Svelte 5 with the DiCenso Method.

Core teaching rules:
- Never give away the full answer directly. Guide the student to discover it themselves.
- Use Socratic questioning: ask questions that lead the student toward understanding.
- When a student has errors, help them understand WHY the error occurs before showing the fix.
- Reference the specific code the student is working on when possible.
- Keep responses concise and focused — students are in the middle of coding.
- Celebrate progress and build confidence.
- If the student is stuck, provide graduated hints: conceptual first, then more specific.

Response format:
- Use **bold** for emphasis on key concepts.
- Use \`backticks\` for inline code.
- Keep responses under 200 words unless the student asks for a detailed explanation.`;

const TutorInputSchema = v.object({
	message: v.string(),
	context: v.optional(v.object({
		lessonTitle: v.optional(v.string()),
		currentCode: v.optional(v.string()),
		errors: v.optional(v.array(v.string())),
		concepts: v.optional(v.array(v.string()))
	}))
});

type TutorInput = v.InferOutput<typeof TutorInputSchema>;

interface TutorResponse {
	response: string;
	suggestions: TutorSuggestion[];
}

export const askTutor = query(TutorInputSchema, async (input): Promise<TutorResponse> => {
	const { message, context } = input;

	if (env.CLAUDE_API_KEY) {
		return handleClaudeResponse(message, context);
	}
	return handleMockResponse(message, context);
});

async function handleClaudeResponse(
	message: string,
	context?: TutorInput['context']
): Promise<TutorResponse> {
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

		if (!res.ok) return handleMockResponse(message, context);

		const data = await res.json();
		const response = data.content?.[0]?.text ?? 'I could not generate a response.';

		return { response, suggestions: generateSuggestions(context) };
	} catch {
		return handleMockResponse(message, context);
	}
}

function buildUserMessage(message: string, context?: TutorInput['context']): string {
	const parts = [`Student question: ${message}`];
	if (context?.lessonTitle) parts.push(`Current lesson: ${context.lessonTitle}`);
	if (context?.currentCode) parts.push(`Student's code:\n\`\`\`svelte\n${context.currentCode}\n\`\`\``);
	if (context?.errors?.length) parts.push(`Errors:\n${context.errors.join('\n')}`);
	if (context?.concepts?.length) parts.push(`Concepts: ${context.concepts.join(', ')}`);
	return parts.join('\n\n');
}

function handleMockResponse(message: string, context?: TutorInput['context']): TutorResponse {
	const lower = message.toLowerCase();
	let response: string;

	if (context?.errors?.length) {
		response = `I can see you're hitting an error: \`${context.errors[0]}\`\n\n` +
			`**What do you think this error is telling you?** Understanding error messages is a superpower.`;
	} else if (lower.includes('$state') || lower.includes('reactive') || lower.includes('rune')) {
		response = `Great question about **Svelte 5 reactivity**! Runes like \`$state\` make reactivity explicit.\n\n` +
			`What happens when you change a variable that is **not** wrapped in \`$state()\`?`;
	} else if (lower.includes('$derived') || lower.includes('computed')) {
		response = `\`$derived\` is perfect for values **calculated from other state**.\n\n` +
			`It automatically tracks which \`$state\` values it reads. Can you identify a value in your code that depends on another?`;
	} else if (lower.includes('$effect') || lower.includes('effect')) {
		response = `\`$effect\` runs **after** the DOM updates — use it for side effects, not computed values.\n\n` +
			`When would you use \`$effect\` vs \`$derived\`? Think: *value* vs *action*.`;
	} else {
		response = context?.lessonTitle
			? `Great question about **${context.lessonTitle}**! Are you stuck on the **concept** or the **syntax**?`
			: `Let me help you think through this. Can you be more specific about what's confusing?`;
	}

	return { response, suggestions: generateSuggestions(context) };
}

function generateSuggestions(context?: TutorInput['context']): TutorSuggestion[] {
	const suggestions: TutorSuggestion[] = [];

	if (context?.errors?.length) {
		suggestions.push({ id: crypto.randomUUID(), label: 'Explain this error', prompt: `Explain: ${context.errors[0]}`, type: 'debug' });
	}
	if (context?.currentCode) {
		suggestions.push({ id: crypto.randomUUID(), label: 'Review my code', prompt: 'Review my code and suggest improvements', type: 'review' });
	}
	suggestions.push({ id: crypto.randomUUID(), label: 'Explain the concept', prompt: context?.lessonTitle ? `Explain ${context.lessonTitle}` : 'Explain this concept', type: 'explain' });

	return suggestions;
}
