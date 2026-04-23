'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	IconCircleCheck,
	IconX,
	IconPlus,
	IconChevronLeft,
	IconChevronRight,
	IconDeviceFloppy,
	IconArrowLeft,
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MOCK_JOBS } from '@/lib/mock-data';

type JobType = 'internal' | 'external';
type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead'];

export default function EditJobPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const jobId = params.id;
	
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [department, setDepartment] = useState('');
	const [location, setLocation] = useState('');
	const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
	const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid');
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const job = MOCK_JOBS.find(j => j._id === jobId || j._id === `job-${jobId?.split('-').pop()}`);
		if (job) {
			setTitle(job.title);
			setDescription(job.description);
			setDepartment(job.department);
			setLocation(job.location);
			setEmploymentType(job.type as EmploymentType);
			setExperienceLevel(job.experienceLevel as ExperienceLevel);
			setSkills(job.requiredSkills);
		}
	}, [jobId]);

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills((prev) => [...prev, trimmed]);
			setSkillInput('');
		}
	};

	const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

	const handleSave = () => {
		setIsSaving(true);
		setTimeout(() => {
			setIsSaving(false);
			setSaved(true);
		}, 1500);
	};

	if (saved) {
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
					<h2 className="text-3xl font-semibold font-lora">Job Updated</h2>
					<p className="text-muted-foreground max-w-md mx-auto">
						Your changes to the job listing have been successfully saved.
					</p>
				</div>
				<div className="flex justify-center gap-4 pt-4">
					<Button variant="outline" size="lg" asChild className="min-w-[160px]">
						<Link href={`/dashboard/jobs/${jobId}`}>View Job Details</Link>
					</Button>
					<Button size="lg" asChild className="min-w-[160px]">
						<Link href="/dashboard/jobs">Back to All Jobs</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-2xl font-semibold">Edit Job Listing</h1>
						<p className="text-muted-foreground mt-1">Update the details for this role.</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left column: Main form */}
				<div className="lg:col-span-2 space-y-6">
					<Card className="p-8">
						<div className="space-y-6">
							<div className="grid gap-2">
								<Label htmlFor="title">Job Title</Label>
								<Input
									id="title"
									placeholder="e.g. Senior Frontend Engineer"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="description">Job Description</Label>
								<Textarea
									id="description"
									placeholder="Describe the role and responsibilities..."
									className="min-h-[200px]"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="grid gap-2">
									<Label htmlFor="department">Department</Label>
									<Input
										id="department"
										placeholder="e.g. Engineering"
										value={department}
										onChange={(e) => setDepartment(e.target.value)}
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="location">Location</Label>
									<Input
										id="location"
										placeholder="e.g. Remote, Kigali, Rwanda"
										value={location}
										onChange={(e) => setLocation(e.target.value)}
									/>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-8">
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">Requirements & Terms</h2>
								<p className="text-sm text-muted-foreground mt-1">These details help the AI rank candidates effectively.</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="grid gap-4">
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
														? 'border-primary bg-primary text-primary-foreground shadow-sm'
														: 'border-border bg-white hover:border-primary/40'
												)}
											>
												{t}
											</button>
										))}
									</div>
								</div>
								<div className="grid gap-4">
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
														? 'border-primary bg-primary text-primary-foreground shadow-sm'
														: 'border-border bg-white hover:border-primary/40'
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
								<div className="flex flex-wrap gap-2 mt-2">
									{skills.map((skill) => (
										<span
											key={skill}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/5 text-primary text-sm font-medium border border-primary/10"
										>
											{skill}
											<button
												type="button"
												onClick={() => removeSkill(skill)}
												className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors"
											>
												<IconX className="size-3" />
											</button>
										</span>
									))}
								</div>
							</div>
						</div>
					</Card>
				</div>

				{/* Right column: Info & Actions */}
				<div className="space-y-6">
					<Card className="p-6 bg-slate-50 border-slate-200">
						<h3 className="font-semibold text-sm mb-2">Editor Note</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Updating job requirements will re-trigger AI candidate ranking for existing applicants to ensure match scores remain accurate.
						</p>
					</Card>
					
					<div className="flex flex-col gap-3">
						<Button onClick={handleSave} disabled={isSaving} className="w-full h-11">
							{isSaving ? 'Saving Changes...' : 'Save All Changes'}
						</Button>
						<Button variant="outline" className="w-full h-11" onClick={() => router.back()}>
							Discard Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
