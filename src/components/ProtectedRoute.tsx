import React from "react";
import { Navigate } from "react-router-dom";
import { useGlobalContext } from "../hooks/useGlobalContext";
import Admin from "@/pages/Admin";

interface ProtectedRouteProps {
    requiredRole: 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const { user, authLoading } = useGlobalContext();

    // 1. Wait for Auth Check to finish
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 animate-pulse">Verifying access...</p>
            </div>
        );
    }

    // 2. Not Logged In -> Redirect to Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Role Mismatch -> Redirect to Store
    if (user.role !== requiredRole ) {
        return <Navigate to="/" replace />;
    }

    // 4. Access Granted -> Render child routes
    return <Admin />;
};

export default ProtectedRoute;