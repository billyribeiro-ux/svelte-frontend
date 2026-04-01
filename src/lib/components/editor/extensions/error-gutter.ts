import { gutter, GutterMarker, type EditorView } from '@codemirror/view';
import { StateField, StateEffect, RangeSet, type Extension } from '@codemirror/state';
import type { CompileError } from '$types/editor';

class ErrorMarker extends GutterMarker {
	readonly message: string;

	constructor(message: string) {
		super();
		this.message = message;
	}

	toDOM(): HTMLElement {
		const marker = document.createElement('span');
		marker.className = 'cm-error-marker';
		marker.textContent = '\u25CF'; // Filled circle
		marker.title = this.message;
		marker.style.cssText = 'color: var(--sf-error, #e06c75); cursor: pointer; font-size: 10px;';
		return marker;
	}
}

const setErrorsEffect = StateEffect.define<CompileError[]>();

interface ErrorLine {
	line: number;
	message: string;
}

const errorState = StateField.define<ErrorLine[]>({
	create() {
		return [];
	},
	update(value, tr) {
		for (const effect of tr.effects) {
			if (effect.is(setErrorsEffect)) {
				return effect.value
					.filter((e) => e.start?.line != null)
					.map((e) => ({
						line: e.start!.line,
						message: e.message
					}));
			}
		}
		return value;
	}
});

const errorGutter = gutter({
	class: 'cm-error-gutter',
	markers(view) {
		const errors = view.state.field(errorState);
		const ranges: { from: number; marker: ErrorMarker }[] = [];

		for (const error of errors) {
			if (error.line >= 1 && error.line <= view.state.doc.lines) {
				const lineInfo = view.state.doc.line(error.line);
				ranges.push({
					from: lineInfo.from,
					marker: new ErrorMarker(error.message)
				});
			}
		}

		// Sort by position (required by RangeSet)
		ranges.sort((a, b) => a.from - b.from);

		return RangeSet.of(
			ranges.map((r) => r.marker.range(r.from))
		);
	}
});

/**
 * Creates a CodeMirror extension that shows error markers in the gutter.
 * Returns both the extension and a function to update the errors.
 */
export function createErrorGutter(): {
	extension: Extension;
	setErrors: (view: EditorView, errors: CompileError[]) => void;
} {
	return {
		extension: [errorState, errorGutter],
		setErrors(view: EditorView, errors: CompileError[]) {
			view.dispatch({
				effects: setErrorsEffect.of(errors)
			});
		}
	};
}
