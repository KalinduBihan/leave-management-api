import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ApplyLeaveForm({ onSubmitted }) {
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const employeeOptions = useMemo(
    () =>
      (employees ?? []).map((e) => ({
        id: e.id,
        label: `${e.first_name} ${e.last_name} (${e.email})`,
      })),
    [employees],
  );

  const leaveTypeOptions = useMemo(
    () =>
      (leaveTypes ?? []).map((lt) => ({
        id: lt.id,
        label: `${lt.name} (${lt.default_days_per_year}/yr)`,
      })),
    [leaveTypes],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const [empRes, ltRes] = await Promise.all([
          api.get("/employees?page=1&page_size=200"),
          api.get("/leave-types?page=1&page_size=200"),
        ]);
        if (!mounted) return;
        setEmployees(empRes.data?.data?.data ?? []);
        setLeaveTypes(ltRes.data?.data?.data ?? []);
      } catch (e) {
        if (!mounted) return;
        setError(
          e.response?.data?.message || e.message || "Failed to load form data",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice("");
    setError("");
    try {
      if (!employeeId) throw new Error("Please select an employee");
      if (!leaveTypeId) throw new Error("Please select a leave type");
      if (!startDate || !endDate) throw new Error("Start and end dates are required");

      const body = {
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
        attachment: attachment || undefined,
      };

      const res = await api.post(
        `/leaves?employee_id=${encodeURIComponent(employeeId)}`,
        body,
      );

      setNotice("Leave request submitted.");
      setLeaveTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setAttachment("");
      onSubmitted?.(res.data?.data);
    } catch (e2) {
      setError(e2.response?.data?.message || e2.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Apply Leave</h3>
          <p className="text-sm text-gray-600">
            Choose dates using the date picker and submit.
          </p>
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

      {isLoading ? (
        <div className="mt-4 text-gray-600">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Employee">
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Select employee</option>
                {employeeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Leave type">
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
              >
                <option value="">Select leave type</option>
                {leaveTypeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Start date">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            />
          </Field>

          <Field label="End date">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Reason (min 10 chars)">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="Explain why leave is needed..."
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Attachment (optional - URL/string)">
              <input
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500"
                placeholder="https://... or reference"
              />
            </Field>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              disabled={submitting}
              type="submit"
              className="bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

