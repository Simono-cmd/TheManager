import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Jeśli trwa ładowanie (sprawdzanie tokena), nic nie rób (czekaj)
    if (loading) return <p>Ładowanie...</p>;

    // 2. Jeśli user nie jest zalogowany -> KICK do /login
    // state={{ from: location }} pozwala wrócić tu, gdzie chciał wejść, po zalogowaniu
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Jeśli user jest zalogowany, ale nie ma odpowiedniej roli (np. User chce wejść do Admina)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Możesz tu przekierować na stronę "Brak dostępu" lub po prostu na dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Jeśli wszystko OK -> Wpuść do środka (wyświetl dziecko, czyli Outlet)
    return <Outlet />;
};

export default ProtectedRoute;