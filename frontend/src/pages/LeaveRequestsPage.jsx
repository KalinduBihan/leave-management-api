import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import LeaveRequestsTable from "../components/leaves/LeaveRequestsTable";

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [approverEmployeeId, setApproverEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const employeeById = useMemo(() => {
    const map = new Map();
    for (const e of employees ?? []) map.set(e.id, e);
    return map;
  }, [employees]);

  async function loadEmployees() {
    const res = await api.get("/employees?page=1&page_size=500");
    setEmployees(res.data?.data?.data ?? []);
  }

  async function loadRequests(currentPage = page) {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/leaves?page=${currentPage}&page_size=${pageSize}`);
      const payload = res.data?.data;
      setRequests(payload?.data ?? []);
      setTotalPages(payload?.total_pages ?? 1);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadEmployees();
      } catch {
        // ignore - used for labels and approver selection
      }
      if (mounted) await loadRequests(1);
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (req) => {
    setNotice("");
    setError("");
    try {
      if (!approverEmployeeId) {
        throw new Error("Approver employee is required to approve/reject.");
      }
      await api.post(
        `/leaves/${req.id}/approve?approver_employee_id=${encodeURIComponent(
          approverEmployeeId,
        )}`,
        { approval_comment: "" },
      );
      setNotice("Approved.");
      await loadRequests(page);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to approve");
    }
  };

  const handleReject = async (req) => {
    const reason = window.prompt("Rejection reason (min 5 chars):", "");
    if (!reason) return;
    setNotice("");
    setError("");
    try {
      if (!approverEmployeeId) {
        throw new Error("Approver employee is required to approve/reject.");
      }
      await api.post(
        `/leaves/${req.id}/reject?approver_employee_id=${encodeURIComponent(
          approverEmployeeId,
        )}`,
        { rejection_reason: reason },
      );
      setNotice("Rejected.");
      await loadRequests(page);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to reject");
    }
  };

  const handlePrev = async () => {
    const next = Math.max(1, page - 1);
    setPage(next);
    await loadRequests(next);
  };

  const handleNext = async () => {
    const next = Math.min(totalPages, page + 1);
    setPage(next);
    await loadRequests(next);
  };

  const approverOptions = useMemo(() => {
    return (employees ?? []).map((e) => ({
      id: e.id,
      label: `${e.first_name} ${e.last_name} (${e.email})`,
    }));
  }, [employees]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leave Requests</h2>
          <p className="text-sm text-gray-600">View and manage leave requests.</p>
        </div>

        <div className="bg-white rounded border p-3 min-w-[320px]">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Approver employee (required for approve/reject)
          </label>
          <select
            value={approverEmployeeId}
            onChange={(e) => setApproverEmployeeId(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="">Select approver employee</option>
            {approverOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
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

      <div className="bg-white rounded border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold text-gray-800">Requests</div>
          <div className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </div>
        </div>

        <LeaveRequestsTable
          requests={requests}
          isLoading={isLoading}
          employeeById={employeeById}
          onApprove={handleApprove}
          onReject={handleReject}
        />

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

