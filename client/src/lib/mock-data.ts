import type {
	CandidateProfile,
	JobListing,
	RecruiterJobView
} from '@/types/jobs';

export const mockJobs: JobListing[] = [
	{
		id: 'job-001',
		title: 'Senior Full-Stack Engineer',
		company: 'Umurava Labs',
		location: 'Kigali, Rwanda',
		type: 'Full-time',
		experienceLevel: 'Senior',
		salaryRange: '$4,800 - $6,200',
		postedAt: '2026-04-17T11:00:00.000Z',
		summary:
			'Lead product engineering for a recruiter workflow platform powered by AI.',
		description:
			'You will design and ship scalable product features across Next.js and Node.js services. The role requires ownership over architecture, mentoring, and production quality implementation.',
		requiredSkills: [
			'TypeScript',
			'Next.js',
			'Node.js',
			'MongoDB',
			'API Design'
		],
		niceToHave: ['LLM Integration', 'System Design', 'Docker'],
		applicants: 42,
		status: 'Open'
	},
	{
		id: 'job-002',
		title: 'Frontend Engineer, Recruiter Experience',
		company: 'CogniCV',
		location: 'Nairobi, Kenya',
		type: 'Full-time',
		experienceLevel: 'Mid',
		salaryRange: '$3,500 - $4,400',
		postedAt: '2026-04-20T09:15:00.000Z',
		summary:
			'Own UI architecture for job, shortlist, and candidate analysis workflows.',
		description:
			'You will build rich dashboard experiences with clear information hierarchy, modern interaction design, and robust state management in React.',
		requiredSkills: [
			'React',
			'Next.js',
			'Tailwind CSS',
			'UI Architecture',
			'Accessibility'
		],
		niceToHave: ['Recharts', 'Framer Motion', 'Design Systems'],
		applicants: 31,
		status: 'Open'
	},
	{
		id: 'job-003',
		title: 'Applied AI Engineer',
		company: 'Umurava Labs',
		location: 'Remote, Africa',
		type: 'Contract',
		experienceLevel: 'Senior',
		salaryRange: '$5,200 - $7,000',
		postedAt: '2026-04-12T12:30:00.000Z',
		summary:
			'Implement candidate scoring pipelines and explainable ranking services.',
		description:
			'You will design prompt workflows, schema validation, and candidate normalization pipelines for high-volume evaluation jobs.',
		requiredSkills: [
			'Python',
			'LLM Prompting',
			'Zod',
			'Node.js',
			'Evaluation'
		],
		niceToHave: ['Gemini API', 'MLOps', 'OpenTelemetry'],
		applicants: 56,
		status: 'Closing Soon'
	},
	{
		id: 'job-004',
		title: 'Talent Operations Analyst',
		company: 'People Grid',
		location: 'Lagos, Nigeria',
		type: 'Part-time',
		experienceLevel: 'Junior',
		salaryRange: '$1,800 - $2,400',
		postedAt: '2026-04-19T08:05:00.000Z',
		summary:
			'Support recruiter workflows, quality checks, and talent profile integrity.',
		description:
			'You will review candidate records, clean source data, and assist screening calibration with clear process tracking.',
		requiredSkills: [
			'Recruiting Ops',
			'Data Quality',
			'Spreadsheets',
			'Communication'
		],
		niceToHave: ['ATS Tooling', 'SQL', 'Reporting'],
		applicants: 24,
		status: 'Open'
	},
	{
		id: 'job-005',
		title: 'Backend Engineer, Screening APIs',
		company: 'CogniCV',
		location: 'Accra, Ghana',
		type: 'Full-time',
		experienceLevel: 'Mid',
		salaryRange: '$3,900 - $5,100',
		postedAt: '2026-04-09T10:10:00.000Z',
		summary:
			'Build resilient APIs for upload, parsing, and screening orchestration.',
		description:
			'You will own endpoint design for jobs, uploads, and results while ensuring strict validation, retries, and transparent failure states.',
		requiredSkills: [
			'Node.js',
			'Express',
			'MongoDB',
			'Zod',
			'API Security'
		],
		niceToHave: ['Queue Systems', 'Rate Limiting', 'Caching'],
		applicants: 37,
		status: 'Paused'
	},
	{
		id: 'job-006',
		title: 'Product Designer, Hiring Intelligence',
		company: 'Umurava Labs',
		location: 'Kampala, Uganda',
		type: 'Contract',
		experienceLevel: 'Mid',
		salaryRange: '$3,200 - $4,100',
		postedAt: '2026-04-18T14:20:00.000Z',
		summary:
			'Design candidate insights and recruiter decision surfaces with clarity.',
		description:
			'You will design end-to-end UX for job creation, applicant uploads, ranking interpretation, and recommendation confidence.',
		requiredSkills: [
			'Product Design',
			'Figma',
			'Information Architecture',
			'UX Writing'
		],
		niceToHave: ['Recruitment Domain', 'Design Systems', 'Research'],
		applicants: 19,
		status: 'Open'
	}
];

