import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Card({ title, value, valueClassName }) {
  return (
    <div className="bg-white rounded border p-4">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <div className={`text-2xl mt-2 ${valueClassName || ""}`}>{value}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/dashboard/stats");
        if (!mounted) return;
        setStats(res.data?.data ?? null);
      } catch (e) {
        if (!mounted) return;
        setError(
          e.response?.data?.message || e.message || "Failed to load admin stats",
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const distribution = useMemo(() => {
    const dist = stats?.leave_type_distribution || {};
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="text-sm text-gray-600">
          System-wide snapshot based on real database data.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title="Pending approvals"
          value={isLoading ? "..." : (stats?.pending_approvals ?? 0)}
        />
        <Card
          title="Approved (last 30 days)"
          value={isLoading ? "..." : (stats?.monthly_approved ?? 0)}
          valueClassName="text-green-600"
        />
        <Card
          title="Total employees"
          value={isLoading ? "..." : (stats?.total_employees ?? 0)}
          valueClassName="text-blue-700"
        />
      </div>

      <div className="bg-white rounded border p-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-800">Leave type distribution (year)</h3>
          <div className="text-xs text-gray-500">
            {stats?.timestamp ? String(stats.timestamp) : ""}
          </div>
        </div>

        {isLoading ? (
          <div className="text-gray-600 mt-4">Loading...</div>
        ) : distribution.length === 0 ? (
          <div className="text-gray-600 mt-4">No approved leaves yet.</div>
        ) : (
          <div className="mt-4 space-y-2">
            {distribution.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="text-sm text-gray-800">{name}</div>
                <div className="text-sm font-semibold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

