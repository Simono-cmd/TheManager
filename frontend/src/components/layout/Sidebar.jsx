import { useEffect, useState } from 'react';
import { getAllBoards, createBoard, deleteBoard, updateBoard } from '../../api/boards.api';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';

const Sidebar = ({ onSelectBoard, selectedBoardId }) => {
    const [boards, setBoards] = useState([]);
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create'); // 'create' | 'edit' | 'delete'
    const [targetBoard, setTargetBoard] = useState(null);
    const [boardNameInput, setBoardNameInput] = useState('');

    useEffect(() => {
        refreshBoards();
    }, [user]);

    const refreshBoards = () => {
        if (user?.role === 'guest') {
            const localBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            setBoards(localBoards);
        } else {
            getAllBoards().then(setBoards).catch(console.error);
        }
    };


    const openCreateModal = () => {
        setModalType('create');
        setBoardNameInput('');
        setTargetBoard(null);
        setIsModalOpen(true);
    };

    const openEditModal = (e, board) => {
        e.stopPropagation();
        setModalType('edit');
        setBoardNameInput(board.name);
        setTargetBoard(board);
        setIsModalOpen(true);
    };

    const openDeleteModal = (e, board) => {
        e.stopPropagation();
        setModalType('delete');
        setTargetBoard(board);
        setIsModalOpen(true);
    };

    // --- LOGIKA ZATWIERDZANIA (SUBMIT) ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. OBSŁUGA TWORZENIA
        if (modalType === 'create') {
            if (!boardNameInput.trim()) return;

            if (user?.role === 'guest') {
                const newBoard = { id: Date.now(), name: boardNameInput };
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                localStorage.setItem('guest_boards', JSON.stringify([...current, newBoard]));
            } else {
                await createBoard({ name: boardNameInput, ownerId: user.id });
            }
        }

        // 2. OBSŁUGA EDYCJI
        else if (modalType === 'edit' && targetBoard) {
            if (!boardNameInput.trim()) return;

            if (user?.role === 'guest') {
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                const updated = current.map(b => b.id === targetBoard.id ? { ...b, name: boardNameInput } : b);
                localStorage.setItem('guest_boards', JSON.stringify(updated));
            } else {
                await updateBoard(targetBoard.id, { name: boardNameInput });
            }
        }

        // 3. OBSŁUGA USUWANIA
        else if (modalType === 'delete' && targetBoard) {
            if (user?.role === 'guest') {
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                const updated = current.filter(b => b.id !== targetBoard.id);
                localStorage.setItem('guest_boards', JSON.stringify(updated));
                // Jeśli usunięto aktywną tablicę, można obsłużyć odznaczenie w rodzicu (opcjonalnie)
            } else {
                await deleteBoard(targetBoard.id);
            }
        }

        refreshBoards();
        setIsModalOpen(false);
    };

    const getModalTitle = () => {
        if (modalType === 'create') return "New Board";
        if (modalType === 'edit') return "Edit Board";
        if (modalType === 'delete') return "Delete Board";
    };

    return (
        <div className="sidebar" style={{ height: '100%', borderRight: '1px solid #ccc' }}>
            <div id="sidebar-top">
                <p>Your boards</p>
                <button className="add-btn" onClick={openCreateModal}>+</button>
            </div>

            <ul className="board-list">
                {boards.map(board => (
                    <li key={board.id} className="board-item">
                        <div
                            className={`board-name ${selectedBoardId === board.id ? 'active' : ''}`}
                            onClick={() => onSelectBoard(board)}
                            style={{ cursor: 'pointer', width: '100%', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                {board.name}
                            </span>

                            <div className="actions" style={{display: 'flex', gap: '5px'}}>
                                <button className="edit-btn" onClick={(e) => openEditModal(e, board)} title="Edytuj">
                                    <img src="/media/edit.png" alt="edit" className="icon" style={{width: '16px', height: '16px'}}/>
                                </button>

                                <button className="delete-btn" onClick={(e) => openDeleteModal(e, board)} title="Usuń">
                                    <img src="/media/delete.png" alt="delete" className="icon" style={{width: '16px', height: '16px'}}/>
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>


            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={getModalTitle()}
            >
                <form onSubmit={handleSubmit}>

                    {(modalType === 'create' || modalType === 'edit') && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nazwa tablicy:</label>
                            <input
                                type="text"
                                value={boardNameInput}
                                onChange={(e) => setBoardNameInput(e.target.value)}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                autoFocus
                            />
                        </div>
                    )}

                    {modalType === 'delete' && (
                        <div style={{ marginBottom: '15px', color: 'black' }}>
                            Do you want to delete board <strong>{targetBoard?.name}</strong>?
                            <br/>This operation cannot be undone!
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>

                        <button
                            type="submit"
                            style={{
                                backgroundColor: modalType === 'delete' ? '#d32f2f' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                cursor: 'pointer'
                            }}
                        >
                            {modalType === 'create' ? 'Create' : modalType === 'edit' ? 'Save' : 'Delete'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Sidebar;