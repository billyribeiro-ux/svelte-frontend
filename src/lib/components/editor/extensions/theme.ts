import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export const svelteForgeTheme = EditorView.theme(
	{
		'&': {
			backgroundColor: 'var(--sf-editor-bg)',
			color: 'var(--sf-editor-fg, #d4d4d4)',
			height: '100%'
		},
		'.cm-content': {
			caretColor: 'var(--sf-editor-cursor)',
			fontFamily: 'var(--sf-font-mono, "Fira Code", monospace)',
			fontSize: 'var(--sf-font-size-code, 14px)',
			lineHeight: 'var(--sf-line-height-code, 1.6)',
			padding: '4px 0'
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: 'var(--sf-editor-cursor)'
		},
		'.cm-gutters': {
			backgroundColor: 'var(--sf-editor-gutter)',
			color: 'var(--sf-editor-gutter-fg, #858585)',
			border: 'none',
			paddingRight: '4px'
		},
		'.cm-activeLineGutter': {
			backgroundColor: 'var(--sf-editor-line-active)',
			color: 'var(--sf-editor-fg, #d4d4d4)'
		},
		'.cm-activeLine': {
			backgroundColor: 'var(--sf-editor-line-active)'
		},
		'&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
			backgroundColor: 'var(--sf-editor-selection)'
		},
		'.cm-selectionMatch': {
			backgroundColor: 'var(--sf-editor-selection-match, rgba(255,255,255,0.1))'
		},
		'.cm-matchingBracket': {
			backgroundColor: 'var(--sf-editor-bracket-match, rgba(255,255,255,0.15))',
			outline: '1px solid var(--sf-editor-bracket-match-border, rgba(255,255,255,0.3))'
		},
		'.cm-searchMatch': {
			backgroundColor: 'var(--sf-editor-search-match, rgba(255,199,0,0.3))'
		},
		'.cm-foldPlaceholder': {
			backgroundColor: 'transparent',
			border: 'none',
			color: 'var(--sf-editor-gutter-fg, #858585)'
		},
		'.cm-tooltip': {
			backgroundColor: 'var(--sf-editor-bg)',
			border: '1px solid var(--sf-border, #333)',
			borderRadius: 'var(--sf-radius-sm, 4px)'
		},
		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				backgroundColor: 'var(--sf-editor-selection)'
			}
		}
	},
	{ dark: true }
);

export const svelteForgeHighlighting = syntaxHighlighting(
	HighlightStyle.define([
		{ tag: tags.keyword, color: 'var(--sf-syntax-keyword, #c678dd)' },
		{ tag: tags.operator, color: 'var(--sf-syntax-operator, #56b6c2)' },
		{ tag: tags.special(tags.variableName), color: 'var(--sf-syntax-variable-special, #e06c75)' },
		{ tag: tags.variableName, color: 'var(--sf-syntax-variable, #e5c07b)' },
		{ tag: tags.function(tags.variableName), color: 'var(--sf-syntax-function, #61afef)' },
		{ tag: tags.definition(tags.variableName), color: 'var(--sf-syntax-definition, #e5c07b)' },
		{ tag: tags.typeName, color: 'var(--sf-syntax-type, #e5c07b)' },
		{ tag: tags.tagName, color: 'var(--sf-syntax-tag, #e06c75)' },
		{ tag: tags.attributeName, color: 'var(--sf-syntax-attribute, #d19a66)' },
		{ tag: tags.attributeValue, color: 'var(--sf-syntax-string, #98c379)' },
		{ tag: tags.string, color: 'var(--sf-syntax-string, #98c379)' },
		{ tag: tags.number, color: 'var(--sf-syntax-number, #d19a66)' },
		{ tag: tags.bool, color: 'var(--sf-syntax-boolean, #d19a66)' },
		{ tag: tags.null, color: 'var(--sf-syntax-null, #d19a66)' },
		{ tag: tags.regexp, color: 'var(--sf-syntax-regexp, #98c379)' },
		{ tag: tags.comment, color: 'var(--sf-syntax-comment, #5c6370)', fontStyle: 'italic' },
		{ tag: tags.meta, color: 'var(--sf-syntax-meta, #abb2bf)' },
		{ tag: tags.propertyName, color: 'var(--sf-syntax-property, #e06c75)' },
		{ tag: tags.punctuation, color: 'var(--sf-syntax-punctuation, #abb2bf)' }
	])
);

export const themeExtensions = [svelteForgeTheme, svelteForgeHighlighting];
