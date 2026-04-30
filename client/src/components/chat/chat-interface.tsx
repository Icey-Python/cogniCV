'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowRight, IconSparkles, IconUser } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '../ui/markdown';

const QUESTION_POOL = [
	"Who are the top 3 candidates for this role?",
	"Are there any candidates with missing requirements?",
	"Summarize the strongest candidate's experience.",
	"Compare the top two candidates.",
	"Who has the most relevant industry experience?",
	"List candidates with strong communication skills.",
	"Which candidate has the best technical skills?",
	"Find candidates who have leadership experience.",
	"What are the main weaknesses of the applicants?",
	"Are there any candidates with management background?",
	"Which candidate has the highest education level?",
	"Who would be the best fit for a senior position?"
];

export interface ChatMessage {
	id: string;
	role: 'user' | 'ai';
	content: string;
	component?: React.ReactNode;
	actionRequired?: 'location' | 'department';
	completed?: boolean;
}

interface ChatInterfaceProps {
	messages: ChatMessage[];
	onSendMessage: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
}

export function ChatInterface({
	messages,
	onSendMessage,
	isLoading,
	placeholder = 'Type a message...'
}: ChatInterfaceProps) {
	const [input, setInput] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [randomQuestions, setRandomQuestions] = useState<string[]>([]);

	useEffect(() => {
		const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
		setRandomQuestions(shuffled.slice(0, 3));
	}, []);

	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!input.trim() || isLoading) return;
		onSendMessage(input);
		setInput('');
		if (textareaRef.current) {
			textareaRef.current.style.height = '56px';
		}
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(e.target.value);
		if (textareaRef.current) {
			textareaRef.current.style.height = '56px';
			const scrollHeight = textareaRef.current.scrollHeight;
			textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
		}
	};

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-xl bg-white">
			<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
				<div className="space-y-4 pb-4">
					{messages.length === 0 && (
						<div className="text-muted-foreground mt-20 flex h-full flex-col items-center justify-center text-center">
							<div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
								<IconSparkles className="size-6" />
							</div>
							<p className="text-sm">Start chatting with the AI assistant.</p>
						</div>
					)}
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={cn(
								'flex max-w-[85%] gap-3',
								msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
								msg.component ? 'w-full max-w-[95%]' : ''
							)}
						>
							<div
								className={cn(
									'flex size-8 shrink-0 items-center justify-center rounded-full',
									msg.role === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-primary/10 text-primary'
								)}
							>
								{msg.role === 'user' ? (
									<IconUser className="size-5" />
								) : (
									<IconSparkles className="size-5" />
								)}
							</div>
							<div
								className={cn(
									'flex flex-col rounded-2xl px-4 py-2.5 text-sm',
									msg.role === 'user'
										? 'bg-primary text-primary-foreground rounded-tr-sm'
										: 'bg-muted text-foreground rounded-tl-sm',
									msg.component && msg.role === 'ai' ? 'min-w-[300px]' : ''
								)}
							>
								<MarkdownRenderer content={msg.content} />
								{msg.component && <div className="mt-3">{msg.component}</div>}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="mr-auto flex max-w-[85%] gap-3">
							<div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
								<IconSparkles className="size-5" />
							</div>
							<div className="bg-muted text-foreground flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-2.5">
								<div
									className="bg-primary/60 size-1.5 animate-bounce rounded-full"
									style={{ animationDelay: '0ms' }}
								/>
								<div
									className="bg-primary/60 size-1.5 animate-bounce rounded-full"
									style={{ animationDelay: '150ms' }}
								/>
								<div
									className="bg-primary/60 size-1.5 animate-bounce rounded-full"
									style={{ animationDelay: '300ms' }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="bg-white/50 p-4">
				{messages.filter((m) => m.role === 'user').length === 0 && randomQuestions.length > 0 && (
					<div className="mb-3 flex flex-wrap gap-2">
						{randomQuestions.map((q, i) => (
							<button
								key={i}
								onClick={() => {
									setInput(q);
									if (textareaRef.current) {
										textareaRef.current.focus();
									}
								}}
								className="text-muted-foreground hover:text-foreground hover:bg-muted/80 border-muted-foreground/20 rounded-full border bg-transparent px-3 py-1.5 text-xs transition-colors"
							>
								{q}
							</button>
						))}
					</div>
				)}
				<div className="relative flex w-full items-end transition-all">
					<Textarea
						ref={textareaRef}
						value={input}
						onChange={handleInput}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								handleSubmit();
							}
						}}
						placeholder={placeholder}
						disabled={isLoading}
						className="max-h-[200px] min-h-[56px] w-full resize-none rounded-2xl border bg-transparent p-4 pr-14 leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
						rows={1}
					/>
					<Button
						type="button"
						onClick={() => handleSubmit()}
						size="icon"
						disabled={!input.trim() || isLoading}
						className="absolute right-2 bottom-2 size-10 shrink-0 rounded-xl transition-opacity"
					>
						<IconArrowRight className="size-5" />
					</Button>
				</div>
				<div className="mt-2 text-center">
					<p className="text-muted-foreground/60 text-[10px]">
						AI can make mistakes. Verify important information.
					</p>
				</div>
			</div>
		</div>
	);
}
