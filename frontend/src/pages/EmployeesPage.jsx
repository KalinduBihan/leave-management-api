import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [createForm, setCreateForm] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    manager_id: "",
    hire_date: "",
  });

  const deptOptions = useMemo(
    () => departments?.map((d) => ({ id: d.id, name: d.name })) ?? [],
    [departments],
  );

  async function loadDepartments() {
    const res = await api.get("/departments?page=1&page_size=100");
    const data = res.data?.data?.data ?? [];
    setDepartments(data);
  }

  async function loadEmployees(currentPage = page) {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(
        `/employees?page=${currentPage}&page_size=${pageSize}`,
      );
      const payload = res.data?.data;
      setEmployees(payload?.data ?? []);
      setTotalPages(payload?.total_pages ?? 1);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to load employees",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadDepartments();
      } catch {
        // ignore - departments used only for dropdowns
      }
      if (mounted) await loadEmployees(1);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setNotice("");
    setError("");
    try {
      const body = {
        user_id: createForm.user_id,
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        email: createForm.email,
        phone: createForm.phone || undefined,
        department_id: createForm.department_id,
        manager_id: createForm.manager_id ? createForm.manager_id : undefined,
        hire_date: createForm.hire_date,
      };

      await api.post("/employees", body);
      setNotice("Employee created.");
      setCreateForm({
        user_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: "",
        manager_id: "",
        hire_date: "",
      });
      await loadEmployees(1);
      setPage(1);
    } catch (e2) {
      setError(
        e2.response?.data?.message || e2.message || "Failed to create employee",
      );
    }
  };

  const handleToggleActive = async (emp) => {
    setNotice("");
    setError("");
    try {
      await api.put(`/employees/${emp.id}`, { is_active: !emp.is_active });
      setNotice("Employee updated.");
      await loadEmployees(page);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to update employee",
      );
    }
  };

  const handleDelete = async (emp) => {
    const ok = window.confirm(
      `Delete employee ${emp.first_name} ${emp.last_name}?`,
    );
    if (!ok) return;
    setNotice("");
    setError("");
    try {
      await api.delete(`/employees/${emp.id}`);
      setNotice("Employee deleted.");
      await loadEmployees(page);
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Failed to delete employee",
      );
    }
  };

  const handlePrev = async () => {
    const next = Math.max(1, page - 1);
    setPage(next);
    await loadEmployees(next);
  };

  const handleNext = async () => {
    const next = Math.min(totalPages, page + 1);
    setPage(next);
    await loadEmployees(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
        <p className="text-sm text-gray-600">
          List, activate/deactivate, and manage employees.
        </p>
      </div>

      {(error || notice) && (
        <div className="space-y-2">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {notice && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {notice}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded border p-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-800">Create Employee</h3>
          <div className="text-xs text-gray-500">
            Requires an existing User ID (UUID)
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="User ID"
            value={createForm.user_id}
            onChange={(v) => setCreateForm((s) => ({ ...s, user_id: v }))}
            placeholder="uuid"
          />
          <TextInput
            label="Email"
            value={createForm.email}
            onChange={(v) => setCreateForm((s) => ({ ...s, email: v }))}
            placeholder="employee@email.com"
            type="email"
          />
          <TextInput
            label="First name"
            value={createForm.first_name}
            onChange={(v) => setCreateForm((s) => ({ ...s, first_name: v }))}
            placeholder="First"
          />
          <TextInput
            label="Last name"
            value={createForm.last_name}
            onChange={(v) => setCreateForm((s) => ({ ...s, last_name: v }))}
            placeholder="Last"
          />
          <TextInput
            label="Phone (optional)"
            value={createForm.phone}
            onChange={(v) => setCreateForm((s) => ({ ...s, phone: v }))}
            placeholder="07xxxxxxxx"
          />
          <TextInput
            label="Hire date"
            value={createForm.hire_date}
            onChange={(v) => setCreateForm((s) => ({ ...s, hire_date: v }))}
            type="date"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={createForm.department_id}
              onChange={(e) =>
                setCreateForm((s) => ({ ...s, department_id: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">Select department</option>
              {deptOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <TextInput
            label="Manager ID (optional)"
            value={createForm.manager_id}
            onChange={(v) => setCreateForm((s) => ({ ...s, manager_id: v }))}
            placeholder="uuid"
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Employee List</h3>
          <div className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Active</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-600" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-600" colSpan={4}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{emp.id}</div>
                    </td>
                    <td className="px-4 py-3">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          emp.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(emp)}
                          className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50"
                        >
                          {emp.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={page <= 1}
            className="text-sm px-3 py-1.5 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={page >= totalPages}
            className="text-sm px-3 py-1.5 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

