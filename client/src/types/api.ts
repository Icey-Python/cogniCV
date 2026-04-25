export enum UserRole {
	ADMIN = 'admin',
	RECRUITER = 'recruiter'
}

export interface User {
	_id: string;
	name: string;
	image: string;
	email: string;
	phone: string;
	role: UserRole;
	lastLogin: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IServerResponse<T = any> {
	status: 'success' | 'error';
	message: string;
	data: T;
}

// Request Types
export interface LoginRequest {
	email: string;
	password: string;
}
