'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	ChatInterface,
	type ChatMessage
} from '@/components/chat/chat-interface';
import { IconArrowLeft, IconSparkles, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

export default function AiJobCreationPage() {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: '1',
			role: 'ai',
			content:
				'Hi! I can help you create a new job posting quickly. What kind of role are you looking to fill? You can just tell me the title and a brief overview of what the person will do.'
		}
	]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	const handleSendMessage = (content: string) => {
		const newUserMsg: ChatMessage = {
			id: Date.now().toString(),
			role: 'user',
			content
		};
		setMessages((prev) => [...prev, newUserMsg]);
		setIsLoading(true);

		// Simulate AI conversation flow
		setTimeout(() => {
			let aiResponse = '';
			let finish = false;

			if (messages.length === 1) {
				aiResponse =
					"Great! I've noted the role and responsibilities. What are the key skills and experience level required? Also, where is this role located?";
			} else if (messages.length === 3) {
				aiResponse =
					'Got it. I have enough information to generate the complete job description, requirements, and AI focus areas. Shall I go ahead and create the job draft for you?';
			} else {
				aiResponse =
					"Excellent. I've generated the job. Redirecting you to the completed job draft...";
				finish = true;
			}

			const newAiMsg: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'ai',
				content: aiResponse
			};
			setMessages((prev) => [...prev, newAiMsg]);
			setIsLoading(false);

			if (finish) {
				setIsFinished(true);
				setTimeout(() => {
					// Redirect to the jobs list or the created job
					router.push('/dashboard/jobs');
				}, 2000);
			}
		}, 1500);
	};

	return (
		<div className="flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
			<div className="mb-6 flex shrink-0 items-center justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-semibold">
						<IconSparkles className="text-primary size-6" /> AI Job Creation
					</h1>
					<p className="text-muted-foreground mt-1">
						Answer a few questions to generate the perfect job listing.
					</p>
				</div>
				{isFinished && (
					<div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 font-medium text-green-600">
						<IconCheck className="size-5" /> Job Draft Created
					</div>
				)}
			</div>

			<div className="border-border min-h-0 flex-1 overflow-hidden rounded-xl border bg-white shadow-sm">
				<ChatInterface
					messages={messages}
					onSendMessage={handleSendMessage}
					isLoading={isLoading}
					placeholder={
						isFinished ? 'Job created successfully...' : 'Type your answer...'
					}
				/>
			</div>
		</div>
	);
}
