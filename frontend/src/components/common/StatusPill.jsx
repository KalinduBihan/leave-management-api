export default function StatusPill({ status }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "bg-green-100 text-green-700"
      : s === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${cls}`}>
      {status || "unknown"}
    </span>
  );
}

