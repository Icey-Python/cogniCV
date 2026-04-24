'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconMessageChatbot, IconX } from '@tabler/icons-react';
import { ChatInterface, type ChatMessage } from './chat-interface';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export function FloatingChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: '1',
			role: 'ai',
			content:
				"Hello! I'm your AI hiring assistant. I can help you analyze candidates, compare them against the job requirements, or answer any questions about this role. How can I help?"
		}
	]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSendMessage = (content: string) => {
		const newUserMsg: ChatMessage = {
			id: Date.now().toString(),
			role: 'user',
			content
		};
		setMessages((prev) => [...prev, newUserMsg]);
		setIsLoading(true);

		// Simulate AI response
		setTimeout(() => {
			const newAiMsg: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'ai',
				content:
					"I've noted your request. I am currently a simulated interface, but in the future, I will analyze the candidate profiles and provide detailed insights right here."
			};
			setMessages((prev) => [...prev, newAiMsg]);
			setIsLoading(false);
		}, 1500);
	};

	return (
		<>
			<div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="border-border mb-4 flex h-[550px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
						>
							<div className="bg-primary text-primary-foreground flex shrink-0 items-center justify-between px-4 py-3">
								<div className="flex items-center gap-2">
									<IconMessageChatbot className="size-5" />
									<span className="font-lora font-medium">AI Assistant</span>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 size-8 rounded-full"
									onClick={() => setIsOpen(false)}
								>
									<IconX className="size-4" />
								</Button>
							</div>
							<div className="relative flex-1 overflow-hidden">
								<ChatInterface
									messages={messages}
									onSendMessage={handleSendMessage}
									isLoading={isLoading}
									placeholder="Ask about applicants..."
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<Button
					size="icon"
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						'size-14 rounded-full shadow-lg transition-transform hover:scale-105',
						isOpen
							? 'bg-muted text-muted-foreground hover:bg-muted'
							: 'bg-primary text-primary-foreground'
					)}
				>
					{isOpen ? (
						<IconX className="size-6" />
					) : (
						<IconMessageChatbot className="size-6" />
					)}
				</Button>
			</div>
		</>
	);
}
