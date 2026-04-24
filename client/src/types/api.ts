// API Response Types
export interface ApiResponse<T = any> {
	status: 'success' | 'error';
	message: string;
	data?: T;
}
export interface PaginatedResponse<T> {
	status: 'success' | 'error';
	message: string;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}
