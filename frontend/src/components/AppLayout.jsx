import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded px-3 py-2 text-sm font-medium ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-gray-800">Leave Management</div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              {user?.email ? user.email : "Signed in"}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white rounded border p-3 h-fit">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2">
            NAVIGATION
          </div>
          <nav className="space-y-1">
            <NavItem to="/dashboard" end>
              Dashboard
            </NavItem>
            <NavItem to="/admin">Admin Dashboard</NavItem>
            <div className="pt-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                EMPLOYEES
              </div>
              <NavItem to="/employees">Employees</NavItem>
            </div>
            <div className="pt-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                LEAVES
              </div>
              <NavItem to="/leaves/new">Request Leave</NavItem>
              <NavItem to="/leaves">Leave Requests</NavItem>
            </div>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

