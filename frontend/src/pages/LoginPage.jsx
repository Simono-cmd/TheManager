import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../api/auth.api.js';
import "../assets/styles/login-style.css";

const LoginPage = () => {
    // Stan formularza
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // Stan dla oka
    const [error, setError] = useState('');

    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/dashboard');
    };

    // Obsługa wpisywania
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Przełączanie widoczności hasła
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Wysyłanie formularza
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await loginUser(formData.username, formData.password);

            if (response.token && response.user) {
                login(response.user, response.token);
                // Przekierowanie w zależności od roli
                if (response.user.role === 'admin') {
                    navigate('/admin/boards');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError("Błąd serwera (brak tokena).");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Błąd logowania');
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <div className="header">
                    <img src="../assets/media/logo.png" alt="logo" className="login-logo" />
                    <p className="app-title">TheManager</p><br/>
                </div>

                <p className="login-text">Zaloguj się do aplikacji</p><br/>

                {error && <p style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-form-text" htmlFor="username"> Username: </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    /><br/>

                    <label className="login-form-text" htmlFor="password"> Password: </label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"} // Tu dzieje się magia oka
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="toggle-password"
                            id="togglePassword"
                            onClick={togglePasswordVisibility}
                            style={{cursor: 'pointer'}} // Dodajemy kursor rączki
                        >
                            {showPassword ? '🙈' : '👁'}
                        </span>
                    </div>
                    <button type="submit">Zaloguj się</button>
                </form>

                <button
                    className="login-guest"
                    onClick={handleGuestLogin}
                    style={{ marginTop: '10px', width: '100%', cursor: 'pointer' }}
                >
                    Zaloguj się jako gość
                </button>


                <div style={{textAlign: 'center', marginTop: '15px'}}>
                    <Link to="/register" style={{textDecoration: 'none', color: '#333'}}>Nie masz konta? Zarejestruj się</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;