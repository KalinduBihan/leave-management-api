import { useMemo, useState } from "react";
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

export default function AddEmployeeForm({
  departments,
  onCreated,
  defaultDepartmentId = "",
}) {
  const [form, setForm] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: defaultDepartmentId,
    manager_id: "",
    hire_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const deptOptions = useMemo(
    () => departments?.map((d) => ({ id: d.id, name: d.name })) ?? [],
    [departments],
  );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const body = {
        user_id: form.user_id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        department_id: form.department_id,
        manager_id: form.manager_id ? form.manager_id : undefined,
        hire_date: form.hire_date,
      };
      const res = await api.post("/employees", body);
      setNotice("Employee created.");
      setForm({
        user_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: defaultDepartmentId,
        manager_id: "",
        hire_date: "",
      });
      onCreated?.(res.data?.data);
    } catch (e2) {
      setError(
        e2.response?.data?.message || e2.message || "Failed to create employee",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded border p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-gray-800">Add Employee</h3>
        <div className="text-xs text-gray-500">
          Requires an existing User ID (UUID)
        </div>
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
          label="User ID"
          value={form.user_id}
          onChange={(v) => setForm((s) => ({ ...s, user_id: v }))}
          placeholder="uuid"
        />
        <TextInput
          label="Email"
          value={form.email}
          onChange={(v) => setForm((s) => ({ ...s, email: v }))}
          placeholder="employee@email.com"
          type="email"
        />
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
          label="Phone (optional)"
          value={form.phone}
          onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          placeholder="07xxxxxxxx"
        />
        <TextInput
          label="Hire date"
          value={form.hire_date}
          onChange={(v) => setForm((s) => ({ ...s, hire_date: v }))}
          type="date"
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
          value={form.manager_id}
          onChange={(v) => setForm((s) => ({ ...s, manager_id: v }))}
          placeholder="uuid"
        />

        <div className="md:col-span-2 flex justify-end">
          <button
            disabled={submitting}
            type="submit"
            className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

