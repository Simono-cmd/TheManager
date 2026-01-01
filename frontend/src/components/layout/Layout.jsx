import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../assets/styles/dashboard-style.css';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/');
    };

    return (
        <div className="app-wrapper">
            <header>
                <div id="title-container">
                    <img src="/media/logo.png" alt="logo" id="logo" />
                    <div id="title">TheManager</div>
                </div>

                {(user?.role === 'admin' && location.pathname.startsWith('/admin')) && (
                    <nav className="admin-nav">
                        <Link to="/admin/boards" className="admin-link">Boards</Link>
                        <Link to="/admin/users" className="admin-link">Users</Link>
                        <Link to="/admin/tasks" className="admin-link">Tasks</Link>
                    </nav>
                )}

                <div className="profile-wrapper">
                    <img id="profile-icon" src="/media/profile.png" alt="Profile" />
                    <div className="dropdown">
                        <p style={{borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '5px'}}>
                            Hello, <strong>{user?.username}</strong>!
                        </p>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>

                            {user.role !== 'guest' && (
                                <li><Link to="/profile">Profile</Link></li>
                            )}

                            {user?.role === 'admin' && (
                                <li><Link to="/admin/boards">Admin Panel</Link></li>
                            )}

                            <li style={{borderTop: '1px solid #eee', marginTop: '5px', paddingTop: '5px'}}>
                                <a href="#" onClick={handleLogout} style={{color: '#d32f2f'}}>Log out</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            <div className="content-wrapper">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;