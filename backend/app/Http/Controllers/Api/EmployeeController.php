<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
            'sort_by' => ['sometimes', 'string', Rule::in(['name', 'email', 'role', 'created_at'])],
            'sort_dir' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
        ]);

        $query = Employee::query();
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDir = $validated['sort_dir'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;
        $employees = $query
            ->orderBy($sortBy, $sortDir)
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
        return response()->json($employees);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email'],
            'role' => ['required', 'string', 'max:100'],
        ]);
        $employee = Employee::create($validated);
        return response()->json($employee, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employee->id),
            ],
            'role' => ['required', 'string', 'max:100'],
        ]);

        $employee->update($validated);
        return response()->json($employee);
    }

    public function destroy(string $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();
        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }
}
