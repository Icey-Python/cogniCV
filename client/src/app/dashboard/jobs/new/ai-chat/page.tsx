'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	ChatInterface,
	type ChatMessage
} from '@/components/chat/chat-interface';
import { IconSparkles, IconCheck, IconPlus, IconBuilding, IconMapPin, IconClock, IconBriefcase, IconX, IconArrowRight, IconUser, IconTrash, IconFileText, IconLoader2 } from '@tabler/icons-react';
import { apiBase } from '@/lib/config';
import { JobCard } from '@/components/jobs/job-card';
import { Job, JobStatus, JobSource, ExperienceLevel, JobType } from '@/hooks/query/jobs/service';
import { useOrganizationQuery } from '@/hooks/query/organization/queries';
import { useCreateJobMutation } from '@/hooks/query/jobs/mutations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import MarkdownRenderer from '@/components/ui/markdown';

const STORAGE_KEY = 'ai-job-creation-chat';

type ActionType = 'location' | 'department' | 'employmentType' | 'workspaceType' | 'experienceLevel';

const EMPLOYMENT_TYPES = [
	{ _id: 'Full-time', name: 'Full-time' },
	{ _id: 'Part-time', name: 'Part-time' },
	{ _id: 'Contract', name: 'Contract' },
];

const WORKSPACE_TYPES = [
	{ _id: 'Remote', name: 'Remote' },
	{ _id: 'Hybrid', name: 'Hybrid' },
	{ _id: 'On-site', name: 'On-site' },
];

const EXPERIENCE_LEVELS = [
	{ _id: 'Entry', name: 'Entry' },
	{ _id: 'Junior', name: 'Junior' },
	{ _id: 'Mid', name: 'Mid' },
	{ _id: 'Senior', name: 'Senior' },
	{ _id: 'Lead', name: 'Lead' },
];

function InlineSelector({ 
    type, 
    items, 
    onSelect 
}: { 
    type: ActionType, 
    items: any[], 
    onSelect: (id: string) => void 
}) {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	if (items.length === 0) {
		return (
			<div className="p-4 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/5 text-destructive text-sm text-center mt-3">
				<IconX className="size-5 mx-auto mb-2 opacity-50" />
				<p>No {type}s configured.</p>
                <p className="opacity-80">Please add them in your organization settings first.</p>
			</div>
		);
	}

	let title = type as string;
	if (type === 'employmentType') title = 'Employment Type';
	if (type === 'workspaceType') title = 'Workspace Type';
	if (type === 'experienceLevel') title = 'Experience Level';

	return (
		<div className="mt-3 bg-white border rounded-xl overflow-hidden text-left">
			<div className="p-3 border-b bg-muted/30">
				<p className="font-medium text-sm text-foreground">Select {title}:</p>
			</div>
			<div className="max-h-[250px] overflow-y-auto p-2 space-y-2">
				{items.map((item: any) => (
					<div
						key={item._id}
						onClick={() => setSelectedId(item._id)}
						className={cn(
							"flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all",
							selectedId === item._id 
								? "border-primary bg-primary/5" 
								: "border-border hover:border-primary/40"
						)}
					>
						<div className="flex items-center gap-3">
							<div className={cn(
								"size-8 rounded-md flex items-center justify-center shrink-0",
								selectedId === item._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
							)}>
								{type === 'location' ? <IconMapPin className="size-4" /> : 
								 type === 'department' ? <IconBuilding className="size-4" /> :
								 type === 'experienceLevel' ? <IconBriefcase className="size-4" /> :
								 <IconClock className="size-4" />}
							</div>
							<div>
								<p className="text-sm font-semibold text-foreground">
									{type === 'location' ? `${item.city}, ${item.country}` : item.name}
								</p>
								{type === 'location' && (
									<p className="text-xs text-muted-foreground">
										{item.workspaceType}
									</p>
								)}
								{type === 'department' && (
									<p className="text-xs text-muted-foreground">Internal Department</p>
								)}
							</div>
						</div>
						<div className={cn(
							"size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
							selectedId === item._id ? "border-primary bg-primary" : "border-muted-foreground/30"
						)}>
							{selectedId === item._id && <div className="size-1.5 rounded-full bg-white" />}
						</div>
					</div>
				))}
			</div>
			<div className="p-2 border-t bg-muted/10">
				<Button 
                    size="sm"
					className="w-full" 
					disabled={!selectedId} 
					onClick={() => onSelect(selectedId!)}
				>
					Confirm Selection
				</Button>
			</div>
		</div>
	);
}

