import { apiBase } from '@/lib/config';
import { IServerResponse, User, LoginRequest } from '@/types/api';

export const login = async (data: LoginRequest) => {
	const response = await apiBase.post<IServerResponse<{ user: User; accessToken: string }>>(
		'/user/login',
		data
	);
	return response.data;
};

export const logout = async () => {
	const response = await apiBase.get<IServerResponse<null>>('/user/logout');
	return response.data;
};

export const getProfile = async () => {
	const response = await apiBase.get<IServerResponse<User>>('/user/me');
	return response.data;
};

export const register = async (data: any) => {
	const response = await apiBase.post<IServerResponse<{ user: User; accessToken: string }>>(
		'/user',
		data
	);
	return response.data;
};
