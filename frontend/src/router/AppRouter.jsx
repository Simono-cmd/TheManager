import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouty
import DashboardLayout from '../components/layout/DashboardLayout';


// Strony Publiczne (bezpośrednio w pages)
import MainPage from '../pages/MainPage';
import LoginPage from '../pages/LoginPage'; // Lub '../pages/LoginPage' jeśli przeniosłeś
import RegisterPage from '../pages/RegisterPage'; // j.w.

// Strony Dashboardu (bezpośrednio w pages)
import DashboardPage from '../pages/DashboardPage';       // Ekran powitalny
import BoardDetailsPage from '../pages/BoardDetailsPage'; // Zadania konkretnej tablicy

// Strony Admina (w folderze admin)
// import AdminBoardsPage from '../pages/admin/AdminBoardsPage'; // Odkomentuj jak będziesz miał ten plik

// Strażnik
import ProtectedRoute from './ProtectedRoute';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* --- PUBLICZNE --- */}
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />


                {/* --- UŻYTKOWNIK (DASHBOARD) --- */}
                <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>

                    {/* Layout zawiera Sidebar i Header */}
                    <Route path="/dashboard" element={<DashboardLayout />}>

                        {/* 1. Wchodzisz na czyste /dashboard -> Widzisz powitanie */}
                        <Route index element={<DashboardPage />} />

                        {/* 2. Klikasz w tablicę -> Widzisz zadania */}
                        <Route path="board/:boardId" element={<BoardDetailsPage />} />

                        {/* Profil */}
                        <Route path="profile" element={<h2>Twój Profil (Do zrobienia)</h2>} />
                    </Route>
                </Route>


                {/* 404 */}
                <Route path="*" element={<h2>404 - Nie znaleziono</h2>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;