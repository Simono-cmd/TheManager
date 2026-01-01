import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from "../pages/NotFoundPage.jsx";
import AdminBoardsPage from "../pages/admin/AdminBoardsPage.jsx"
import AdminTasksPage from "../pages/admin/AdminTasksPage.jsx"
import AdminUserPage from "../pages/admin/AdminUsersPage.jsx"
import MainPage from "../pages/MainPage.jsx";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<MainPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'guest']} />}>

                    <Route element={<Layout />}>

                        <Route path="dashboard" element={<DashboardPage />} />

                        <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
                            <Route path="profile" element={<ProfilePage />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="admin" element={<Navigate to="/admin/tasks" replace />} />
                            <Route path="admin/boards" element={<AdminBoardsPage />} />
                            <Route path="admin/tasks" element={<AdminTasksPage />} />
                            <Route path="admin/users" element={<AdminUserPage />} />
                        </Route>

                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage/>} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;