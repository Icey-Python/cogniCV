import type { Job, RankedCandidate, TalentProfile } from '@/types';

// ─── Mock Jobs ────────────────────────────────────────────────────────────────

export const MOCK_JOBS: Job[] = [
	{
		_id: 'job-1',
		title: 'Senior Frontend Engineer',
		description:
			'We are looking for a Senior Frontend Engineer to join our growing engineering team. You will be responsible for building and maintaining high-quality web applications using React, TypeScript, and modern tooling.',
		department: 'Engineering',
		requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
		experienceLevel: 'Senior',
		type: 'Full-time',
		jobType: 'internal',
		location: 'Remote (Africa)',
		status: 'Active',
		applicantCount: 47,
		createdAt: '2025-04-20T10:00:00Z',
	},
	{
		_id: 'job-2',
		title: 'Product Designer',
		description:
			'Join our design team to shape the user experience across our products. You will work closely with product managers and engineers to deliver beautiful, functional interfaces.',
		department: 'Design',
		requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
		experienceLevel: 'Mid',
		type: 'Full-time',
		jobType: 'external',
		location: 'Kigali, Rwanda',
		status: 'Active',
		applicantCount: 31,
		createdAt: '2025-04-18T09:00:00Z',
	},
	{
		_id: 'job-3',
		title: 'Backend Lead Engineer',
		description:
			'Lead our backend engineering efforts, designing scalable APIs and mentoring junior engineers. Strong experience with Node.js and distributed systems required.',
		department: 'Engineering',
		requiredSkills: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker', 'AWS'],
		experienceLevel: 'Lead',
		type: 'Full-time',
		jobType: 'external',
		location: 'Lagos, Nigeria',
		status: 'Active',
		applicantCount: 19,
		createdAt: '2025-04-15T08:00:00Z',
	},
	{
		_id: 'job-4',
		title: 'ML Engineer',
		description:
			'Build and deploy machine learning models at scale. Experience with LLMs and Python is essential.',
		department: 'AI/ML',
		requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Gemini API'],
		experienceLevel: 'Senior',
		type: 'Contract',
		jobType: 'internal',
		location: 'Nairobi, Kenya',
		status: 'Draft',
		applicantCount: 0,
		createdAt: '2025-04-22T11:00:00Z',
	},
];

// ─── Mock Talent Profiles ─────────────────────────────────────────────────────

const profiles: TalentProfile[] = [
	{
		_id: 'cand-1',
		firstName: 'John',
		lastName: 'Doe',
		email: 'john.doe@email.com',
		headline: 'Senior React Engineer | TypeScript | Next.js',
		bio: 'Passionate frontend engineer with 6 years of experience building production-grade web applications.',
		location: 'Nairobi, Kenya',
		skills: [
			{ name: 'React', level: 'Expert', yearsOfExperience: 6 },
			{ name: 'TypeScript', level: 'Expert', yearsOfExperience: 5 },
			{ name: 'Next.js', level: 'Advanced', yearsOfExperience: 4 },
			{ name: 'GraphQL', level: 'Advanced', yearsOfExperience: 3 },
			{ name: 'Tailwind CSS', level: 'Expert', yearsOfExperience: 3 },
		],
		languages: [{ name: 'English', proficiency: 'Native' }],
		experience: [
			{
				company: 'TechCorp Africa',
				role: 'Senior Frontend Engineer',
				startDate: '2022-01',
				endDate: '',
				description: 'Led frontend architecture for a B2B SaaS platform serving 50,000+ users.',
				technologies: ['React', 'TypeScript', 'GraphQL'],
				isCurrent: true,
			},
			{
				company: 'StartupHub',
				role: 'Frontend Engineer',
				startDate: '2019-06',
				endDate: '2022-01',
				description: 'Built consumer-facing features for an e-commerce platform.',
				technologies: ['React', 'Redux', 'Node.js'],
				isCurrent: false,
			},
		],
		education: [
			{
				institution: 'University of Nairobi',
				degree: 'BSc',
				fieldOfStudy: 'Computer Science',
				startYear: 2014,
				endYear: 2018,
			},
		],
		certifications: [{ name: 'AWS Certified Developer', issuer: 'Amazon', issueDate: '2023-05' }],
		projects: [
			{
				name: 'OpenDash',
				description: 'An open-source analytics dashboard built with Next.js and Recharts.',
				technologies: ['Next.js', 'TypeScript', 'Recharts'],
				role: 'Lead Developer',
				link: 'https://github.com/johndoe/opendash',
				startDate: '2023-01',
				endDate: '2023-06',
			},
		],
		availability: { status: 'Available', type: 'Full-time', startDate: '2025-05-01' },
		socialLinks: { linkedin: 'https://linkedin.com/in/johndoe', github: 'https://github.com/johndoe' },
	},
	{
		_id: 'cand-2',
		firstName: 'Jane',
		lastName: 'Smith',
		email: 'jane.smith@email.com',
		headline: 'Frontend Architect | React | System Design',
		bio: 'Architecture-focused engineer with deep expertise in large-scale React applications.',
		location: 'Lagos, Nigeria',
		skills: [
			{ name: 'React', level: 'Expert', yearsOfExperience: 8 },
			{ name: 'TypeScript', level: 'Expert', yearsOfExperience: 6 },
			{ name: 'Next.js', level: 'Expert', yearsOfExperience: 5 },
			{ name: 'Design Systems', level: 'Advanced', yearsOfExperience: 4 },
			{ name: 'Node.js', level: 'Intermediate', yearsOfExperience: 3 },
		],
		languages: [{ name: 'English', proficiency: 'Fluent' }],
		experience: [
			{
				company: 'Global Fintech Ltd',
				role: 'Principal Frontend Engineer',
				startDate: '2020-03',
				endDate: '',
				description: 'Architected the frontend for a global payment platform used in 30+ countries.',
				technologies: ['React', 'TypeScript', 'Micro-frontends'],
				isCurrent: true,
			},
		],
		education: [
			{
				institution: 'University of Lagos',
				degree: 'BSc',
				fieldOfStudy: 'Software Engineering',
				startYear: 2011,
				endYear: 2015,
			},
		],
		projects: [],
		availability: { status: 'Open to Opportunities', type: 'Full-time' },
		socialLinks: { linkedin: 'https://linkedin.com/in/janesmith' },
	},
	{
		_id: 'cand-3',
		firstName: 'Alice',
		lastName: 'Brown',
		email: 'alice.brown@email.com',
		headline: 'Full-Stack Developer | React | Node.js',
		bio: 'Versatile developer comfortable across the entire web stack.',
		location: 'Kigali, Rwanda',
		skills: [
			{ name: 'React', level: 'Advanced', yearsOfExperience: 4 },
			{ name: 'TypeScript', level: 'Advanced', yearsOfExperience: 3 },
			{ name: 'Node.js', level: 'Advanced', yearsOfExperience: 4 },
			{ name: 'MongoDB', level: 'Intermediate', yearsOfExperience: 2 },
		],
		languages: [
			{ name: 'English', proficiency: 'Fluent' },
			{ name: 'French', proficiency: 'Conversational' },
		],
		experience: [
			{
				company: 'Andela',
				role: 'Senior Software Engineer',
				startDate: '2021-06',
				endDate: '',
				description: 'Embedded with a US client building a healthcare data platform.',
				technologies: ['React', 'Node.js', 'PostgreSQL'],
				isCurrent: true,
			},
		],
		education: [
			{
				institution: 'African Leadership University',
				degree: 'BSc',
				fieldOfStudy: 'Computer Science',
				startYear: 2016,
				endYear: 2020,
			},
		],
		projects: [],
		availability: { status: 'Available', type: 'Full-time', startDate: '2025-06-01' },
		socialLinks: { github: 'https://github.com/alicebrown' },
	},
];

