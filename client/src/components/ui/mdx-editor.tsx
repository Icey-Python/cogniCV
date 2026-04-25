'use client';

import {
	MDXEditor,
	headingsPlugin,
	quotePlugin,
	listsPlugin,
	markdownShortcutPlugin,
	linkPlugin,
	linkDialogPlugin,
	MDXEditorMethods,
	toolbarPlugin,
	UndoRedo,
	BoldItalicUnderlineToggles,
	ListsToggle,
	BlockTypeSelect,
	CreateLink
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
			<div className="border-input bg-background w-full max-w-full rounded-md border">
				<MDXEditor
					ref={ref}
					markdown={markdown}
					onChange={onChange}
					placeholder={placeholder}
					contentEditableClassName="prose prose-sm max-w-none min-h-[200px] px-3 py-2 text-sm focus:outline-none"
					plugins={[
						headingsPlugin(),
						quotePlugin(),
						listsPlugin(),
						markdownShortcutPlugin(),
						linkPlugin(),
						linkDialogPlugin(),
						toolbarPlugin({
							toolbarContents: () => (
								<div className="flex flex-wrap items-center gap-1 border-b p-1">
									<UndoRedo />
									<BoldItalicUnderlineToggles />
									<BlockTypeSelect />
									<ListsToggle />
									<CreateLink />
								</div>
							)
						})
					]}
				/>
			</div>
		);
	}
);

MdxEditor.displayName = 'MdxEditor';

export default MdxEditor;
