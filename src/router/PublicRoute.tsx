import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute() {
	const { isLoggedIn } = useAuth();

	if (isLoggedIn) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
}