// ─── Mock Ranked Candidates ───────────────────────────────────────────────────

export const MOCK_RANKED_CANDIDATES: Record<string, RankedCandidate[]> = {
	'job-1': [
		{
			rank: 1,
			candidateId: 'cand-1',
			profileSource: 'platform',
			matchScore: 94,
			subScores: { skills: 98, experience: 92, education: 85, availability: 100 },
			strengths: [
				'Expert-level React and TypeScript with 6 years of production experience',
				'5+ years of Next.js matching the exact stack requirement',
				'Immediately available for full-time engagement',
			],
			gaps: [
				'No direct GraphQL production experience at scale',
				'Limited exposure to design systems ownership',
			],
			recommendation:
				'Highly recommended. Skills and experience are an exceptional match. Minor GraphQL ramp-up expected but low risk.',
			profileSnapshot: profiles[0],
		},
		{
			rank: 2,
			candidateId: 'cand-2',
			profileSource: 'platform',
			matchScore: 89,
			subScores: { skills: 95, experience: 88, education: 80, availability: 75 },
			strengths: [
				'8 years of React experience with architectural depth',
				'Proven leadership of large-scale frontend systems',
				'Strong design systems expertise adding extra value',
			],
			gaps: ['Currently open but not immediately available', 'Higher potential salary expectation'],
			recommendation:
				'Strong hire for senior/lead scope. Architectural skill set is a major advantage. Availability timeline needs discussion.',
			profileSnapshot: profiles[1],
		},
		{
			rank: 3,
			candidateId: 'cand-3',
			profileSource: 'platform',
			matchScore: 81,
			subScores: { skills: 80, experience: 82, education: 78, availability: 88 },
			strengths: [
				'Full-stack versatility adds implementation flexibility',
				'Fast learner demonstrated by cross-domain experience',
				'Available within 30 days',
			],
			gaps: [
				'React experience is Advanced vs Expert level required',
				'No Next.js-specific project experience listed',
				'Background is more generalist than specialist',
			],
			recommendation:
				'Solid candidate for mid-to-senior scope. Would need mentoring on architectural decisions but brings good energy.',
			profileSnapshot: profiles[2],
		},
	],
	'job-2': [
		{
			rank: 1,
			candidateId: 'cand-3',
			profileSource: 'external',
			matchScore: 88,
			subScores: { skills: 85, experience: 90, education: 82, availability: 95 },
			strengths: [
				'Strong user research background from healthcare sector',
				'Experience with cross-cultural product design',
				'Available immediately',
			],
			gaps: ['Limited Figma proficiency — primarily uses Sketch', 'No formal design system ownership'],
			recommendation:
				'Good fit for the product designer role. Experience is directly transferable; tooling adaptation is straightforward.',
			profileSnapshot: profiles[2],
		},
	],
	'job-3': [
		{
			rank: 1,
			candidateId: 'cand-2',
			profileSource: 'external',
			matchScore: 79,
			subScores: { skills: 70, experience: 85, education: 75, availability: 75 },
			strengths: [
				'Strong leadership and mentoring track record',
				'Broad distributed systems exposure',
				'Excellent communication skills',
			],
			gaps: [
				'Primary stack is frontend — backend lead scope is a stretch',
				'No MongoDB or Redis production experience',
				'AWS experience is limited',
			],
			recommendation:
				'Conditional hire — strong leadership profile but technical backend depth needs validation in interview.',
			profileSnapshot: profiles[1],
		},
	],
};
