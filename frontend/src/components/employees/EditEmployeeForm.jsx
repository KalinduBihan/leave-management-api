import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

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

export default function EditEmployeeForm({
  employee,
  departments,
  onSaved,
  onCancel,
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    department_id: "",
    manager_id: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!employee) return;
    setForm({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      phone: employee.phone || "",
      department_id: employee.department_id || "",
      manager_id: employee.manager_id || "",
      is_active: employee.is_active ?? true,
    });
    setError("");
    setNotice("");
  }, [employee]);

  const deptOptions = useMemo(
    () => departments?.map((d) => ({ id: d.id, name: d.name })) ?? [],
    [departments],
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!employee?.id) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const body = {
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
        phone: form.phone || undefined,
        department_id: form.department_id ? form.department_id : undefined,
        manager_id: form.manager_id ? form.manager_id : undefined,
        is_active: !!form.is_active,
      };
      const res = await api.put(`/employees/${employee.id}`, body);
      setNotice("Employee updated.");
      onSaved?.(res.data?.data);
    } catch (e2) {
      setError(
        e2.response?.data?.message || e2.message || "Failed to update employee",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="bg-white rounded border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Edit Employee</h3>
          <div className="text-xs text-gray-500">{employee.id}</div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      {(error || notice) && (
        <div className="mt-3 space-y-2">
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

      <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="First name"
          value={form.first_name}
          onChange={(v) => setForm((s) => ({ ...s, first_name: v }))}
          placeholder="First"
        />
        <TextInput
          label="Last name"
          value={form.last_name}
          onChange={(v) => setForm((s) => ({ ...s, last_name: v }))}
          placeholder="Last"
        />
        <TextInput
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          placeholder="07xxxxxxxx"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={form.department_id}
            onChange={(e) =>
              setForm((s) => ({ ...s, department_id: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">No department</option>
            {deptOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <TextInput
          label="Manager ID (optional)"
          value={form.manager_id}
          onChange={(v) => setForm((s) => ({ ...s, manager_id: v }))}
          placeholder="uuid"
        />

        <div className="flex items-center gap-2 pt-7">
          <input
            id="is_active"
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) =>
              setForm((s) => ({ ...s, is_active: e.target.checked }))
            }
            className="h-4 w-4"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Active
          </label>
        </div>

        <div className="md:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

