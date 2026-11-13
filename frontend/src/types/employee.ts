export interface Employee {
	id: number;
	name: string;
	email: string;
	role: string;
	created_at: string;
	updated_at: string;
}

export type EmployeeInput = Pick<Employee, 'name' | 'email' | 'role'>;

export interface EmployeeListResponse {
	data: Employee[];
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
	from: number | null;
	to: number | null;
}

export interface EmployeeQuery {
	page: number;
	per_page: number;
	search: string;
	sort_by: 'name' | 'email' | 'role' | 'created_at';
	sort_dir: 'asc' | 'desc';
}
