function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onToggleActive,
  onDelete,
}) {
  const rows = employees ?? [];

  return (
    <div className="bg-white rounded border overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Employee List</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Active</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={5}>
                  No employees found.
                </td>
              </tr>
            ) : (
              rows.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">
                      {emp.first_name} {emp.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{emp.id}</div>
                  </td>
                  <td className="px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3">{emp.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusPill active={!!emp.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit?.(emp)}
                        className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleActive?.(emp)}
                        className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50"
                      >
                        {emp.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(emp)}
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
    </div>
  );
}

