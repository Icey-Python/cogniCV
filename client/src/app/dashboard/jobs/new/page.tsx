'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';

const MdxEditor = dynamic(() => import('@/components/ui/mdx-editor'), { ssr: false });
import {
	IconBuilding,
	IconWorld,
	IconX,
	IconPlus,
	IconCircleCheck,
	IconUsers,
	IconUpload,
	IconChevronRight,
	IconChevronLeft,
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type JobType = 'internal' | 'external' | 'ai';
type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead'];
const MOCK_DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance'];
const MOCK_LOCATIONS = ['Worldwide (Remote)', 'Kigali, Rwanda', 'Nairobi, Kenya', 'New York, USA', 'London, UK'];

const STEPS = ['Source', 'Details', 'Requirements'];

export default function NewJobPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [jobType, setJobType] = useState<JobType>('internal');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [department, setDepartment] = useState('');
	const [isCustomDept, setIsCustomDept] = useState(false);
	const [location, setLocation] = useState('');
	const [isCustomLocation, setIsCustomLocation] = useState(false);
	const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
	const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid');
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [focusAreas, setFocusAreas] = useState('');
	const [created, setCreated] = useState(false);

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills((prev) => [...prev, trimmed]);
			setSkillInput('');
		}
	};

	const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

	const handleCreate = () => {
		setCreated(true);
	};

	if (created) {
		return (
			<div className="max-w-2xl mx-auto text-center space-y-8 py-24">
				<div className="mx-auto size-24 relative">
					<div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
					<div className="relative size-full rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							className="size-12 text-primary"
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
					<h2 className="text-3xl font-semibold font-lora">Job Created Successfully</h2>
					<p className="text-muted-foreground max-w-md mx-auto">
						{jobType === 'internal'
							? 'The CogniCV AI is now scanning platform profiles to find the best matches for this role.'
							: 'Your external job listing is live. You can now upload candidate resumes to begin the AI screening process.'}
					</p>
				</div>
				<div className="flex justify-center gap-4 pt-4">
					<Button variant="outline" size="lg" asChild className="min-w-[160px]">
						<Link href="/dashboard/jobs">Back to Dashboard</Link>
					</Button>
					<Button size="lg" asChild className="min-w-[160px]">
						<Link href={jobType === 'internal' ? '/dashboard/jobs/j1' : '/dashboard/jobs/j2/upload'}>
							{jobType === 'internal' ? (
								<><IconUsers className="mr-2 size-5" /> View Applicants</>
							) : (
								<><IconUpload className="mr-2 size-5" /> Import Applications</>
							)}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const nextStep = () => setStep((s) => Math.min(3, s + 1));
	const prevStep = () => setStep((s) => Math.max(1, s - 1));

	return (
		<div className="max-w-6xl space-y-8">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<h1 className="text-2xl font-semibold">Create New Job</h1>
					<p className="text-muted-foreground mt-1">Follow the steps to set up a new role.</p>
				</div>
			</div>

			{/* Step indicator */}
			<div className="flex items-center gap-1">
				{STEPS.map((label, i) => {
					const stepNum = i + 1;
					const isActive = step === stepNum;
					const isComplete = step > stepNum;
					return (
						<div key={label} className="flex items-center flex-1 last:flex-none">
							<div className="flex items-center gap-2">
								<div
									className={cn(
										'size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
										isActive && 'bg-primary text-primary-foreground',
										isComplete && 'bg-primary/15 text-primary',
										!isActive && !isComplete && 'bg-muted text-muted-foreground'
									)}
								>
									{isComplete ? <IconCircleCheck className="size-4" /> : stepNum}
								</div>
								<span className={cn('text-sm hidden sm:inline', isActive ? 'font-medium' : 'text-muted-foreground')}>
									{label}
								</span>
							</div>
							{i < STEPS.length - 1 && (
								<div className={cn('h-px flex-1 mx-3', isComplete ? 'bg-primary/30' : 'bg-border')} />
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
								<h2 className="text-lg font-semibold">Application Source</h2>
								<p className="text-sm text-muted-foreground mt-1">Choose how candidates will be sourced.</p>
							</div>
							<div className="grid sm:grid-cols-3 gap-4">
								<button
									type="button"
									onClick={() => setJobType('internal')}
									className={cn(
										'rounded-lg border-2 p-6 text-left transition-all',
										jobType === 'internal'
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/40'
									)}
								>
									<IconBuilding className={cn('size-7 mb-3', jobType === 'internal' ? 'text-primary' : 'text-muted-foreground')} />
									<h3 className="font-semibold">Internal Platform</h3>
									<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
										Match from Umurava's talent pool using structured profiles.
									</p>
								</button>
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
									<IconWorld className={cn('size-7 mb-3', jobType === 'external' ? 'text-primary' : 'text-muted-foreground')} />
									<h3 className="font-semibold">External Upload</h3>
									<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
										Upload batch PDF resumes or a CSV from external job boards.
									</p>
								</button>
								<button
									type="button"
									onClick={() => {
										setJobType('ai');
										router.push('/dashboard/jobs/new/ai-chat');
									}}
									className={cn(
										'rounded-lg border-2 p-6 text-left transition-all',
										jobType === 'ai'
											? 'border-primary bg-primary/5'
											: 'border-border hover:border-primary/40'
									)}
								>
									<div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary mb-3 text-primary-foreground">
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" /><path d="M19 11h2m-1 -1v2" /></svg>
									</div>
									<h3 className="font-semibold">Use AI to add new job</h3>
									<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
										Chat with our AI assistant to instantly generate the job description and requirements.
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
								<p className="text-sm text-muted-foreground mt-1">Provide the core information about this position.</p>
							</div>
							<div className="grid gap-5">
								<div className="grid gap-1.5">
									<Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
									<Input id="title" placeholder="e.g. Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
								</div>
								<div className="grid gap-1.5">
									<Label htmlFor="description">Job Description <span className="text-destructive">*</span></Label>
									<MdxEditor
										markdown={description}
										onChange={setDescription}
									/>
								</div>
								<div className="grid sm:grid-cols-2 gap-5">
									<div className="grid gap-1.5">
										<Label htmlFor="department">Department</Label>
										{!isCustomDept ? (
											<select
												id="department"
												className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
												value={department}
												onChange={(e) => {
													if (e.target.value === 'custom') {
														setIsCustomDept(true);
														setDepartment('');
													} else {
														setDepartment(e.target.value);
													}
												}}
											>
												<option value="" disabled>Select department</option>
												{MOCK_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
												<option value="custom">Other / Custom...</option>
											</select>
										) : (
											<div className="flex gap-2">
												<Input id="department" placeholder="Enter department name" value={department} onChange={(e) => setDepartment(e.target.value)} autoFocus />
												<Button type="button" variant="ghost" size="icon" onClick={() => { setIsCustomDept(false); setDepartment(''); }}>
													<IconX className="size-4" />
												</Button>
											</div>
										)}
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="location">Location</Label>
										{!isCustomLocation ? (
											<select
												id="location"
												className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
												value={location}
												onChange={(e) => {
													if (e.target.value === 'custom') {
														setIsCustomLocation(true);
														setLocation('');
													} else {
														setLocation(e.target.value);
													}
												}}
											>
												<option value="" disabled>Select location</option>
												{MOCK_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
												<option value="custom">Other / Custom...</option>
											</select>
										) : (
											<div className="flex gap-2">
												<Input id="location" placeholder="Enter location name" value={location} onChange={(e) => setLocation(e.target.value)} autoFocus />
												<Button type="button" variant="ghost" size="icon" onClick={() => { setIsCustomLocation(false); setLocation(''); }}>
													<IconX className="size-4" />
												</Button>
											</div>
										)}
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
								<p className="text-sm text-muted-foreground mt-1">This helps the AI accurately match and rank candidates.</p>
							</div>
							<div className="grid gap-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="grid gap-2">
										<Label>Employment Type</Label>
										<div className="flex gap-2 flex-wrap">
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
										<div className="flex gap-2 flex-wrap">
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
											onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
										/>
										<Button type="button" onClick={addSkill} size="icon" variant="outline">
											<IconPlus className="size-4" />
										</Button>
									</div>
									{skills.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{skills.map((skill) => (
												<span
													key={skill}
													className="inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/15"
												>
													{skill}
													<button onClick={() => removeSkill(skill)} className="hover:text-destructive ml-0.5">
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
				</div>

				{/* Footer */}
				<div className="px-8 py-5 flex justify-between items-center bg-muted/20">
					{step > 1 ? (
						<Button variant="outline" onClick={prevStep} className="gap-1.5">
							<IconChevronLeft className="size-4" /> Back
						</Button>
					) : (
						<Button variant="ghost" asChild>
							<Link href="/dashboard/jobs">Cancel</Link>
						</Button>
					)}
					{step < 3 ? (
						<Button onClick={nextStep} className="gap-1.5" disabled={step === 2 && (!title.trim() || !description.trim())}>
							Continue <IconChevronRight className="size-4" />
						</Button>
					) : (
						<Button onClick={handleCreate} className="gap-1.5">
							Create Job <IconCircleCheck className="size-4" />
						</Button>
					)}
				</div>
			</Card>
		</div>
	);
}
