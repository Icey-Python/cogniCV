'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSend, IconSparkles, IconUser } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ChatMessage {
	id: string;
	role: 'user' | 'ai';
	content: string;
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		onSendMessage(input);
		setInput('');
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	return (
		<div className="flex flex-col h-full bg-white rounded-xl border border-border overflow-hidden">
			<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
				<div className="space-y-4">
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
								msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
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
									'rounded-2xl px-4 py-2.5 text-sm',
									msg.role === 'user'
										? 'bg-primary text-primary-foreground rounded-tr-sm'
										: 'bg-muted text-foreground rounded-tl-sm'
								)}
							>
								<p className="whitespace-pre-wrap">{msg.content}</p>
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
			
			<div className="p-3 border-t bg-muted/20">
				<form onSubmit={handleSubmit} className="relative flex items-center">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={placeholder}
						disabled={isLoading}
						className="pr-12 py-6 rounded-full bg-background border-border shadow-sm focus-visible:ring-primary/20"
					/>
					<Button
						type="submit"
						size="icon"
						disabled={!input.trim() || isLoading}
						className="absolute right-1.5 size-9 rounded-full"
					>
						<IconSend className="size-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
