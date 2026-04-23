'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

type JobType = 'internal' | 'external';
type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead'];

const STEPS = ['Source', 'Details', 'Requirements'];

export default function NewJobPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [jobType, setJobType] = useState<JobType>('internal');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [department, setDepartment] = useState('');
	const [location, setLocation] = useState('');
	const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
	const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid');
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
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
								<><IconUpload className="mr-2 size-5" /> Upload Applicants</>
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
							<div className="grid sm:grid-cols-2 gap-4">
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
									<Textarea
										id="description"
										placeholder="Describe the role, responsibilities, and what success looks like..."
										className="min-h-[120px]"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
								</div>
								<div className="grid sm:grid-cols-2 gap-5">
									<div className="grid gap-1.5">
										<Label htmlFor="department">Department</Label>
										<Input id="department" placeholder="e.g. Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} />
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="location">Location</Label>
										<Input id="location" placeholder="e.g. Remote, Nairobi" value={location} onChange={(e) => setLocation(e.target.value)} />
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
