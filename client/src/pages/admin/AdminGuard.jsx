import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const key = localStorage.getItem("PRITI_ADMIN_KEY");
  if (!key) return <Navigate to="/admin" replace />;
  return children;
}
