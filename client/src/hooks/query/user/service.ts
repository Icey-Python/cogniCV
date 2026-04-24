import { apiBase } from '@/lib/config';
import { IServerResponse, User } from '@/types/api';

export const UserService = {
	createUser: async (data: any) => {
		const response = await apiBase.post<IServerResponse<{ user: User }>>(
			'/user',
			data
		);
		return response.data;
	},

	login: async (data: any) => {
		const response = await apiBase.post<IServerResponse<{ user: User }>>(
			'/user/login',
			data
		);
		return response.data;
	},

	logout: async () => {
		const response = await apiBase.get<IServerResponse<null>>('/user/logout');
		return response.data;
	},

	getUser: async (id: string) => {
		const response = await apiBase.get<IServerResponse<User>>(`/user?id=${id}`);
		return response.data;
	},

	updateProfile: async (data: any) => {
		const response = await apiBase.put<IServerResponse<User>>('/user', data);
		return response.data;
	},

	updatePhone: async (phone: string) => {
		const response = await apiBase.put<IServerResponse<{ phone: string }>>(
			'/user/phone',
			{ phone }
		);
		return response.data;
	},

	getAllUsers: async (page = 1, limit = 10) => {
		const response = await apiBase.get<
			IServerResponse<{ users: User[]; totalUsers: number; page: number }>
		>(`/user/all?page=${page}&limit=${limit}`);
		return response.data;
	},

	deleteUser: async (id: string) => {
		const response = await apiBase.delete<IServerResponse<null>>(
			`/user?id=${id}`
		);
		return response.data;
	},

	searchUser: async (type: 'email' | 'id', term: string) => {
		const response = await apiBase.get<IServerResponse<User>>(
			`/user/search?type=${type}&term=${term}`
		);
		return response.data;
	}
};
