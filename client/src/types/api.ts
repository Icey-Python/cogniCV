export enum UserRole {
	ADMIN = 'admin',
	RECRUITER = 'recruiter'
}

export interface User {
	_id: string;
	name: string;
	email: string;
	phone: string;
	role: UserRole;
	lastLogin: string;
	createdAt: string;
	updatedAt: string;
}

export interface IServerResponse<T = any> {
	status: 'success' | 'error';
	message: string;
	data: T;
}
