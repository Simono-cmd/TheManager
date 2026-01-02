import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth.api.js';
import "../assets/styles/login-style.css";
import {useAuth} from "../hooks/useAuth.jsx";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const {loginAsGuest} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Register | TheManager"
    }, []);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    const handleGuestRedirect = () => {
        loginAsGuest();
        navigate('/dashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await registerUser(formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Register error');
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                <div className="header">
                    <img src="/media/logo.png" alt="logo" className="login-logo" />
                    <p className="app-title">TheManager</p>
                </div>

                <p className="login-text">Create Account</p>

                {error && <p className="error-message">{error}</p>}

                {success && (
                    <p style={{
                        color: '#4caf50',
                        textAlign: 'center',
                        marginBottom: '1em',
                        fontWeight: 'bold'}}>
                        Account created! Redirecting...
                    </p>
                )}

                {!success && (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <label className="login-form-text" htmlFor="username"> Username: </label>
                        <input type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required/>

                        <label className="login-form-text" htmlFor="email"> Email: </label>
                        <input type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required/>

                        <label className="login-form-text" htmlFor="password"> Password: </label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required/>
                            <span
                                className="toggle-password"
                                onClick={togglePasswordVisibility}>
                                👁
                            </span>
                        </div>
                        <button type="submit">Register</button>
                    </form>
                )}

                <div className="register-container">
                    <button className="btn-guest" onClick={handleLoginRedirect}>
                        Login instead
                    </button>

                    <button className="btn-guest" onClick={handleGuestRedirect}>
                        Continue as guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;