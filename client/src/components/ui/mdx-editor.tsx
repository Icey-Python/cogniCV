'use client';

import {
	MDXEditor,
	headingsPlugin,
	quotePlugin,
	listsPlugin,
	markdownShortcutPlugin,
	linkPlugin,
	linkDialogPlugin,
	MDXEditorMethods
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { forwardRef } from 'react';

interface MdxEditorProps {
	markdown: string;
	onChange: (markdown: string) => void;
	placeholder?: string;
}

export const MdxEditor = forwardRef<MDXEditorMethods, MdxEditorProps>(
	({ markdown, onChange, placeholder }, ref) => {
		return (
			<div className="prose border-input bg-background w-full max-w-full rounded-md border">
				<MDXEditor
					ref={ref}
					markdown={markdown}
					onChange={onChange}
					contentEditableClassName="min-h-[200px] px-3 py-2 text-sm"
					plugins={[
						headingsPlugin(),
						quotePlugin(),
						listsPlugin(),
						markdownShortcutPlugin(),
						linkPlugin(),
						linkDialogPlugin()
					]}
				/>
			</div>
		);
	}
);

MdxEditor.displayName = 'MdxEditor';

export default MdxEditor;
