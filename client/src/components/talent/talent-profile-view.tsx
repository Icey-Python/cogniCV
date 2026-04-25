'use client';

import {
	IconMapPin,
	IconBriefcase,
	IconSchool,
	IconCode,
	IconCertificate,
	IconBrandLinkedin,
	IconBrandGithub,
	IconWorld,
	IconStar,
	IconBuildingSkyscraper,
	IconMail,
	IconExternalLink
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TalentProfile } from '@/hooks/query/jobs/service';

const LEVEL_COLOR: Record<string, string> = {
	Expert: 'bg-violet-50 text-violet-700 border-violet-100',
	Advanced: 'bg-blue-50 text-blue-700 border-blue-100',
	Intermediate: 'bg-emerald-50 text-emerald-700 border-emerald-100',
	Beginner: 'bg-amber-50 text-amber-700 border-amber-100'
};

interface TalentProfileViewProps {
	profile: TalentProfile;
}

export function TalentProfileView({ profile }: TalentProfileViewProps) {
	return (
		<div className="flex flex-col gap-6">
			{/* Top Summary Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-5">
						<p className="text-muted-foreground font-lora text-xs font-medium tracking-wider uppercase">
							Location
						</p>
						<p className="mt-1 flex items-center gap-2 truncate text-xl font-medium">
							<IconMapPin className="size-4 text-slate-400" />{' '}
							{profile.location || 'Remote'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-muted-foreground font-lora text-xs font-medium tracking-wider uppercase">
							Availability
						</p>
						<div className="mt-1 flex items-center gap-2">
							<span
								className={cn(
									'size-2 rounded-full',
									profile.availability?.status === 'Available'
										? 'bg-emerald-500'
										: 'bg-amber-500'
								)}
							/>
							<p className="text-xl font-medium">
								{profile.availability?.status || 'Active'}
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-muted-foreground font-lora text-xs font-medium tracking-wider uppercase">
							Experience
						</p>
						<p className="mt-1 flex items-center gap-2 text-xl font-medium">
							<IconBriefcase className="size-4 text-slate-400" />{' '}
							{profile.experience?.length || 0} Roles
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<p className="text-muted-foreground font-lora text-xs font-medium tracking-wider uppercase">
							Skills
						</p>
						<p className="mt-1 flex items-center gap-2 text-xl font-medium">
							<IconCode className="size-4 text-slate-400" />{' '}
							{profile.skills?.length || 0} Keywords
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Contact & Technical Skills Row */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Contact Information */}
				<Card>
					<CardHeader>
						<CardTitle className="font-lora text-lg">
							Contact Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center gap-3 text-sm">
								<IconMail className="size-4 text-slate-400" />
								<span className="truncate">{profile.email}</span>
							</div>
							{profile.location && (
								<div className="flex items-center gap-3 text-sm">
									<IconMapPin className="size-4 text-slate-400" />
									<span>{profile.location}</span>
								</div>
							)}
						</div>

						<div className="flex flex-wrap gap-2 pt-2">
							{profile.socialLinks?.linkedin && (
								<a
									href={profile.socialLinks.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
								>
									<IconBrandLinkedin className="size-4 text-blue-600" />{' '}
									LinkedIn
								</a>
							)}
							{profile.socialLinks?.github && (
								<a
									href={profile.socialLinks.github}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
								>
									<IconBrandGithub className="size-4" /> GitHub
								</a>
							)}
							{profile.socialLinks?.portfolio && (
								<a
									href={profile.socialLinks.portfolio}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
								>
									<IconWorld className="size-4 text-slate-500" /> Portfolio
								</a>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Technical Skills */}
				<Card>
					<CardHeader>
						<CardTitle className="font-lora text-lg">
							Technical Skills
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-2">
							{profile.skills?.map((skill) => (
								<Badge
									key={skill.name}
									variant="outline"
									className={cn(
										'rounded-full px-6 py-2 font-medium',
										LEVEL_COLOR[skill.level] || 'bg-slate-50'
									)}
								>
									{skill.name}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Bio/About */}
			{profile.bio && (
				<Card>
					<CardHeader>
						<CardTitle className="font-lora text-lg">About</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground leading-relaxed">
							{profile.bio}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Experience */}
			{profile.experience && profile.experience.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="font-lora flex items-center gap-2 text-lg">
							<IconBuildingSkyscraper className="text-primary size-4" />{' '}
							Experience
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-8">
						{profile.experience.map((exp, i) => (
							<div key={i} className="group flex gap-4">
								<div className="group-hover:border-primary/30 flex size-10 shrink-0 items-center justify-center rounded-lg border bg-slate-50 transition-colors">
									<IconBriefcase className="group-hover:text-primary size-5 text-slate-400 transition-colors" />
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<p className="font-semibold">{exp.role}</p>
										{exp.isCurrent && (
											<Badge
												variant="secondary"
												className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
											>
												Current
											</Badge>
										)}
									</div>
									<p className="text-muted-foreground text-sm font-medium">
										{exp.company}
									</p>
									<p className="text-muted-foreground text-xs">
										{exp.startDate} – {exp.endDate ?? 'Present'}
									</p>
									{exp.description && (
										<p className="mt-3 text-sm leading-relaxed text-slate-600">
											{exp.description}
										</p>
									)}
									{exp.technologies && exp.technologies.length > 0 && (
										<div className="mt-3 flex flex-wrap gap-1.5">
											{exp.technologies.map((t) => (
												<Badge
													key={t}
													variant="outline"
													className="h-5 px-2 py-0 text-[10px] font-normal tracking-wider uppercase"
												>
													{t}
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			)}

			{/* Projects */}
			{profile.projects && profile.projects.length > 0 && (
				<div>
					<CardTitle className="font-lora flex items-center gap-2 text-lg">
						<IconStar className="text-primary size-4" /> Featured Projects
					</CardTitle>
					<div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
						{profile.projects.map((proj, i) => (
							<div
								key={i}
								className="hover:border-primary/20 rounded-xl border p-4 transition-colors"
							>
								<div className="flex items-start justify-between gap-2">
									<p className="text-base font-semibold">{proj.name}</p>
									{proj.link && (
										<a
											href={proj.link}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
										>
											<IconExternalLink className="size-3.5" />
										</a>
									)}
								</div>
								<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
									{proj.description}
								</p>
								<div className="mt-3 flex flex-wrap gap-1">
									{proj.technologies.slice(0, 3).map((t) => (
										<span
											key={t}
											className="rounded border bg-white px-2 py-1 text-xs text-slate-500"
										>
											{t}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Education & Certifications Row */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Education */}
				{profile.education && profile.education.length > 0 && (
					<div className="space-y-4">
						<CardTitle className="font-lora flex items-center gap-2 text-lg">
							<IconSchool className="text-primary" size={20} /> Education
						</CardTitle>
						<div className="space-y-4">
							{profile.education.map((edu, i) => (
								<div
									key={i}
									className="border-primary/20 max-w-sm space-y-1 rounded-lg border p-4"
								>
									<p className="text-base font-semibold">{edu.degree}</p>
									<p className="text-muted-foreground text-sm">
										{edu.institution}
									</p>
									<p className="text-sm tracking-wider text-slate-400 uppercase">
										{edu.startYear} – {edu.endYear ?? 'Present'}
									</p>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Certifications */}
				{profile.certifications && profile.certifications.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="font-lora flex items-center gap-2 text-base">
								<IconCertificate className="text-primary size-4" />{' '}
								Certifications
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{profile.certifications.map((cert, i) => (
								<div key={i} className="flex items-center gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50">
										<IconCertificate className="size-4 text-amber-600" />
									</div>
									<div className="min-w-0">
										<p className="truncate text-xs font-semibold">
											{cert.name}
										</p>
										<p className="text-muted-foreground truncate text-[10px]">
											{cert.issuer}
										</p>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
