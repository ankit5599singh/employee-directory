import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
	Search,
	Plus,
	Users,
	Pencil,
	Trash2,
	X,
	Mail,
	BriefcaseBusiness,
	LoaderCircle,
	UserRound,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	RefreshCw,
} from 'lucide-react';
import { employeeService } from './services/employeeService';
import type {
	Employee,
	EmployeeInput,
	EmployeeListResponse,
	EmployeeQuery,
} from './types/employee';

const emptyForm: EmployeeInput = {
	name: '',
	email: '',
	role: '',
};

const inputClass =
	'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

function getErrorMessage(error: unknown): string {
	if (typeof error === 'object' && error !== null && 'response' in error) {
		const response = (
			error as {
				response?: {
					data?: {
						message?: string;
						errors?: Record<string, string[]>;
					};
				};
			}
		).response;

		const firstValidationError = response?.data?.errors
			? Object.values(response.data.errors)[0]?.[0]
			: undefined;

		return (
			firstValidationError ??
			response?.data?.message ??
			'Something went wrong. Please try again.'
		);
	}

	return 'Unable to connect to the server. Please check your connection.';
}

function initials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}

function EmployeeModal({
	employee,
	onClose,
	onSave,
}: {
	employee: Employee | null;
	onClose: () => void;
	onSave: (input: EmployeeInput) => Promise<void>;
}) {
	const [form, setForm] = useState<EmployeeInput>(
		employee
			? {
					name: employee.name,
					email: employee.email,
					role: employee.role,
				}
			: emptyForm,
	);

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setSaving(true);

		try {
			await onSave({
				name: form.name.trim(),
				email: form.email.trim(),
				role: form.role.trim(),
			});
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget && !saving) onClose();
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="employee-modal-title"
				className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
			>
				<div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
					<div>
						<h2
							id="employee-modal-title"
							className="text-xl font-bold tracking-tight text-slate-900"
						>
							{employee ? 'Edit employee' : 'Add employee'}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							{employee
								? 'Update the employee details below.'
								: 'Enter the details to add a team member.'}
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						aria-label="Close form"
						className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
					>
						<X size={19} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5 p-6">
					<div>
						<label
							htmlFor="employee-name"
							className="text-sm font-semibold text-slate-700"
						>
							Full name
						</label>
						<input
							id="employee-name"
							className={inputClass}
							placeholder="e.g. Priya Sharma"
							autoComplete="name"
							maxLength={255}
							required
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>

					<div>
						<label
							htmlFor="employee-email"
							className="text-sm font-semibold text-slate-700"
						>
							Email address
						</label>
						<input
							id="employee-email"
							type="email"
							className={inputClass}
							placeholder="priya@company.com"
							autoComplete="email"
							maxLength={255}
							required
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
						/>
					</div>

					<div>
						<label
							htmlFor="employee-role"
							className="text-sm font-semibold text-slate-700"
						>
							Job role
						</label>
						<input
							id="employee-role"
							className={inputClass}
							placeholder="e.g. Software Engineer"
							maxLength={100}
							required
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
						/>
					</div>

					{error && (
						<div
							role="alert"
							className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
						>
							{error}
						</div>
					)}

					<div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
						<button
							type="button"
							disabled={saving}
							onClick={onClose}
							className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						>
							Cancel
						</button>

						<button
							type="submit"
							disabled={saving}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
						>
							{saving && <LoaderCircle size={16} className="animate-spin" />}
							{saving
								? 'Saving...'
								: employee
									? 'Save changes'
									: 'Add employee'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default function App() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [pagination, setPagination] = useState<EmployeeListResponse | null>(
		null,
	);

	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState('');

	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);

	const [sortBy, setSortBy] = useState<EmployeeQuery['sort_by']>('created_at');
	const [sortDir, setSortDir] = useState<EmployeeQuery['sort_dir']>('desc');

	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
		null,
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [notice, setNotice] = useState('');

	const loadEmployees = useCallback(async () => {
		setLoading(true);
		setLoadError('');

		try {
			const result = await employeeService.getAll({
				page,
				per_page: perPage,
				search: debouncedSearch,
				sort_by: sortBy,
				sort_dir: sortDir,
			});

			setEmployees(result.data);
			setPagination(result);
		} catch (error) {
			setLoadError(getErrorMessage(error));
		} finally {
			setLoading(false);
		}
	}, [page, perPage, debouncedSearch, sortBy, sortDir]);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setPage(1);
			setDebouncedSearch(search.trim());
		}, 300);

		return () => window.clearTimeout(timeout);
	}, [search]);

	useEffect(() => {
		void loadEmployees();
	}, [loadEmployees]);

	useEffect(() => {
		if (!notice) return;

		const timeout = window.setTimeout(() => setNotice(''), 4000);
		return () => window.clearTimeout(timeout);
	}, [notice]);

	async function handleSave(input: EmployeeInput) {
		if (selectedEmployee) {
			await employeeService.update(selectedEmployee.id, input);
			setNotice('Employee updated successfully.');
		} else {
			await employeeService.create(input);
			setNotice('Employee added successfully.');
		}

		setModalOpen(false);
		setSelectedEmployee(null);

		if (page !== 1) {
			setPage(1);
		} else {
			await loadEmployees();
		}
	}

	async function handleDelete(employee: Employee) {
		const confirmed = window.confirm(
			`Are you sure you want to delete ${employee.name}?`,
		);

		if (!confirmed) return;

		try {
			await employeeService.delete(employee.id);
			setNotice('Employee deleted successfully.');

			if (employees.length === 1 && page > 1) {
				setPage((current) => current - 1);
			} else {
				await loadEmployees();
			}
		} catch (error) {
			setNotice(getErrorMessage(error));
		}
	}

	function openAddModal() {
		setSelectedEmployee(null);
		setModalOpen(true);
	}

	function openEditModal(employee: Employee) {
		setSelectedEmployee(employee);
		setModalOpen(true);
	}

	const totalEmployees = pagination?.total ?? 0;
	const totalPages = pagination?.last_page ?? 1;
	const currentPage = pagination?.current_page ?? page;

	return (
		<div className="min-h-screen bg-[#f7f8fc] text-slate-800">
			<header className="border-b border-slate-200/80 bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
							<Users size={21} />
						</div>
						<div>
							<h1 className="text-base font-bold tracking-tight text-slate-900">
								Agaetis Technologies
							</h1>
							<p className="text-xs text-slate-500">Employee directory</p>
						</div>
					</div>

					<div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex">
						<span className="h-2 w-2 rounded-full bg-emerald-500" />
						Team management
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
				<div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
					<div>
						<p className="mb-2 text-sm font-semibold text-indigo-600">
							WORKSPACE / PEOPLE
						</p>
						<h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
							Employee directory
						</h2>
						<p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
							Manage your team, keep employee information organized, and find
							the right person in seconds.
						</p>
					</div>

					<button
						onClick={openAddModal}
						className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
					>
						<Plus size={18} />
						Add employee
					</button>
				</div>

				<div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500">
									Total employees
								</p>
								<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
									{totalEmployees}
								</p>
								<p className="mt-2 text-xs text-slate-500">
									{debouncedSearch
										? 'Employees matching your search'
										: 'Registered team members'}
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
								<Users size={23} />
							</div>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500">
									Current page
								</p>
								<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
									{currentPage}
									<span className="ml-1 text-lg font-medium text-slate-400">
										/ {totalPages}
									</span>
								</p>
								<p className="mt-2 text-xs text-slate-500">
									{pagination?.per_page ?? perPage} records per page
								</p>
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
								<Search size={22} />
							</div>
						</div>
					</div>
				</div>

				{notice && (
					<div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
						<span role="status">{notice}</span>
						<button
							onClick={() => setNotice('')}
							aria-label="Dismiss notification"
							className="rounded p-1 hover:bg-indigo-100"
						>
							<X size={16} />
						</button>
					</div>
				)}

				<section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
					<div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:px-6">
						<div>
							<h3 className="text-base font-bold text-slate-900">
								All employees
							</h3>
							<p className="mt-1 text-sm text-slate-500">
								Search, sort, and manage your team members.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1">
								<Search
									size={18}
									className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									aria-label="Search employees by name or email"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Search name or email..."
									className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
								/>
							</div>

							<select
								aria-label="Sort employees by"
								value={sortBy}
								onChange={(e) => {
									setPage(1);
									setSortBy(e.target.value as EmployeeQuery['sort_by']);
								}}
								className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
							>
								<option value="created_at">Date added</option>
								<option value="name">Name</option>
								<option value="email">Email</option>
								<option value="role">Job role</option>
							</select>

							<button
								type="button"
								onClick={() => {
									setPage(1);
									setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
								}}
								title="Change sort direction"
								className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
							>
								<ArrowUpDown size={16} />
								{sortDir === 'asc' ? 'Ascending' : 'Descending'}
							</button>
						</div>
					</div>

					{loadError ? (
						<div className="m-5 rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
							<p>{loadError}</p>
							<button
								onClick={() => void loadEmployees()}
								className="mt-3 inline-flex items-center gap-2 font-semibold underline"
							>
								<RefreshCw size={14} />
								Try again
							</button>
						</div>
					) : loading ? (
						<div
							className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-slate-500"
							aria-live="polite"
						>
							<LoaderCircle
								size={28}
								className="animate-spin text-indigo-600"
							/>
							<p className="text-sm">Loading employees...</p>
						</div>
					) : employees.length === 0 ? (
						<div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
							<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
								{search.trim() ? <Search size={25} /> : <UserRound size={25} />}
							</div>

							<h4 className="font-semibold text-slate-900">
								{search.trim() ? 'No matching employees' : 'No employees yet'}
							</h4>

							<p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
								{search.trim()
									? 'Try another name or email, or clear your search.'
									: 'Add your first team member to get your directory started.'}
							</p>

							{search.trim() ? (
								<button
									onClick={() => setSearch('')}
									className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
								>
									Clear search
								</button>
							) : (
								<button
									onClick={openAddModal}
									className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
								>
									<Plus size={16} />
									Add your first employee
								</button>
							)}
						</div>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full min-w-190 text-left">
									<thead>
										<tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
											<th className="px-6 py-3.5">Employee</th>
											<th className="px-6 py-3.5">Email address</th>
											<th className="px-6 py-3.5">Job role</th>
											<th className="px-6 py-3.5">Date added</th>
											<th className="px-6 py-3.5 text-right">Actions</th>
										</tr>
									</thead>

									<tbody className="divide-y divide-slate-100">
										{employees.map((employee) => (
											<tr
												key={employee.id}
												className="transition hover:bg-slate-50/70"
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
															{initials(employee.name)}
														</div>
														<span className="font-semibold text-slate-800">
															{employee.name}
														</span>
													</div>
												</td>

												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-2 text-sm text-slate-600">
														<Mail
															size={15}
															className="shrink-0 text-slate-400"
														/>
														{employee.email}
													</span>
												</td>

												<td className="px-6 py-4">
													<span className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
														<BriefcaseBusiness size={13} />
														{employee.role}
													</span>
												</td>

												<td className="px-6 py-4 text-sm text-slate-500">
													{new Date(employee.created_at).toLocaleDateString(
														undefined,
														{
															day: '2-digit',
															month: 'short',
															year: 'numeric',
														},
													)}
												</td>

												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-2">
														<button
															onClick={() => openEditModal(employee)}
															aria-label={`Edit ${employee.name}`}
															title="Edit employee"
															className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
														>
															<Pencil size={16} />
														</button>

														<button
															onClick={() => void handleDelete(employee)}
															aria-label={`Delete ${employee.name}`}
															title="Delete employee"
															className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
														>
															<Trash2 size={16} />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
								<div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
									<span>
										Showing{' '}
										<span className="font-semibold text-slate-800">
											{pagination?.from ?? 0}–{pagination?.to ?? 0}
										</span>{' '}
										of{' '}
										<span className="font-semibold text-slate-800">
											{totalEmployees}
										</span>
									</span>

									<span className="hidden text-slate-300 sm:inline">|</span>

									<label className="flex items-center gap-2">
										Rows
										<select
											value={perPage}
											onChange={(e) => {
												setPerPage(Number(e.target.value));
												setPage(1);
											}}
											className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400"
										>
											<option value={5}>5</option>
											<option value={10}>10</option>
											<option value={25}>25</option>
											<option value={50}>50</option>
										</select>
									</label>
								</div>

								<div className="flex items-center justify-between gap-2 sm:justify-end">
									<button
										type="button"
										onClick={() => setPage((current) => current - 1)}
										disabled={loading || currentPage <= 1}
										className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<ChevronLeft size={16} />
										Previous
									</button>

									<span className="min-w-20 text-center text-sm text-slate-600">
										Page{' '}
										<span className="font-semibold text-slate-900">
											{currentPage}
										</span>{' '}
										of{' '}
										<span className="font-semibold text-slate-900">
											{totalPages}
										</span>
									</span>

									<button
										type="button"
										onClick={() => setPage((current) => current + 1)}
										disabled={loading || currentPage >= totalPages}
										className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
									>
										Next
										<ChevronRight size={16} />
									</button>
								</div>
							</div>
						</>
					)}
				</section>

				<footer className="py-6 text-center text-xs text-slate-400">
					Agaetis Technologies · Employee management made simple
				</footer>
			</main>

			{modalOpen && (
				<EmployeeModal
					key={selectedEmployee?.id ?? 'new'}
					employee={selectedEmployee}
					onClose={() => {
						setModalOpen(false);
						setSelectedEmployee(null);
					}}
					onSave={handleSave}
				/>
			)}
		</div>
	);
}
