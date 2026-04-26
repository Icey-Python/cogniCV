'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	IconMessageChatbot,
	IconX,
	IconLoader2,
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconArrowLeft,
	IconPlus,
	IconTrash,
	IconHistory
} from '@tabler/icons-react';
import { ChatInterface, type ChatMessage } from './chat-interface';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { apiBase } from '@/lib/config';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	updatedAt: number;
}

interface FloatingChatProps {
	jobId: string;
	enabled?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_SESSIONS = 10;
const STORAGE_KEY_PREFIX = 'cognicv_chats_';

export function FloatingChat({ jobId, enabled = false }: FloatingChatProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [view, setView] = useState<'list' | 'chat'>('list');
	const [isIndexReady, setIsIndexReady] = useState(false);
	const [isCheckingIndex, setIsCheckingIndex] = useState(false);
	const [indexingState, setIndexingState] = useState<
		'idle' | 'checking' | 'triggering' | 'building' | 'error' | 'no_screening'
	>('idle');
	const [isLoading, setIsLoading] = useState(false);

	// Sessions state
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

	const storageKey = `${STORAGE_KEY_PREFIX}${jobId}`;

	// Load sessions on mount
	useEffect(() => {
		const saved = localStorage.getItem(storageKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setSessions(parsed);
			} catch (e) {
				console.error('Failed to parse chat sessions', e);
			}
		}
	}, [storageKey]);

	// Save sessions whenever they change
	useEffect(() => {
		if (sessions.length > 0) {
			localStorage.setItem(storageKey, JSON.stringify(sessions));
		} else {
			localStorage.removeItem(storageKey);
		}
	}, [sessions, storageKey]);

	const activeSession = useMemo(
		() => sessions.find((s) => s.id === activeSessionId) || null,
		[sessions, activeSessionId]
	);

	const messages = useMemo(
		() => activeSession?.messages || [],
		[activeSession]
	);

	// ─── Handlers ──────────────────────────────────────────────────────────────

	const handleCreateNewChat = useCallback(() => {
		const newSession: ChatSession = {
			id: Date.now().toString(),
			title: 'New Conversation',
			messages: [
				{
					id: '1',
					role: 'ai',
					content:
						"Hello! I'm your AI hiring assistant. I can help you analyze candidates, compare them against the job requirements, or answer any questions about this screening. How can I help?"
				}
			],
			updatedAt: Date.now()
		};

		setSessions((prev) => {
			const updated = [newSession, ...prev];
			return updated.slice(0, MAX_SESSIONS); // Enforce max 10
		});
		setActiveSessionId(newSession.id);
		setView('chat');
	}, []);

	const handleSelectSession = (id: string) => {
		setActiveSessionId(id);
		setView('chat');
	};

