import { apiBase } from '@/lib/config';
import { IServerResponse } from '@/types/api';

export interface Department {
	_id: string;
	name: string;
}

export type WorkspaceType = 'Remote' | 'Hybrid' | 'On-site';

export interface Location {
	_id: string;
	country: string;
	city: string;
	workspaceType: WorkspaceType;
	isDefault: boolean;
}

export interface Organization {
	departments: Department[];
	locations: Location[];
}

export type UpdateOrganizationPayload = {
	departments?: (Department | Omit<Department, '_id'>)[];
	locations?: (Location | Omit<Location, '_id'>)[];
};

export const OrganizationService = {
	getOrganization: async () => {
		const response =
			await apiBase.get<IServerResponse<Organization>>('/organization');
		return response.data;
	},

	updateOrganization: async (data: UpdateOrganizationPayload) => {
		const response = await apiBase.put<IServerResponse<Organization>>(
			'/organization',
			data
		);
		return response.data;
	}
};