const applicantsByJobId: Record<string, CandidateProfile[]> = {
	'job-001': [
		{
			id: 'cand-001',
			name: 'Amara N.',
			headline: 'Senior Full-Stack Developer',
			location: 'Kigali, Rwanda',
			availability: 'Available',
			yearsExperience: 7,
			skills: ['TypeScript', 'Next.js', 'Node.js', 'MongoDB', 'GraphQL'],
			matchScore: 92,
			subScores: {
				skills: 94,
				experience: 90,
				education: 84,
				availability: 98
			},
			strengths: [
				'Hands-on leadership in multi-team Next.js programs.',
				'Strong backend architecture and API lifecycle ownership.',
				'Immediate start and full-time availability.'
			],
			gaps: [
				'Limited exposure to event-driven systems at scale.',
				'Needs deeper infra automation beyond Docker basics.'
			],
			recommendation: 'Strong hire with high role alignment and low ramp risk.',
			appliedAt: '2026-04-21T08:10:00.000Z'
		},
		{
			id: 'cand-002',
			name: 'Tariq B.',
			headline: 'Backend-Focused Full-Stack Engineer',
			location: 'Nairobi, Kenya',
			availability: 'Open to opportunities',
			yearsExperience: 6,
			skills: ['Node.js', 'TypeScript', 'PostgreSQL', 'REST', 'Docker'],
			matchScore: 84,
			subScores: {
				skills: 82,
				experience: 88,
				education: 80,
				availability: 83
			},
			strengths: [
				'Excellent API design and service reliability experience.',
				'Consistent impact in high-volume products.',
				'Good collaboration across product and design.'
			],
			gaps: [
				'Less depth in modern frontend architecture.',
				'MongoDB production depth is moderate.'
			],
			recommendation: 'Interview priority candidate for backend-heavy roadmap.',
			appliedAt: '2026-04-21T11:40:00.000Z'
		},
		{
			id: 'cand-003',
			name: 'Leila K.',
			headline: 'Product Engineer',
			location: 'Dar es Salaam, Tanzania',
			availability: 'Open to opportunities',
			yearsExperience: 5,
			skills: ['React', 'Next.js', 'TypeScript', 'UX', 'Node.js'],
			matchScore: 81,
			subScores: {
				skills: 84,
				experience: 78,
				education: 79,
				availability: 82
			},
			strengths: [
				'Strong frontend quality and interaction design sense.',
				'Good TypeScript discipline and testing habits.',
				'Cross-functional communication is strong.'
			],
			gaps: [
				'Limited experience with team-scale backend architecture.',
				'System design depth is still developing.'
			],
			recommendation:
				'Great product execution profile with medium architecture ramp-up.',
			appliedAt: '2026-04-22T07:20:00.000Z'
		}
	],
	'job-002': [
		{
			id: 'cand-010',
			name: 'Noel M.',
			headline: 'Senior Frontend Engineer',
			location: 'Lagos, Nigeria',
			availability: 'Available',
			yearsExperience: 6,
			skills: ['React', 'Next.js', 'Tailwind CSS', 'Accessibility', 'Design Systems'],
			matchScore: 95,
			subScores: {
				skills: 97,
				experience: 92,
				education: 86,
				availability: 98
			},
			strengths: [
				'Outstanding design system implementation track record.',
				'Excellent accessibility and interaction quality standards.',
				'Direct experience building recruiter workflow interfaces.'
			],
			gaps: [
				'Recharts exposure is moderate.',
				'Limited backend integration ownership.'
			],
			recommendation: 'Top candidate with immediate UI impact potential.',
			appliedAt: '2026-04-22T09:50:00.000Z'
		},
		{
			id: 'cand-011',
			name: 'Asha R.',
			headline: 'Frontend Engineer',
			location: 'Kampala, Uganda',
			availability: 'Open to opportunities',
			yearsExperience: 4,
			skills: ['React', 'TypeScript', 'UI Patterns', 'Testing', 'Figma'],
			matchScore: 86,
			subScores: {
				skills: 88,
				experience: 84,
				education: 82,
				availability: 87
			},
			strengths: [
				'Solid component architecture and testing discipline.',
				'Strong collaboration with design and product.',
				'Good pacing in iterative feature delivery.'
			],
			gaps: [
				'Needs deeper dashboard-scale information architecture.',
				'Animation systems experience is limited.'
			],
			recommendation: 'Strong shortlist candidate with manageable growth gaps.',
			appliedAt: '2026-04-22T14:05:00.000Z'
		},
		{
			id: 'cand-012',
			name: 'David O.',
			headline: 'UI Engineer',
			location: 'Accra, Ghana',
			availability: 'Not available',
			yearsExperience: 5,
			skills: ['React', 'CSS', 'Animation', 'Next.js', 'Performance'],
			matchScore: 77,
			subScores: {
				skills: 82,
				experience: 80,
				education: 75,
				availability: 60
			},
			strengths: [
				'Excellent UI polish and animation quality.',
				'Performance-minded frontend engineering approach.',
				'Strong component reuse strategy.'
			],
			gaps: [
				'Current notice period is long for immediate hiring.',
				'Limited recruiting-domain product context.'
			],
			recommendation:
				'Good technical fit, but timeline constraints need consideration.',
			appliedAt: '2026-04-21T16:45:00.000Z'
		}
	],
	'job-003': [
		{
			id: 'cand-020',
			name: 'Grace P.',
			headline: 'Applied ML Engineer',
			location: 'Nairobi, Kenya',
			availability: 'Available',
			yearsExperience: 6,
			skills: ['Python', 'Prompt Engineering', 'Evaluation', 'MLOps', 'Node.js'],
			matchScore: 91,
			subScores: {
				skills: 93,
				experience: 90,
				education: 84,
				availability: 95
			},
			strengths: [
				'Excellent applied AI delivery in production settings.',
				'Strong model evaluation and schema validation patterns.',
				'Clear communication of model limitations and risk.'
			],
			gaps: [
				'Limited product design collaboration history.',
				'Gemini-specific depth can improve.'
			],
			recommendation: 'High-confidence candidate for immediate screening roadmap.',
			appliedAt: '2026-04-20T13:10:00.000Z'
		},
		{
			id: 'cand-021',
			name: 'Musa T.',
			headline: 'Data and AI Engineer',
			location: 'Kigali, Rwanda',
			availability: 'Open to opportunities',
			yearsExperience: 5,
			skills: ['Python', 'LLM Apps', 'ETL', 'FastAPI', 'Evaluation'],
			matchScore: 83,
			subScores: {
				skills: 85,
				experience: 82,
				education: 80,
				availability: 84
			},
			strengths: [
				'Strong data pipeline reliability and observability habits.',
				'Good prompt iteration and structured output thinking.',
				'Cross-functional stakeholder alignment is clear.'
			],
			gaps: [
				'Limited large-scale experiment orchestration experience.',
				'Could improve frontend integration familiarity.'
			],
			recommendation:
				'Good candidate with strong implementation fundamentals.',
			appliedAt: '2026-04-20T17:25:00.000Z'
		}
	],
	'job-004': [
		{
			id: 'cand-030',
			name: 'Lydia A.',
			headline: 'Talent Operations Specialist',
			location: 'Lagos, Nigeria',
			availability: 'Available',
			yearsExperience: 3,
			skills: ['ATS Workflows', 'Data QA', 'Reporting', 'Communication'],
			matchScore: 88,
			subScores: {
				skills: 90,
				experience: 84,
				education: 80,
				availability: 95
			},
			strengths: [
				'Highly organized process ownership across hiring stages.',
				'Great quality control and profile data hygiene.',
				'Strong coordination with recruiters and candidates.'
			],
			gaps: [
				'Automation tooling depth still growing.',
				'Limited SQL beyond basic querying.'
			],
			recommendation:
				'Strong operational fit with rapid onboarding potential.',
			appliedAt: '2026-04-21T08:30:00.000Z'
		}
	],
	'job-005': [
		{
			id: 'cand-040',
			name: 'Kwesi J.',
			headline: 'Backend Engineer',
			location: 'Accra, Ghana',
			availability: 'Open to opportunities',
			yearsExperience: 5,
			skills: ['Node.js', 'Express', 'MongoDB', 'Queues', 'Zod'],
			matchScore: 89,
			subScores: {
				skills: 91,
				experience: 86,
				education: 82,
				availability: 88
			},
			strengths: [
				'Strong API reliability and validation-first engineering.',
				'Good knowledge of queue-backed processing flows.',
				'Consistent ownership from design to deployment.'
			],
			gaps: [
				'Needs more distributed caching production depth.',
				'Frontend collaboration context is light.'
			],
			recommendation: 'Excellent shortlist choice for API-heavy priorities.',
			appliedAt: '2026-04-18T10:40:00.000Z'
		}
	],
	'job-006': [
		{
			id: 'cand-050',
			name: 'Yvonne C.',
			headline: 'Senior Product Designer',
			location: 'Kampala, Uganda',
			availability: 'Available',
			yearsExperience: 7,
			skills: ['Product Design', 'Research', 'Systems Thinking', 'Figma', 'UX Writing'],
			matchScore: 90,
			subScores: {
				skills: 93,
				experience: 89,
				education: 84,
				availability: 95
			},
			strengths: [
				'Strong information architecture for complex dashboards.',
				'Excellent craft in visual hierarchy and interaction details.',
				'Clear communication with product and engineering stakeholders.'
			],
			gaps: [
				'Limited recruiting-domain exposure.',
				'Needs context on AI explanation constraints.'
			],
			recommendation: 'High-value design candidate with strategic range.',
			appliedAt: '2026-04-21T12:00:00.000Z'
		}
	]
};

export const mockRecruiterJobs: RecruiterJobView[] = mockJobs.map((job) => ({
	jobId: job.id,
	screeningState: 'idle',
	applicants: applicantsByJobId[job.id] ?? []
}));

export function getRecruiterViewByJob(jobId: string): RecruiterJobView | undefined {
	return mockRecruiterJobs.find((entry) => entry.jobId === jobId);
}
