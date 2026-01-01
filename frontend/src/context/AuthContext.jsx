// authContext odpowiada za pamiętanie że użytkownik jest zalogowany pomiędzy różnymi stronami

import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        console.log("Start useEffect. StoredUser:", storedUser); // LOG 1

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log("Parsed User:", parsedUser);
                console.log("Token:", token);

                if (token || parsedUser.role === 'guest') {
                    console.log("Warunek spełniony! Przywracam sesję.");
                    setUser(parsedUser);
                } else {
                    console.log("Warunek NIE spełniony. Brakuje tokena lub roli.");
                }
            } catch (e) {
                console.error("Błąd parsowania JSON:", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href='/';

        localStorage.removeItem('guest_boards');
        localStorage.removeItem('guest_tasks');
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
