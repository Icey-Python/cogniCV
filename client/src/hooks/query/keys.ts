/** Centralised React Query key factory with example keys */
export const queryKeys = {
	auth: {
		user: ['auth', 'user'] as const
	},
	applicants: {
		all: ['applicants'] as const,
		list: (filters?: unknown) => ['applicants', 'list', filters] as const,
		detail: (id: string) => ['applicants', id] as const
	}
};
