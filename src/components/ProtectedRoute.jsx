// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (!allowedRoles.includes(role)) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;