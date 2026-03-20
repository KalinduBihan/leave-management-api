import StatusPill from "../common/StatusPill";

export default function LeaveRequestsTable({
  requests,
  isLoading,
  employeeById,
  onApprove,
  onReject,
}) {
  const rows = requests ?? [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="text-left px-4 py-3">Employee</th>
            <th className="text-left px-4 py-3">Leave Type</th>
            <th className="text-left px-4 py-3">Dates</th>
            <th className="text-left px-4 py-3">Days</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading ? (
            <tr>
              <td className="px-4 py-4 text-gray-600" colSpan={6}>
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="px-4 py-4 text-gray-600" colSpan={6}>
                No leave requests found.
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const emp =
                r.employee || (employeeById ? employeeById.get(r.employee_id) : null);
              const empLabel = emp ? `${emp.first_name} ${emp.last_name}` : r.employee_id;
              const leaveTypeLabel = r.leave_type?.name || r.leave_type_id;
              const start = r.start_date ? String(r.start_date).slice(0, 10) : "-";
              const end = r.end_date ? String(r.end_date).slice(0, 10) : "-";
              const pending = (r.status || "").toLowerCase() === "pending";

              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{empLabel}</div>
                    <div className="text-xs text-gray-500">{r.employee_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{leaveTypeLabel}</div>
                    <div className="text-xs text-gray-500">{r.leave_type_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    {start} → {end}
                  </td>
                  <td className="px-4 py-3">{r.number_of_days}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    {pending ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onApprove?.(r)}
                          className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject?.(r)}
                          className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">—</div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

