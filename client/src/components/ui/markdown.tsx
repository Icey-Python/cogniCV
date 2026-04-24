import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type TMarkdownRendererProps = {
	content: string;
	className?: string;
};

export default function MarkdownRenderer({ content }: TMarkdownRendererProps) {
	return (
		<ReactMarkdown
			components={{
				h1: ({ node, ...props }) => (
					<h1 className="mb-4 text-3xl font-semibold" {...props} />
				),
				h2: ({ node, ...props }) => (
					<h2 className="mb-4 text-2xl font-semibold" {...props} />
				),
				h3: ({ node, ...props }) => (
					<h3 className="mb-4 text-xl font-semibold" {...props} />
				),
				h4: ({ node, ...props }) => (
					<h4 className="mb-4 text-lg font-semibold" {...props} />
				),
				p: ({ node, ...props }) => (
					<p className="mb-2 leading-relaxed" {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className="text-blue-500 hover:text-blue-600 hover:underline"
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					/>
				),
				code: ({ className, children, ...props }) => {
					const match = /language-(\w+)/.exec(className || '');
					return match ? (
						<SyntaxHighlighter language={match[1]} style={tomorrow}>
							{String(children).replace(/\n$/, '')}
						</SyntaxHighlighter>
					) : (
						<code className={className} {...props}>
							{children}
						</code>
					);
				}
			}}
			remarkPlugins={[remarkGfm]}
		>
			{content}
		</ReactMarkdown>
	);
}
