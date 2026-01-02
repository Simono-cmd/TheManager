// authContext odpowiada za pamiętanie że użytkownik jest zalogowany pomiędzy różnymi stronami
// działa to już po zalogowaniu użytkownika
import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        // sprawdzamy usera i token z pamięci przeglądarki
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                if (token || parsedUser.role === 'guest') {
                    setUser(parsedUser);
                } else {
                    console.log("Missing token");
                }
            } catch (e) {
                console.error("Error:", e);
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

    return ( //wysyłamy nasze dane
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>//jak skońćzy się loading to ładujemy stronę
    )
}
