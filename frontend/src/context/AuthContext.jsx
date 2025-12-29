// authContext odpowiada za pamiętanie że użytkownik jest zalogowany pomiędzy różnymi stronami

import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if(storedUser && storedToken){
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href='/';
    };

    const login = (userData, token) =>{
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const loginAsGuest = () => {
        const guestUser = {
            id: 'guest',
            username: 'Guest',
            role: 'guest'
        };
        setUser(guestUser);
        localStorage.setItem('user', JSON.stringify(guestUser));
    };

    const isAdmin = user?.role === 'admin';

    // to dostanie każdy kto użyje useAuth - info kto jest zalogowany, czy jest adminem, czy trwa ładowanie
    const value = {
    user, login, logout, loginAsGuest, isAdmin, loading};

    //jak skońćzy się loading to ładujemy
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
