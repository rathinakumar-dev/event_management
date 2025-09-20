import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ allowedRoles }) {
  const { auth, loading } = useAuth();

  if (loading) return <div>Loading...</div>;  

  if (!auth || !auth.accessToken) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return auth.role === "admin"
      ? <Navigate to="/admin_dashboard" replace />
      : <Navigate to="/user_dashboard" replace />;
  }

  return <Outlet />;  
}
