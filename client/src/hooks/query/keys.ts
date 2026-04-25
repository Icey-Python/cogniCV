/** Centralised React Query key factory with example keys */
export const queryKeys = {
	auth: {
		user: ['auth', 'user'] as const
	},
	applicants: {
		all: ['applicants'] as const,
		list: (filters?: unknown) => ['applicants', 'list', filters] as const,
		detail: (id: string) => ['applicants', id] as const
	},
	user: {
		me: ['user', 'me'] as const,
		all: ['user', 'all'] as const,
		search: (query: string) => ['user', 'search', query] as const
	},
	organization: {
		all: ['organization'] as const,
		details: () => [...queryKeys.organization.all, 'details'] as const
	}
};
