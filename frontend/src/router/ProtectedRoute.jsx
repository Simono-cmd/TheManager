import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user) {
        return <Navigate to="/" replace/>;
    }

    // kontrolujemy dostęp do zasobów czy user ma wymaganą rolę do dostępu
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="*" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;