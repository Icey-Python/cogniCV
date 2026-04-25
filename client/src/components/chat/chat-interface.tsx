'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowRight, IconSparkles, IconUser } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

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

export function ChatInterface({ messages, onSendMessage, isLoading, placeholder = 'Type a message...' }: ChatInterfaceProps) {
	const [input, setInput] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

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
		<div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
			<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
				<div className="space-y-4 pb-4">
					{messages.length === 0 && (
						<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-20">
							<div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
								<IconSparkles className="size-6" />
							</div>
							<p className="text-sm">Start chatting with the AI assistant.</p>
						</div>
					)}
					{messages.map((msg) => (
						<div
							key={msg.id}
							className={cn(
								'flex gap-3 max-w-[85%]',
								msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto',
								msg.component ? 'w-full max-w-[95%]' : ''
							)}
						>
							<div
								className={cn(
									'size-8 rounded-full flex shrink-0 items-center justify-center',
									msg.role === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-primary/10 text-primary'
								)}
							>
								{msg.role === 'user' ? <IconUser className="size-5" /> : <IconSparkles className="size-5" />}
							</div>
							<div
								className={cn(
									'rounded-2xl px-4 py-2.5 text-sm flex flex-col',
									msg.role === 'user'
										? 'bg-primary text-primary-foreground rounded-tr-sm'
										: 'bg-muted text-foreground rounded-tl-sm',
									msg.component && msg.role === 'ai' ? 'min-w-[300px]' : ''
								)}
							>
								<p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
								{msg.component && (
									<div className="mt-3">
										{msg.component}
									</div>
								)}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex gap-3 max-w-[85%] mr-auto">
							<div className="size-8 rounded-full bg-primary/10 text-primary flex shrink-0 items-center justify-center">
								<IconSparkles className="size-5" />
							</div>
							<div className="rounded-2xl rounded-tl-sm px-4 py-2.5 bg-muted text-foreground flex items-center gap-1.5">
								<div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
								<div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
								<div className="size-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
							</div>
						</div>
					)}
				</div>
			</div>
			
			<div className="p-4 bg-white/50">
				<div className="relative flex items-end w-full transition-all">
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
						className="min-h-[56px] max-h-[200px] w-full resize-none border bg-transparent p-4 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed rounded-2xl"
						rows={1}
					/>
					<Button
						type="button"
						onClick={() => handleSubmit()}
						size="icon"
						disabled={!input.trim() || isLoading}
						className="absolute right-2 bottom-2 size-10 rounded-xl shrink-0 transition-opacity"
					>
						<IconArrowRight className="size-5" />
					</Button>
				</div>
				<div className="mt-2 text-center">
					<p className="text-[10px] text-muted-foreground/60">
						AI can make mistakes. Verify important information.
					</p>
				</div>
			</div>
		</div>
	);
}
