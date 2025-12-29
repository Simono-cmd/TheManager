import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
            <img src="../assets/media/logo.png" alt="Logo" style={{ width: '80px', marginBottom: '20px', opacity: 0.5 }}/>
            <h1>Witaj, {user?.username}!</h1>
            <p>⬅ Wybierz tablicę z menu po lewej stronie, aby zobaczyć swoje zadania.</p>
            <p>Lub utwórz nową klikając <strong>+</strong>.</p>
        </div>
    );
};

export default DashboardPage;