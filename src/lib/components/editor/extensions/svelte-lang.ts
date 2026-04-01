import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import type { LanguageSupport } from '@codemirror/language';

/**
 * Returns CodeMirror language support for .svelte files.
 * Uses HTML as the base since Svelte is an HTML superset,
 * with nested JavaScript support for <script> blocks
 * and CSS support for <style> blocks.
 */
export function svelteLang(): LanguageSupport {
	return html({
		matchClosingTags: true,
		selfClosingTags: true,
		nestedLanguages: [
			{
				tag: 'script',
				attrs: (attrs) => {
					// Support both default and lang="ts" script blocks
					const lang = attrs['lang'];
					return !lang || lang === 'ts' || lang === 'typescript';
				},
				parser: javascript({ typescript: true, jsx: false }).language.parser
			},
			{
				tag: 'style',
				parser: css().language.parser
			}
		]
	});
}
