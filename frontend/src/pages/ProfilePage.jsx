import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserById, getUserTasks } from '../api/users.api';
import '../assets/styles/profile-style.css';

const ProfilePage = () => {
    const { user } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [ownedTasks, setOwnedTasks] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'guest') {
            setIsLoading(false);
            return;
        }

        const fetchProfileData = async () => {
            try {
                // 1. Pobieramy dane
                const userData = await getUserById(user.id);
                setProfileData(userData);

                // 2. Pobieramy zadania
                const allTasks = await getUserTasks(user.id);

                // 3. Filtrujemy (Owner vs Member)
                const owned = allTasks.filter(t => t.TaskMember && t.TaskMember.role === 'owner');
                const assigned = allTasks.filter(t => t.TaskMember && t.TaskMember.role !== 'owner');

                setOwnedTasks(owned);
                setAssignedTasks(assigned);

            } catch (error) {
                console.error("Błąd ładowania profilu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return 'status-completed';
            case 'in progress': return 'status-inprogress';
            case 'failed': return 'status-failed';
            default: return 'status-todo';
        }
    };

    if (isLoading) {
        return <div className="profile-container"><p>Loading...</p></div>;
    }

    // --- WIDOK WŁAŚCIWY ---
    return (
        <div className="profile-wrapper-scroll">
        <div className="profile-container">
            <h1 className="profile-title">Witaj, {profileData?.username}!</h1>

            {/* SEKCJA 1: DANE UŻYTKOWNIKA */}
            <div className="profile-section">
                <h2 className="section-header">Twoje Dane</h2>
                {profileData && (
                    <table className="user-info-table">
                        <tbody>
                        <tr>
                            <td className="user-info-label">Użytkownik:</td>
                            <td>{profileData.username}</td>
                        </tr>
                        <tr>
                            <td className="user-info-label">Email:</td>
                            <td>{profileData.email}</td>
                        </tr>
                        <tr>
                            <td className="user-info-label">Data dołączenia:</td>
                            <td>
                                {profileData.createdAt
                                    ? new Date(profileData.createdAt).toLocaleDateString('pl-PL')
                                    : '-'}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                )}
            </div>

            {/* SEKCJA 2: MOJE ZADANIA (OWNER) */}
            <div className="profile-section">
                <h2 className="section-header green-border">Utworzone przeze mnie</h2>
                {ownedTasks.length > 0 ? (
                    <table className="tasks-table">
                        <thead>
                        <tr>
                            <th style={{width: '35%'}}>Tytuł</th>
                            <th>Tablica</th>
                            <th>Status</th>
                            <th>Termin</th>
                        </tr>
                        </thead>
                        <tbody>
                        {ownedTasks.map(task => (
                            <tr key={task.id}>
                                <td><strong>{task.title}</strong></td>
                                <td>{task.board ? task.board.name : 'Usunięta'}</td>
                                <td>
                                        <span className={`status-badge ${getStatusClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                </td>
                                <td>{task.deadline ? new Date(task.deadline).toLocaleDateString('pl-PL') : '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="empty-message">Nie utworzyłeś jeszcze żadnych zadań.</p>
                )}
            </div>

            {/* SEKCJA 3: PRZYPISANE ZADANIA */}
            <div className="profile-section">
                <h2 className="section-header blue-border">Zadania przypisane do mnie</h2>
                {assignedTasks.length > 0 ? (
                    <table className="tasks-table">
                        <thead>
                        <tr>
                            <th style={{width: '35%'}}>Tytuł</th>
                            <th>Tablica</th>
                            <th>Status</th>
                            <th>Termin</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assignedTasks.map(task => (
                            <tr key={task.id}>
                                <td><strong>{task.title}</strong></td>
                                <td>{task.board ? task.board.name : 'Usunięta'}</td>
                                <td>
                                        <span className={`status-badge ${getStatusClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                </td>
                                <td>{task.deadline ? new Date(task.deadline).toLocaleDateString('pl-PL') : '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="empty-message">Brak zadań, do których zostałeś przypisany.</p>
                )}
            </div>
        </div></div>
    );
};

export default ProfilePage;