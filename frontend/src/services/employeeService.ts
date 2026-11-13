import axios from 'axios';
import type {
	Employee,
	EmployeeInput,
	EmployeeQuery,
	EmployeeListResponse,
} from '../types/employee';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});

export const employeeService = {
	async getAll(params: EmployeeQuery): Promise<EmployeeListResponse> {
		const { data } = await api.get<EmployeeListResponse>('/employees', {
			params,
		});
		return data;
	},

	async create(payload: EmployeeInput): Promise<Employee> {
		const { data } = await api.post<Employee>('/employees', payload);
		return data;
	},

	async update(id: number, payload: EmployeeInput): Promise<Employee> {
		const { data } = await api.put<Employee>(`/employees/${id}`, payload);
		return data;
	},

	async delete(id: number): Promise<void> {
		await api.delete(`/employees/${id}`);
	},
};