	const handleDeleteSession = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		setSessions((prev) => prev.filter((s) => s.id !== id));
		if (activeSessionId === id) {
			setActiveSessionId(null);
			setView('list');
		}
	};

	const updateActiveSessionMessages = useCallback(
		(newMessages: ChatMessage[]) => {
			setSessions((prev) =>
				prev.map((s) => {
					if (s.id === activeSessionId) {
						// Update title if it's the first user message
						let title = s.title;
						const firstUserMsg = newMessages.find((m) => m.role === 'user');
						if (title === 'New Conversation' && firstUserMsg) {
							title =
								firstUserMsg.content.slice(0, 40) +
								(firstUserMsg.content.length > 40 ? '...' : '');
						}

						return {
							...s,
							messages: newMessages,
							title,
							updatedAt: Date.now()
						};
					}
					return s;
				})
			);
		},
		[activeSessionId]
	);

	// ─── API Interaction ─────────────────────────────────────────────────────────

	// Ref to track indexing state for polling speed without causing effect re-runs
	const indexingStateRef = useRef(indexingState);
	useEffect(() => {
		indexingStateRef.current = indexingState;
	}, [indexingState]);

	// Guard to prevent duplicate trigger calls
	const hasTriggeredRef = useRef(false);

	// Trigger embedding generation on-demand
	const triggerIndexing = useCallback(async () => {
		if (hasTriggeredRef.current) return;
		hasTriggeredRef.current = true;
		setIndexingState('triggering');
		try {
			const res = await apiBase.post(
				`/chat/job-analysis/${jobId}/trigger-indexing`
			);
			const data = res.data?.data;

			if (data?.triggered) {
				setIndexingState('building');
			} else if (data?.reason === 'already_indexed') {
				setIsIndexReady(true);
				setIndexingState('idle');
			} else if (data?.reason === 'no_screening') {
				setIndexingState('no_screening');
			} else {
				setIndexingState('error');
				hasTriggeredRef.current = false; // Allow retry
			}
		} catch {
			setIndexingState('error');
			hasTriggeredRef.current = false; // Allow retry
		}
	}, [jobId]);

	// Poll for index status — only re-runs when chat open/close state or readiness changes
	useEffect(() => {
		if (!enabled || (!isOpen && !isExpanded)) return;
		if (isIndexReady) return;

		let cancelled = false;

		const checkStatus = async () => {
			if (cancelled) return;
			setIsCheckingIndex(true);
			try {
				const res = await apiBase.get(`/chat/job-analysis/${jobId}/status`);
				if (cancelled) return;
				const ready = res.data?.data?.ready === true;
				setIsIndexReady(ready);

				if (ready) {
					setIndexingState('idle');
				}
			} catch {
				if (!cancelled) setIsIndexReady(false);
			} finally {
				if (!cancelled) setIsCheckingIndex(false);
			}
		};

		// Initial check
		checkStatus().then(() => {
			if (cancelled) return;
			// After initial check, auto-trigger if not ready
			if (!hasTriggeredRef.current) {
				triggerIndexing();
			}
		});

		// Polling interval — read poll speed from ref so we don't need indexingState as dep
		const interval = setInterval(() => {
			const state = indexingStateRef.current;
			if (state === 'building' || state === 'triggering') {
				checkStatus();
			}
			// Don't poll when in error/no_screening/idle states
		}, 3000);

		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [enabled, isOpen, isExpanded, jobId, isIndexReady, triggerIndexing]);

	const handleSendMessage = useCallback(
		async (content: string) => {
			if (!activeSessionId) return;

			const newUserMsg: ChatMessage = {
				id: Date.now().toString(),
				role: 'user',
				content
			};

			const currentMessages = [...messages, newUserMsg];
			updateActiveSessionMessages(currentMessages);
			setIsLoading(true);

			try {
				const history = currentMessages
					.filter((m) => m.id !== '1')
					.map((m) => ({
						role: m.role === 'ai' ? 'assistant' : 'user',
						content: m.content
					}));

				const res = await apiBase.post('/chat/job-analysis', {
					jobId,
					question: content,
					history
				});

				const answer =
					res.data?.data?.answer ||
					"I wasn't able to generate an answer. Please try again.";

				const newAiMsg: ChatMessage = {
					id: (Date.now() + 1).toString(),
					role: 'ai',
					content: answer
				};
				updateActiveSessionMessages([...currentMessages, newAiMsg]);
			} catch {
				const errorMsg: ChatMessage = {
					id: (Date.now() + 1).toString(),
					role: 'ai',
					content:
						'Sorry, I encountered an error while processing your question. Please try again.'
				};
				updateActiveSessionMessages([...currentMessages, errorMsg]);
			} finally {
				setIsLoading(false);
			}
		},
		[jobId, activeSessionId, messages, updateActiveSessionMessages]
	);

	// ─── Components ──────────────────────────────────────────────────────────────

	const IndexNotReadyContent = useMemo(() => {
		if (indexingState === 'no_screening') {
			return (
				<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
					<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-slate-100">
						<IconMessageChatbot className="size-6 text-slate-400" />
					</div>
					<p className="text-sm font-medium text-slate-700">
						Analysis Required
					</p>
					<p className="text-muted-foreground mt-2 max-w-[260px] text-xs">
						Run the AI screening first to analyze candidates. The chat
						will become available once analysis is complete.
					</p>
				</div>
			);
		}

		if (indexingState === 'error') {
			return (
				<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
					<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
						<IconX className="size-6 text-red-500" />
					</div>
					<p className="text-sm font-medium text-slate-700">
						Failed to Initialize
					</p>
					<p className="text-muted-foreground mt-2 max-w-[260px] text-xs">
						Something went wrong while preparing the knowledge base.
					</p>
					<Button
						size="sm"
						variant="outline"
						className="mt-4 gap-2"
						onClick={triggerIndexing}
					>
						<IconLoader2 className="size-3.5" />
						Retry
					</Button>
				</div>
			);
		}

		// Default: checking / triggering / building states
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
				<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100">
					<IconLoader2 className="size-6 animate-spin text-amber-600" />
				</div>
				<p className="text-sm font-medium text-slate-700">
					{indexingState === 'checking'
						? 'Checking Knowledge Base...'
						: 'Preparing Knowledge Base'}
				</p>
				<p className="text-muted-foreground mt-2 max-w-[260px] text-xs">
					{indexingState === 'checking'
						? 'Verifying if the analysis data is ready for chat...'
						: 'Indexing your screening results for intelligent Q&A. This usually takes a few seconds...'}
				</p>
				{(indexingState === 'building' || indexingState === 'triggering') && (
					<div className="mt-4 flex items-center gap-2">
						<div className="h-1 w-24 overflow-hidden rounded-full bg-amber-100">
							<div className="h-full animate-pulse rounded-full bg-amber-500 transition-all" style={{ width: '60%' }} />
						</div>
					</div>
				)}
			</div>
		);
	}, [indexingState, triggerIndexing]);

	const ChatContent = (
		<div className="flex h-full flex-col overflow-hidden bg-white">
			{/* Header */}
			<div className="bg-primary text-primary-foreground flex shrink-0 items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2">
					{view === 'chat' && (
						<Button
							variant="ghost"
							size="icon"
							className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 mr-1 size-8 rounded-full"
							onClick={() => setView('list')}
						>
							<IconArrowLeft className="size-4" />
						</Button>
					)}
					<IconMessageChatbot className="size-5" />
					<div className="flex flex-col">
						<span className="font-lora text-sm leading-none font-medium">
							{view === 'list' ? 'Chat History' : 'AI Assistant'}
						</span>
						{isCheckingIndex && (
							<span className="mt-1 flex items-center gap-1 text-[10px] opacity-70">
								<IconLoader2 className="size-2 animate-spin" />
								Indexing...
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-1">
					{!isExpanded ? (
						<Button
							variant="ghost"
							size="icon"
							className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 size-8 rounded-full"
							onClick={() => {
								setIsExpanded(true);
								setIsOpen(false);
							}}
						>
							<IconArrowsMaximize className="size-4" />
						</Button>
					) : (
						<Button
							variant="ghost"
							size="icon"
							className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 size-8 rounded-full"
							onClick={() => {
								setIsExpanded(false);
								setIsOpen(true);
							}}
						>
							<IconArrowsMinimize className="size-4" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 size-8 rounded-full"
						onClick={() => {
							setIsOpen(false);
							setIsExpanded(false);
						}}
					>
						<IconX className="size-4" />
					</Button>
				</div>
			</div>

			{/* Main Area */}
			{!isIndexReady ? (
				IndexNotReadyContent
			) : view === 'list' ? (
				<div className="flex flex-1 flex-col overflow-hidden bg-slate-50/50">
					<div className="shrink-0 p-4">
						<Button
							className="w-full gap-2 rounded-xl shadow-sm"
							onClick={handleCreateNewChat}
						>
							<IconPlus className="size-4" />
							New Conversation
						</Button>
					</div>
					<ScrollArea className="flex-1 px-4 pb-4">
						<div className="space-y-2">
							{sessions.length === 0 ? (
								<div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
									<div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-100">
										<IconHistory className="size-5" />
									</div>
									<p className="text-xs">No recent chats</p>
								</div>
							) : (
								sessions.map((session) => (
									<div
										key={session.id}
										onClick={() => handleSelectSession(session.id)}
										className={cn(
											'group hover:border-primary/30 relative flex cursor-pointer flex-col gap-1 rounded-xl border bg-white p-3 transition-all hover:shadow-sm',
											activeSessionId === session.id
												? 'border-primary/50 ring-primary/20 ring-1'
												: 'border-border'
										)}
									>
										<div className="flex items-start justify-between gap-2">
											<span className="line-clamp-1 text-sm font-medium text-slate-700">
												{session.title}
											</span>
											<Button
												variant="ghost"
												size="icon"
												className="size-6 shrink-0 rounded-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
												onClick={(e) => handleDeleteSession(e, session.id)}
											>
												<IconTrash className="size-3.5" />
											</Button>
										</div>
										<div className="text-muted-foreground flex items-center justify-between text-[10px]">
											<span>{session.messages.length} messages</span>
											<span>
												{formatDistanceToNow(session.updatedAt, {
													addSuffix: true
												})}
											</span>
										</div>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			) : (
				<div className="relative flex-1 overflow-hidden">
					<ChatInterface
						messages={messages}
						onSendMessage={handleSendMessage}
						isLoading={isLoading}
						placeholder="Ask about applicants..."
					/>
				</div>
			)}
		</div>
	);

	if (!enabled) return null;

	return (
		<>
			{/* Floating Popover View */}
			<div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="border-border mb-4 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
						>
							{ChatContent}
						</motion.div>
					)}
				</AnimatePresence>

				{!isExpanded && (
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
				)}
			</div>

			{/* Expanded Sheet View */}
			<Sheet open={isExpanded} onOpenChange={setIsExpanded}>
				<SheetContent
					side="right"
					hideClose={true}
					className="flex w-full flex-col border-gray-900 p-0 sm:max-w-md md:max-w-lg"
				>
					<div className="flex h-full flex-col">{ChatContent}</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