export default function AiJobCreationPage() {
	const router = useRouter();
	const { data: orgData } = useOrganizationQuery();
	const createJobMutation = useCreateJobMutation();
	
	const dbDepartments = orgData?.data?.departments || [];
	const dbLocations = orgData?.data?.locations || [];

	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFinished, setIsFinished] = useState(false);
	const [draftJob, setDraftJob] = useState<Partial<Job & { departmentId?: string }>>({});

	// Load messages from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setMessages(parsed);
			} catch (e) {
				console.error('Failed to parse saved chat', e);
			}
		} else {
			setMessages([
				{
					id: '1',
					role: 'ai',
					content:
						'Hi! I can help you create a new job posting quickly. What kind of role are you looking to fill? You can just tell me the title and a brief overview of what the person will do.'
				}
			]);
		}
	}, []);

	// Save messages to localStorage
	useEffect(() => {
		if (messages.length > 0) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
		}
	}, [messages]);

	const handleSendMessage = async (content: string) => {
		const newUserMsg: ChatMessage = {
			id: Date.now().toString(),
			role: 'user',
			content
		};
		
		const updatedMessages = [...messages, newUserMsg];
		setMessages(updatedMessages);
		setIsLoading(true);

		try {
			const apiMessages = updatedMessages.map(m => ({
				role: m.role === 'ai' ? 'assistant' : 'user',
				content: m.content
			}));

			const response = await apiBase.post('/chat/job-creation', {
				messages: apiMessages,
				availableLocations: dbLocations,
				availableDepartments: dbDepartments
			});

			console.log('AI Response:', response.data.data);

			const { isComplete, nextQuestion, jobData, actionRequired } = response.data.data;

			// Update live preview
			if (jobData) {
				const matchedLocation = dbLocations.find(l => l._id === jobData.locationId);
				setDraftJob(prev => ({
					...prev,
					...jobData,
					location: matchedLocation || prev.location,
					status: JobStatus.DRAFT,
					source: JobSource.INTERNAL,
				}));
			}

			const newAiMsg: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: 'ai',
				content: nextQuestion || (isComplete ? "Perfect! I have all the information. Creating the job now..." : ""),
				actionRequired: actionRequired || undefined,
				completed: false
			};
			setMessages((prev) => [...prev, newAiMsg]);

			if (isComplete && jobData) {
				// Automatically create the job
				handleFinalCreation(jobData);
			}
		} catch (error: any) {
			toast.error('Failed to get AI response. Please try again.');
			console.error('Chat error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFinalCreation = (jobData: any) => {
		const matchedLoc = dbLocations.find(l => l._id === jobData.locationId);
		if (!matchedLoc) {
			toast.error("Location matching failed. Please select manually.");
			return;
		}

		createJobMutation.mutate({
			title: jobData.title,
			description: jobData.description,
			requiredSkills: jobData.requiredSkills || [],
			experienceLevel: jobData.experienceLevel as ExperienceLevel,
			type: jobData.type as JobType,
			location: matchedLoc,
			aiFocusArea: jobData.aiFocusArea || "",
			source: JobSource.INTERNAL
		}, {
			onSuccess: () => {
				setIsFinished(true);
				localStorage.removeItem(STORAGE_KEY);
			},
			onError: (err: any) => {
				toast.error("Failed to create job: " + (err.response?.data?.message || err.message));
			}
		});
	};

	const handleSelectionConfirm = (type: ActionType, id: string) => {
		let label = id;
		if (type === 'location') {
			const item = dbLocations.find(l => l._id === id);
			label = item ? `${item.city}, ${item.country}` : id;
		} else if (type === 'department') {
			const item = dbDepartments.find(d => d._id === id);
			label = item ? item.name : id;
		} else if (type === 'employmentType') {
			const item = EMPLOYMENT_TYPES.find(i => i._id === id);
			label = item ? item.name : id;
		} else if (type === 'workspaceType') {
			const item = WORKSPACE_TYPES.find(i => i._id === id);
			label = item ? item.name : id;
		} else if (type === 'experienceLevel') {
			const item = EXPERIENCE_LEVELS.find(i => i._id === id);
			label = item ? item.name : id;
		}

		const selectionMsg = `Selected ${type}: ${label} (ID: ${id})`;
		
		setMessages(prev => {
			const newMessages = [...prev];
			const lastAiMessageIdx = newMessages.findLastIndex(m => m.role === 'ai' && m.actionRequired === type);
			if (lastAiMessageIdx !== -1) {
				newMessages[lastAiMessageIdx] = { ...newMessages[lastAiMessageIdx], completed: true };
			}
			return newMessages;
		});
		
		handleSendMessage(selectionMsg);
	};

	const getItemsForType = (type: ActionType) => {
		switch (type) {
			case 'location': return dbLocations;
			case 'department': return dbDepartments;
			case 'employmentType': return EMPLOYMENT_TYPES;
			case 'workspaceType': return WORKSPACE_TYPES;
			case 'experienceLevel': return EXPERIENCE_LEVELS;
			default: return [];
		}
	};

	const resetChat = () => {
		localStorage.removeItem(STORAGE_KEY);
		setMessages([
			{
				id: '1',
				role: 'ai',
				content:
					'Hi! I can help you create a new job posting quickly. What kind of role are you looking to fill? You can just tell me the title and a brief overview of what the person will do.'
			}
		]);
		setDraftJob({});
		setIsFinished(false);
	};

	if (isFinished) {
		return (
			<div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center space-y-8 text-center">
				<div className="relative mx-auto size-24">
					<div className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-20" />
					<div className="bg-primary/5 border-primary/20 relative flex size-full items-center justify-center rounded-full border">
						<IconCheck className="text-primary size-12" />
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="font-lora text-3xl font-semibold">Job Created Successfully</h2>
					<p className="text-muted-foreground mx-auto max-w-md">
						The cogniCV AI is now scanning platform profiles to find the best matches for this role.
					</p>
				</div>
				<div className="flex justify-center gap-4 pt-4">
					<Button size="lg" onClick={() => router.push('/dashboard/jobs')}>
						View All Jobs
					</Button>
					<Button size="lg" variant="outline" onClick={resetChat}>
						Create Another
					</Button>
				</div>
			</div>
		);
	}

	const isDraftEmpty = !draftJob.title && !draftJob.type && !draftJob.experienceLevel && !draftJob.location && !draftJob.departmentId && !draftJob.description && (!draftJob.requiredSkills || draftJob.requiredSkills.length === 0);

	return (
		<div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
			<div className="flex shrink-0 items-center justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-semibold">
						<IconSparkles className="text-primary size-6" /> AI Job Creation
					</h1>
					<p className="text-muted-foreground mt-1">
						Answer a few questions to generate the perfect job listing.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" onClick={resetChat}>
						<IconTrash className="size-4 mr-2" />
						Clear chat
					</Button>
				</div>
			</div>

			<div className="flex flex-1 gap-6 overflow-hidden">
				{/* Chat Section */}
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
					<ChatInterface
						messages={messages.map(m => {
							if (m.actionRequired && !m.completed) {
								return {
									...m,
									component: (
										<InlineSelector
											type={m.actionRequired as any}
											items={getItemsForType(m.actionRequired as any)}
											onSelect={(id) => handleSelectionConfirm(m.actionRequired as any, id)}
										/>
									)
								};
							}
							return m;
						})}
						onSendMessage={(content) => handleSendMessage(content)}
						isLoading={isLoading || createJobMutation.isPending}
						placeholder="Type your answer..."
					/>
				</div>

				{/* Preview Section */}
				<div className="w-[400px] shrink-0 flex flex-col overflow-hidden border rounded-xl bg-muted/10">
					<div className="p-4 border-b bg-white flex items-center justify-between">
						<h3 className="font-semibold text-lg flex items-center gap-2">
							<IconCheck className="size-5 text-primary" /> Live Job Preview
							{isLoading && <IconLoader2 className="size-4 animate-spin text-muted-foreground ml-2" />}
						</h3>
					</div>
					
					<ScrollArea className="flex-1 p-4">
						{isDraftEmpty ? (
							<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground mt-20">
								<div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
									<IconFileText className="size-6" />
								</div>
								<p className="font-medium text-foreground">No preview available</p>
								<p className="text-sm mt-1">Start chatting to view the job preview.</p>
							</div>
						) : (
							<div className="space-y-6 pb-10">
								{/* Core Info */}
								<div className="space-y-4">
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Title</p>
										<p className={cn("text-xl font-semibold font-lora", !draftJob.title && "text-muted-foreground/40 italic")}>
											{draftJob.title || "Waiting for title..."}
										</p>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
											<div className="flex items-center gap-2">
												<IconClock className="size-4 text-primary/60" />
												<span className={cn("text-sm", !draftJob.type && "text-muted-foreground/40")}>
													{draftJob.type || "---"}
												</span>
											</div>
										</div>
										<div className="space-y-1">
											<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Experience</p>
											<div className="flex items-center gap-2">
												<IconBriefcase className="size-4 text-primary/60" />
												<span className={cn("text-sm", !draftJob.experienceLevel && "text-muted-foreground/40")}>
													{draftJob.experienceLevel || "---"}
												</span>
											</div>
										</div>
									</div>

									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</p>
										<div className="flex items-center gap-2">
											<IconMapPin className="size-4 text-primary/60" />
											<span className={cn("text-sm", !draftJob.location && "text-muted-foreground/40")}>
												{draftJob.location ? `${draftJob.location.city}, ${draftJob.location.country} (${draftJob.location.workspaceType})` : "---"}
											</span>
										</div>
									</div>
									
									<div className="space-y-1">
										<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</p>
										<div className="flex items-center gap-2">
											<IconBuilding className="size-4 text-primary/60" />
											<span className={cn("text-sm", !draftJob.departmentId && "text-muted-foreground/40")}>
												{dbDepartments.find(d => d._id === draftJob.departmentId)?.name || "---"}
											</span>
										</div>
									</div>
								</div>

								<hr className="border-dashed" />

								{/* Description */}
								<div className="space-y-2">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</p>
									<div className={cn("text-sm leading-relaxed text-muted-foreground", !draftJob.description && "text-muted-foreground/40 italic")}>
										{draftJob.description ? (
											<MarkdownRenderer content={draftJob.description} />
										) : (
											"Describe the role to see it here..."
										)}
									</div>
								</div>

								{/* Skills */}
								<div className="space-y-2">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Required Skills</p>
									<div className="flex flex-wrap gap-2">
										{draftJob.requiredSkills && draftJob.requiredSkills.length > 0 ? (
											draftJob.requiredSkills.map(skill => (
												<Badge key={skill} variant="outline" className="bg-primary/5 border-primary/20">
													{skill}
												</Badge>
											))
										) : (
											<p className="text-sm text-muted-foreground/40 italic">No skills added yet...</p>
										)}
									</div>
								</div>
							</div>
						)}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
