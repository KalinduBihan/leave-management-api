// pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function StatCard({ title, value, valueClassName, subtext }) {
  return (
    <div className="bg-white rounded border p-4">
      <div className="text-sm font-semibold text-gray-800">{title}</div>
      <div className={`text-2xl mt-2 ${valueClassName || ""}`}>{value}</div>
      {subtext ? <div className="text-xs text-gray-500 mt-1">{subtext}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const res = await api.get("/dashboard/stats");
        const data = res.data?.data ?? null;
        if (isMounted) setStats(data);
      } catch (e) {
        const message =
          e.response?.data?.message ||
          e.message ||
          "Failed to load dashboard stats";
        if (isMounted) setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const leaveTypeChartData = Object.entries(
    stats?.leave_type_distribution || {},
  ).map(([name, count]) => ({
    name,
    count,
  }));

  const totalFromDistribution = leaveTypeChartData.reduce(
    (sum, row) => sum + (Number(row.count) || 0),
    0,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Welcome, {user?.first_name || "User"} 👋
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={isLoading ? "..." : (stats?.total_employees ?? 0)}
          valueClassName="text-blue-700"
        />
        <StatCard
          title="Active Employees"
          value={isLoading ? "..." : (stats?.active_employees ?? 0)}
          valueClassName="text-indigo-700"
        />
        <StatCard
          title="Pending Approvals"
          value={isLoading ? "..." : (stats?.pending_approvals ?? 0)}
        />
        <StatCard
          title="Approved (Last 30 Days)"
          value={isLoading ? "..." : (stats?.monthly_approved ?? 0)}
          valueClassName="text-green-600"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-gray-800">
                Leave Type Distribution (Approved)
              </div>
              <div className="text-xs text-gray-500">
                Total approved this year:{" "}
                {isLoading ? "..." : totalFromDistribution}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {stats?.timestamp ? String(stats.timestamp) : ""}
            </div>
          </div>

          <div className="h-72 mt-4">
            {isLoading ? (
              <div className="text-gray-600">Loading chart...</div>
            ) : leaveTypeChartData.length === 0 ? (
              <div className="text-gray-600">No approved leaves yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...leaveTypeChartData].sort((a, b) => b.count - a.count)}
                  margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Approved" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded border p-4">
          <div className="font-semibold text-gray-800">Quick summary</div>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <div>Total pending (server)</div>
              <div className="font-semibold">
                {isLoading ? "..." : (stats?.total_pending ?? 0)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Pending approvals</div>
              <div className="font-semibold">
                {isLoading ? "..." : (stats?.pending_approvals ?? 0)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>Approved (last 30 days)</div>
              <div className="font-semibold">
                {isLoading ? "..." : (stats?.monthly_approved ?? 0)}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Tip: this dashboard is powered by `GET /api/v1/dashboard/stats`.
          </div>
        </div>
      </div>
    </div>
  );
}
