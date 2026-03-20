import ApplyLeaveForm from "../components/leaves/ApplyLeaveForm";

export default function LeaveRequestFormPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Request Leave</h2>
        <p className="text-sm text-gray-600">
          Create a leave request for an employee.
        </p>
      </div>

      <ApplyLeaveForm />
    </div>
  );
}

