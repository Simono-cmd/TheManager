import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginUser } from '../api/auth.api.js';
import "../assets/styles/login-style.css";

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestLogin = () => {
        loginAsGuest();
        navigate('/dashboard');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    //obsługa logowania
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await loginUser(formData.username, formData.password);

            if (response.token && response.user) {
                login(response.user, response.token); //login z useAuth
                navigate('/dashboard');
            } else {
                setError("ERROR: no user token");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error logging in');
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                <div className="header">
                    <img src="/media/logo.png" alt="logo" className="login-logo" />
                    <p className="app-title">TheManager</p>
                </div>

                <p className="login-text">Login</p>

                {error && <p className="error-message">{error}</p>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="login-form-text" htmlFor="username"> Username: </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <label className="login-form-text" htmlFor="password"> Password: </label>
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
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
                        >
                            👁
                        </span>
                    </div>
                    <button type="submit">Login</button>
                </form>

                <div className="register-container">
                    <button className="btn-guest" onClick={handleGuestLogin}>
                        Continue as guest
                    </button>

                    <button className="btn-guest" onClick={handleRegister}>
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;