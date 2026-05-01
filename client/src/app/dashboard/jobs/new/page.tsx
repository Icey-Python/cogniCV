'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useOrganizationQuery } from '@/hooks/query/organization/queries';
import { useCreateJobMutation } from '@/hooks/query/jobs/mutations';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const MdxEditor = dynamic(() => import('@/components/ui/mdx-editor'), {
	ssr: false
});
import {
	IconPencil,
	IconX,
	IconPlus,
	IconCircleCheck,
	IconUsers,
	IconUpload,
	IconChevronRight,
	IconChevronLeft,
	IconBrain,
	IconCode,
	IconBriefcase,
	IconSchool
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Job } from '@/hooks/query/jobs/service';

type JobType = 'external' | 'ai';
type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

const EMPLOYMENT_TYPES: EmploymentType[] = [
	'Full-time',
	'Part-time',
	'Contract'
];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
	'Entry',
	'Junior',
	'Mid',
	'Senior',
	'Lead'
];

const STEPS = ['Source', 'Details', 'Requirements', 'Scoring'];

export default function NewJobPage() {
	const router = useRouter();
	const { data: orgData } = useOrganizationQuery();
	const createJob = useCreateJobMutation();

	const dbDepartments = orgData?.data?.departments || [];
	const dbLocations = orgData?.data?.locations || [];

	const [step, setStep] = useState(1);
	const [jobType, setJobType] = useState<JobType>('external');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [department, setDepartment] = useState('');
	const [locationId, setLocationId] = useState('');
	const [employmentType, setEmploymentType] =
		useState<EmploymentType>('Full-time');
	const [experienceLevel, setExperienceLevel] =
		useState<ExperienceLevel>('Mid');
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [focusAreas, setFocusAreas] = useState('');
	const [weights, setWeights] = useState({
		skills: 40,
		experience: 25,
		education: 15,
		relevance: 20
	});
	const [created, setCreated] = useState(false);

	const totalWeight =
		weights.skills + weights.experience + weights.education + weights.relevance;

	// Load AI draft from localStorage if available
	useEffect(() => {
		const draftJson = localStorage.getItem('job-draft-ai');
		if (draftJson) {
			try {
				const draft: Job = JSON.parse(draftJson);
				setTitle(draft.title || '');
				setDescription(draft.description || '');
				setEmploymentType(draft.type || 'Full-time');
				setExperienceLevel(draft.experienceLevel || 'Mid');
				setSkills(draft.requiredSkills || []);

				// Move to details step automatically if it's an AI draft
				setStep(2);

				// We don't clear it immediately to allow location matching in the next effect
			} catch (e) {
				console.error('Failed to parse AI draft', e);
				localStorage.removeItem('job-draft-ai');
			}
		}
	}, []);

	// Match location once dbLocations are loaded
	useEffect(() => {
		const draftJson = localStorage.getItem('job-draft-ai');
		if (draftJson && dbLocations.length > 0 && !locationId) {
			try {
				const draft: Job = JSON.parse(draftJson);
				const matchedLoc = dbLocations.find(
					(l) => l.city.toLowerCase() === draft.location?.city?.toLowerCase()
				);
				if (matchedLoc) {
					setLocationId(matchedLoc._id);
				}
				// Now we can clear it
				localStorage.removeItem('job-draft-ai');
			} catch (e) {
				localStorage.removeItem('job-draft-ai');
			}
		}
	}, [dbLocations, locationId]);

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills((prev) => [...prev, trimmed]);
			setSkillInput('');
		}
	};

	const removeSkill = (skill: string) =>
		setSkills((prev) => prev.filter((s) => s !== skill));

	const handleCreate = () => {
		const locObj = dbLocations.find((l) => l._id === locationId);
		if (!locObj) return;

		// We assume frontend enum values match backend
		createJob.mutate(
			{
				title,
				description,
				requiredSkills: skills,
				experienceLevel: experienceLevel as any,
				type: employmentType as any,
				location: locObj,
				aiFocusArea: focusAreas,
				analysisWeights: {
					skills: weights.skills,
					experience: weights.experience,
					education: weights.education,
					relevance: weights.relevance
				}
			},
			{
				onSuccess: () => {
					setCreated(true);
				}
			}
		);
	};

	if (created) {
		return (
			<div className="mx-auto max-w-2xl space-y-8 py-24 text-center">
				<div className="relative mx-auto size-24">
					<div className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-20" />
					<div className="bg-primary/5 border-primary/20 relative flex size-full items-center justify-center rounded-full border">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							className="text-primary size-12"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M20 6L9 17L4 12" />
						</svg>
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="font-lora text-3xl font-semibold">
						Job Created Successfully
					</h2>
					<p className="text-muted-foreground mx-auto max-w-md">
						Your job listing is live. You can now upload candidate resumes to
						begin the AI screening process.
					</p>
				</div>
				<div className="flex justify-center gap-4 pt-4">
					<Button size="lg" asChild className="min-w-[160px]">
						<Link href={'/dashboard/jobs'}>Proceed to Jobs</Link>
					</Button>
				</div>
			</div>
		);
	}

	const nextStep = () => setStep((s) => Math.min(4, s + 1));
	const prevStep = () => setStep((s) => Math.max(1, s - 1));

	return (
		<div className="max-w-6xl space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<h1 className="text-2xl font-semibold">Create New Job</h1>
					<p className="text-muted-foreground mt-1">
						Follow the steps to set up a new role.
					</p>
				</div>
			</div>

			{/* Step indicator */}
			<div className="flex items-center gap-1">
				{STEPS.map((label, i) => {
					const stepNum = i + 1;
					const isActive = step === stepNum;
					const isComplete = step > stepNum;
					return (
						<div
							key={label}
							className="flex flex-1 items-center last:flex-none"
						>
							<div className="flex items-center gap-2">
								<div
									className={cn(
										'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
										isActive && 'bg-primary text-primary-foreground',
										isComplete && 'bg-primary/15 text-primary',
										!isActive && !isComplete && 'bg-muted text-muted-foreground'
									)}
								>
									{isComplete ? (
										<IconCircleCheck className="size-4" />
									) : (
										stepNum
									)}
								</div>
								<span
									className={cn(
										'hidden text-sm sm:inline',
										isActive ? 'font-medium' : 'text-muted-foreground'
									)}
								>
									{label}
								</span>
							</div>
							{i < STEPS.length - 1 && (
								<div
									className={cn(
										'mx-3 h-px flex-1',
										isComplete ? 'bg-primary/30' : 'bg-border'
									)}
								/>
							)}
						</div>
					);
				})}
			</div>

			{/* Form card */}
			<Card className="overflow-hidden">
				<div className="p-8">
					{/* Step 1: Source */}
					{step === 1 && (
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">Job Creation Method</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Choose how to create a job.
								</p>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<button
									type="button"
									onClick={() => setJobType('external')}
									className={cn(
										'rounded-lg border-2 p-6 text-left transition-all',
										jobType === 'external'
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/40'
									)}
								>
									<IconPencil
										className={cn(
											'mb-3 size-7',
											jobType === 'external'
												? 'text-primary'
												: 'text-muted-foreground'
										)}
									/>
									<h3 className="font-semibold">Manual</h3>
									<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
										Manually enter the job details and requirements.
									</p>
								</button>
								<button
									type="button"
									onClick={() => {
										router.push('/dashboard/jobs/new/ai-chat');
									}}
									className={cn(
										'rounded-lg border-2 p-6 text-left transition-all',
										jobType === 'ai'
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/40'
									)}
								>
									<div className="bg-primary text-primary-foreground mb-3 flex aspect-square size-10 items-center justify-center rounded-lg">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="size-6"
										>
											<path stroke="none" d="M0 0h24v24H0z" fill="none" />
											<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
											<path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
											<path d="M19 11h2m-1 -1v2" />
										</svg>
									</div>
									<h3 className="font-semibold">Use AI to add new job</h3>
									<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
										Chat with our AI assistant to instantly generate the job
										description and requirements.
									</p>
								</button>
							</div>
						</div>
					)}

					{/* Step 2: Details */}
					{step === 2 && (
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">Job Details</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Provide the core information about this position.
								</p>
							</div>
							<div className="grid gap-5">
								<div className="grid gap-1.5">
									<Label htmlFor="title">
										Job Title <span className="text-destructive">*</span>
									</Label>
									<Input
										id="title"
										placeholder="e.g. Senior Frontend Engineer"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
									/>
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="description">
										Job Description <span className="text-destructive">*</span>
									</Label>
									<MdxEditor
										markdown={description}
										onChange={setDescription}
										placeholder="Describe the role and responsibilities..."
									/>
								</div>
								<div className="grid gap-5 sm:grid-cols-2">
									<div className="grid gap-1.5">
										<Label htmlFor="department">Department</Label>
										<Select value={department} onValueChange={setDepartment}>
											<SelectTrigger id="department">
												<SelectValue placeholder="Select department" />
											</SelectTrigger>
											<SelectContent>
												{dbDepartments.map((d) => (
													<SelectItem key={d._id} value={d._id}>
														{d.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="location">
											Location <span className="text-destructive">*</span>
										</Label>
										<Select value={locationId} onValueChange={setLocationId}>
											<SelectTrigger id="location">
												<SelectValue placeholder="Select location" />
											</SelectTrigger>
											<SelectContent>
												{dbLocations.map((l) => (
													<SelectItem key={l._id} value={l._id}>
														{l.city}, {l.country} ({l.workspaceType})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Step 3: Requirements */}
					{step === 3 && (
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">Requirements</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									This helps the AI accurately match and rank candidates.
								</p>
							</div>
							<div className="grid gap-6">
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="grid gap-2">
										<Label>Employment Type</Label>
										<div className="flex flex-wrap gap-2">
											{EMPLOYMENT_TYPES.map((t) => (
												<button
													key={t}
													type="button"
													onClick={() => setEmploymentType(t)}
													className={cn(
														'rounded-md border px-4 py-2 text-sm font-medium transition-all',
														employmentType === t
															? 'border-primary bg-primary text-primary-foreground'
															: 'border-border hover:border-primary/40'
													)}
												>
													{t}
												</button>
											))}
										</div>
									</div>
									<div className="grid gap-2">
										<Label>Experience Level</Label>
										<div className="flex flex-wrap gap-2">
											{EXPERIENCE_LEVELS.map((l) => (
												<button
													key={l}
													type="button"
													onClick={() => setExperienceLevel(l)}
													className={cn(
														'rounded-md border px-4 py-2 text-sm font-medium transition-all',
														experienceLevel === l
															? 'border-primary bg-primary text-primary-foreground'
															: 'border-border hover:border-primary/40'
													)}
												>
													{l}
												</button>
											))}
										</div>
									</div>
								</div>
								<div className="grid gap-2">
									<Label>Required Skills</Label>
									<div className="flex gap-2">
										<Input
											placeholder="Type a skill and press Enter"
											value={skillInput}
											onChange={(e) => setSkillInput(e.target.value)}
											onKeyDown={(e) =>
												e.key === 'Enter' && (e.preventDefault(), addSkill())
											}
										/>
										<Button
											type="button"
											onClick={addSkill}
											size="icon"
											variant="outline"
										>
											<IconPlus className="size-4" />
										</Button>
									</div>
									{skills.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{skills.map((skill) => (
												<span
													key={skill}
													className="bg-primary/10 text-primary border-primary/15 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm"
												>
													{skill}
													<button
														onClick={() => removeSkill(skill)}
														className="hover:text-destructive ml-0.5"
													>
														<IconX className="size-3" />
													</button>
												</span>
											))}
										</div>
									)}
								</div>
								<div className="grid gap-2">
									<Label htmlFor="focusAreas">AI Analysis Focus Areas</Label>
									<Textarea
										id="focusAreas"
										placeholder="Enter specific areas you want the AI to focus on when analyzing candidates (e.g., 'Look for strong experience in React and Node.js...')"
										className="min-h-[100px]"
										value={focusAreas}
										onChange={(e) => setFocusAreas(e.target.value)}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Step 4: Scoring */}
					{step === 4 && (
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">AI Scoring Weights</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Adjust how much importance the AI should give to each factor
									when ranking candidates. Must total 100%.
								</p>
							</div>

							<div
								className={cn(
									'flex items-center justify-between rounded-lg border p-4 transition-colors',
									totalWeight === 100
										? 'bg-primary/5 border-primary/20 text-primary'
										: 'bg-destructive/5 border-destructive/20 text-destructive'
								)}
							>
								<span className="text-sm font-medium">
									Total Weight Allocation
								</span>
								<span className="text-lg font-bold">{totalWeight}% / 100%</span>
							</div>

							<div className="grid gap-6 sm:grid-cols-2">
								{[
									{
										key: 'skills',
										label: 'Technical Skills',
										icon: IconCode,
										color: 'text-blue-500',
										desc: 'Weight for matching required skills'
									},
									{
										key: 'experience',
										label: 'Experience Level',
										icon: IconBriefcase,
										color: 'text-emerald-500',
										desc: 'Weight for years of experience & seniority'
									},
									{
										key: 'education',
										label: 'Education',
										icon: IconSchool,
										color: 'text-amber-500',
										desc: 'Weight for relevant degrees & certifications'
									},
									{
										key: 'relevance',
										label: 'Overall Relevance',
										icon: IconBrain,
										color: 'text-purple-500',
										desc: 'Weight for general industry & domain match'
									}
								].map((item) => {
									const Icon = item.icon;
									const val = weights[item.key as keyof typeof weights];
									return (
										<div
											key={item.key}
											className="bg-card hover:border-primary/30 rounded-xl border p-5 shadow-sm transition-all"
										>
											<div className="mb-4 flex items-start justify-between gap-4">
												<div className="flex items-center gap-3">
													<div
														className={cn(
															'bg-muted/50 flex size-10 items-center justify-center rounded-lg',
															item.color
														)}
													>
														<Icon className="size-5" />
													</div>
													<div>
														<h3 className="leading-none font-semibold">
															{item.label}
														</h3>
														<p className="text-muted-foreground mt-1.5 text-xs">
															{item.desc}
														</p>
													</div>
												</div>
												<div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
													{val}%
												</div>
											</div>
											<div className="px-1">
												<input
													type="range"
													min="0"
													max="100"
													step="5"
													value={val}
													onChange={(e) =>
														setWeights((prev) => ({
															...prev,
															[item.key]: parseInt(e.target.value)
														}))
													}
													className="bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-full"
												/>
												<div className="text-muted-foreground mt-2 flex justify-between text-[10px] font-medium">
													<span>Low</span>
													<span>Medium</span>
													<span>High</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="bg-muted/20 flex items-center justify-between px-8 py-5">
					{step > 1 ? (
						<Button variant="outline" onClick={prevStep} className="gap-1.5">
							<IconChevronLeft className="size-4" /> Back
						</Button>
					) : (
						<Button variant="ghost" asChild>
							<Link href="/dashboard/jobs">Cancel</Link>
						</Button>
					)}
					{step < 4 ? (
						<Button
							onClick={nextStep}
							className="gap-1.5"
							disabled={
								step === 2 &&
								(!title.trim() || !description.trim() || !locationId)
							}
						>
							Continue <IconChevronRight className="size-4" />
						</Button>
					) : (
						<Button
							onClick={handleCreate}
							className="gap-1.5"
							disabled={createJob.isPending || totalWeight !== 100}
						>
							{createJob.isPending ? 'Creating...' : 'Create Job'}{' '}
							<IconCircleCheck className="size-4" />
						</Button>
					)}
				</div>
			</Card>
		</div>
	);
}
