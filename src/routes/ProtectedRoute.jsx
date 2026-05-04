import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children, allowedRoles}) {
    const userRole = localStorage.getItem("userRole");

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}