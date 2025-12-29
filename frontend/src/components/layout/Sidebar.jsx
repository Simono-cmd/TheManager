import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard } from '../../api/boards.api'; // Dostosuj ścieżkę do api jeśli trzeba
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const [boards, setBoards] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        refreshBoards();
    }, [user]); // Dodajemy zależność user

    const refreshBoards = () => {
        // --- LOGIKA DLA GOŚCIA ---
        if (user?.role === 'guest') {
            const localBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            setBoards(localBoards);
        }
        // --- LOGIKA DLA ZALOGOWANEGO ---
        else {
            getBoards().then(setBoards).catch(console.error);
        }
    };

    const handleAddBoard = async () => {
        const name = prompt("Podaj nazwę nowej tablicy:");
        if (!name) return;

        if (user?.role === 'guest') {
            // Tworzymy tablicę lokalnie
            const newBoard = { id: Date.now(), name: name }; // Generujemy sztuczne ID
            const currentBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            const updatedBoards = [...currentBoards, newBoard];

            localStorage.setItem('guest_boards', JSON.stringify(updatedBoards));
            refreshBoards();
        } else {
            // Tworzymy tablicę w API
            await createBoard({ name, ownerId: user.id });
            refreshBoards();
        }
    };

    const handleDeleteBoard = async (e, id) => {
        e.preventDefault();
        if(!window.confirm("Usunąć tablicę?")) return;

        if (user?.role === 'guest') {
            // Usuwamy lokalnie
            const currentBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            const updatedBoards = currentBoards.filter(b => b.id !== id);
            localStorage.setItem('guest_boards', JSON.stringify(updatedBoards));
            refreshBoards();
            navigate('/dashboard');
        } else {
            // Usuwamy z API
            await deleteBoard(id);
            refreshBoards();
            navigate('/dashboard');
        }
    };

    return (
        <div className="sidebar">
            <div id="sidebar-top">
                <p>Your boards</p>
                <button className="add-btn" onClick={handleAddBoard}>+</button>
            </div>

            <ul className="board-list">
                {boards.map(board => (
                    <li className="board-item" key={board.id}>
                        <NavLink
                            to={`/dashboard/board/${board.id}`}
                            className={({ isActive }) => isActive ? "board-name active" : "board-name"} // Tu można dopracować style active
                            style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%', justifyContent: 'space-between' }}
                        >
                            <span>{board.name}</span>

                            <div className="actions">
                                <button className="edit-btn">
                                    <img src="../../assets/media/edit.png" alt="edit" className="icon"/>
                                </button>
                                <button className="delete-btn" onClick={(e) => handleDeleteBoard(e, board.id)}>
                                    <img src="../../assets/media/delete.png" alt="delete" className="icon"/>
                                </button>
                            </div>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;