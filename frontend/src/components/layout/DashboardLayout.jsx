import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar'; // Importujemy Sidebar z tego samego folderu
// Upewnij się, że CSS jest załadowany globalnie lub zaimportuj go tutaj
import '../../assets/styles/dashboard-style.css';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    return (
        <>
            <header>
                <div id="title-container">
                    <img src="../../assets/media/logo.png" alt="logo" id="logo" />
                    <div id="title">TheManager</div>
                </div>

                <div className="profile-wrapper">
                    <img id="profile-icon" src="../../assets/media/profile.png" alt="Profile" />

                    <div className="dropdown">
                        <p>Hello, {user?.username}!</p>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/profile">Profile</Link></li> {/* Zmienilem sciezke na /profile bo masz płaską strukturę */}
                            {user?.role === 'admin' && (
                                <li><Link to="/admin">Admin mode</Link></li>
                            )}
                            <li><a href="#" onClick={handleLogout}>Log out</a></li>
                        </ul>
                    </div>
                </div>
            </header>

            <div className="container">
                <Sidebar />

                <div id="divider"></div>

                {/* Tutaj renderuje się BoardDetailsPage */}
                <Outlet />
            </div>
        </>
    );
};

export default DashboardLayout;