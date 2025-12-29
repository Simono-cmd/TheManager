import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth.api.js';
import "../assets/styles/login-style.css"; // Używamy tego samego stylu co login

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
            setError(err.response?.data?.message || 'Błąd rejestracji');
        }
    };

    return (
        <div className="login">
            <div className="login-container">
                <div className="header">
                    <img src="../assets/media/logo.png" alt="logo" className="login-logo" />
                    <p className="app-title">TheManager</p><br/>
                </div>

                <p className="login-text">Utwórz nowe konto</p><br/>

                {error && <p style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</p>}
                {success && <p style={{color: 'green', textAlign: 'center', marginBottom: '10px'}}>Konto utworzone! Przekierowywanie...</p>}

                {!success && (
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

                        <label className="login-form-text" htmlFor="email"> Email: </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        /><br/>

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
                                onClick={togglePasswordVisibility}
                                style={{cursor: 'pointer'}}
                            >
                                {showPassword ? '🙈' : '👁'}
                            </span>
                        </div>
                        <button type="submit">Zarejestruj się</button>
                    </form>
                )}

                <div style={{textAlign: 'center', marginTop: '15px'}}>
                    <Link to="/login" style={{textDecoration: 'none', color: '#333'}}>Masz już konto? Zaloguj się</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;