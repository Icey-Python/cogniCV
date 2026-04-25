'use client';

import { useState, useMemo } from 'react';
import { useMockTalentQuery } from '@/hooks/query/jobs/queries';
import { TalentPoolTable } from '@/components/talent/talent-pool-table';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	IconSearch,
	IconUsers,
	IconFilter,
	IconLoader2,
	IconX,
	IconCode
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SENIORITY_LEVELS = ['All', 'Senior', 'Junior', 'Mid', 'Lead', 'Entry'];
const LANGUAGES = ['All', 'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'Figma', 'GraphQL'];

export default function TalentPoolPage() {
	const { data, isLoading } = useMockTalentQuery();
	const talent = data?.data || [];

	const [search, setSearch] = useState('');
	const [seniorityFilter, setSeniorityFilter] = useState('All');
	const [languageFilter, setLanguageFilter] = useState('All');

	const filteredTalent = useMemo(() => {
		return talent.filter((profile) => {
			const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
			const headline = (profile.headline || '').toLowerCase();
			const bio = (profile.bio || '').toLowerCase();
			const skills = (profile.skills || []).map(s => s.name.toLowerCase());

			const matchesSearch = 
				fullName.includes(search.toLowerCase()) || 
				headline.includes(search.toLowerCase());

			const matchesSeniority = 
				seniorityFilter === 'All' || 
				headline.includes(seniorityFilter.toLowerCase()) || 
				bio.includes(seniorityFilter.toLowerCase());

			const matchesLanguage = 
				languageFilter === 'All' || 
				skills.some(s => s.includes(languageFilter.toLowerCase()));

			return matchesSearch && matchesSeniority && matchesLanguage;
		});
	}, [talent, search, seniorityFilter, languageFilter]);

	const clearFilters = () => {
		setSearch('');
		setSeniorityFilter('All');
		setLanguageFilter('All');
	};

	const hasActiveFilters = search !== '' || seniorityFilter !== 'All' || languageFilter !== 'All';

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="font-lora text-3xl font-bold tracking-tight text-slate-900">Talent Pool</h1>
				<p className="text-muted-foreground">
					Search and filter through all candidates in your recruitment database.
				</p>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative flex-1 min-w-[300px]">
						<IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
						<Input
							placeholder="Search by name, role or keyword..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="bg-white pl-9 h-10 border-slate-200 focus-visible:ring-primary/20"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
							<SelectTrigger className="w-[140px] h-10 bg-white">
								<div className="flex items-center gap-2">
									<IconFilter className="size-3.5 text-slate-400" />
									<SelectValue placeholder="Seniority" />
								</div>
							</SelectTrigger>
							<SelectContent>
								{SENIORITY_LEVELS.map(level => (
									<SelectItem key={level} value={level}>{level}</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Select value={languageFilter} onValueChange={setLanguageFilter}>
							<SelectTrigger className="w-[160px] h-10 bg-white">
								<div className="flex items-center gap-2">
									<IconCode className="size-3.5 text-slate-400" />
									<SelectValue placeholder="Skill/Lang" />
								</div>
							</SelectTrigger>
							<SelectContent>
								{LANGUAGES.map(lang => (
									<SelectItem key={lang} value={lang}>{lang}</SelectItem>
								))}
							</SelectContent>
						</Select>

						{hasActiveFilters && (
							<Button 
								variant="ghost" 
								size="sm" 
								onClick={clearFilters}
								className="text-slate-500 hover:text-slate-900 gap-1.5 h-10"
							>
								<IconX className="size-4" /> Clear
							</Button>
						)}
					</div>
				</div>

				{/* Active Filter Badges */}
				{hasActiveFilters && (
					<div className="flex flex-wrap gap-2">
						{search && (
							<Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 gap-1 px-2 py-1">
								Search: {search}
								<IconX className="size-3 cursor-pointer" onClick={() => setSearch('')} />
							</Badge>
						)}
						{seniorityFilter !== 'All' && (
							<Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 gap-1 px-2 py-1">
								Seniority: {seniorityFilter}
								<IconX className="size-3 cursor-pointer" onClick={() => setSeniorityFilter('All')} />
							</Badge>
						)}
						{languageFilter !== 'All' && (
							<Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 gap-1 px-2 py-1">
								Skill: {languageFilter}
								<IconX className="size-3 cursor-pointer" onClick={() => setLanguageFilter('All')} />
							</Badge>
						)}
					</div>
				)}
			</div>

			{/* Results Section */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<IconUsers className="size-4 text-slate-400" />
						<span className="text-sm font-medium text-slate-600">
							{filteredTalent.length} candidates found
						</span>
					</div>
				</div>

				<Card className="overflow-hidden border-slate-200 shadow-sm">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20 gap-3">
							<IconLoader2 className="size-8 text-primary animate-spin" />
							<p className="text-sm text-slate-500 font-medium">Loading talent pool...</p>
						</div>
					) : (
						<TalentPoolTable talent={filteredTalent} />
					)}
				</Card>
			</div>
		</div>
	);
}
