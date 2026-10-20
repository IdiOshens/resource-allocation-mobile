import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "../../components/dashboards/AdminDashboard";
import DepartmentHeadDashboard from "../../components/dashboards/DepartmentHeadDashboard";
import InstructorDashboard from "../../components/dashboards/InstructorDashboard";
import StaffDashboard from "../../components/dashboards/StaffDashboard";
import StudentDashboard from "../../components/dashboards/StudentDashboard";

export default function DashboardScreen() {
  const { role } = useAuth();

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "department_head":
      return <DepartmentHeadDashboard />;
    case "instructor":
      return <InstructorDashboard />;
    case "staff":
      return <StaffDashboard />;
    default:
      return <StudentDashboard />;
  }
}
