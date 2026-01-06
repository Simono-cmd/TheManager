import { useEffect, useState } from 'react';
import { getAllBoards, createBoard, deleteBoard, updateBoard } from '../../api/boards.api';
import { useAuth } from '../../hooks/useAuth';
import Modal from '../common/Modal';

const Sidebar = ({ onSelectBoard, selectedBoardId }) => {
    const [boards, setBoards] = useState([]);
    const { user } = useAuth();

    //states for modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [targetBoard, setTargetBoard] = useState(null);



    const refreshBoards = () => {
        if (user?.role === 'guest') {
            const localBoards = JSON.parse(localStorage.getItem('guest_boards') || '[]');
            setBoards(localBoards);
        } else {
            getAllBoards().then(setBoards).catch(console.error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refreshBoards();
    }, [user]);

    const openCreateModal = () => {
        setModalType('create');
        setTargetBoard(null);
        setIsModalOpen(true);
    };

    const openEditModal = (e, board) => {
        e.stopPropagation();
        setModalType('edit');
        setTargetBoard(board);
        setIsModalOpen(true);
    };

    const openDeleteModal = (e, board) => {
        e.stopPropagation();
        setModalType('delete');
        setTargetBoard(board);
        setIsModalOpen(true);
    };

    // for pressing create, edit, delete button

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (modalType === 'create') {
            if (!data.name.trim()) return;

            // for guest - temporary board
            if (user?.role === 'guest') {
                const newBoard = { id: Date.now(), name: data.name };
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                localStorage.setItem('guest_boards', JSON.stringify([...current, newBoard]));
            } else {
                await createBoard({ name: data.name, ownerId: user.id });
            }
        }

        else if (modalType === 'edit' && targetBoard) {
            if (!data.name.trim()) return;

            // for guest - temporary boards
            if (user?.role === 'guest') {
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                const updated = current.map(b => b.id === targetBoard.id ? { ...b, name: data.name } : b);
                localStorage.setItem('guest_boards', JSON.stringify(updated));
            } else {
                await updateBoard(targetBoard.id, { name: data.name });
            }
        }
        else if (modalType === 'delete' && targetBoard) {
            const isCurrentBoard = selectedBoardId === targetBoard.id;
            //for guest - deleting temporary board
            if (user?.role === 'guest') {
                const current = JSON.parse(localStorage.getItem('guest_boards') || '[]');
                const updated = current.filter(b => b.id !== targetBoard.id);
                localStorage.setItem('guest_boards', JSON.stringify(updated));
            } else {
                await deleteBoard(targetBoard.id);
            }
            if (isCurrentBoard) {
                onSelectBoard(null);
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

            {/* list of all boards*/}
            <ul className="board-list">
                {boards.map(board => (
                    <li key={board.id} className="board-item">
                        <div className={`board-name ${selectedBoardId === board.id ? 'active' : ''}`}
                            onClick={() => onSelectBoard(board)}
                            style={{ cursor: 'pointer', width: '100%', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                            <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                {board.name}
                            </span>

                            <div className="actions" style={{display: 'flex', gap: '5px'}}>
                                <button className="edit-btn" onClick={(e) => openEditModal(e, board)} title="Edit">
                                    <img src="/media/edit.png" alt="edit" className="icon" style={{width: '16px', height: '16px'}}/>
                                </button>

                                <button className="delete-btn" onClick={(e) => openDeleteModal(e, board)} title="Delete">
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
                            <label style={{ display: 'block', marginBottom: '5px', color: '#555555'}}>Board name:</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={modalType === 'edit' ? targetBoard.name : ''}
                                style={{width: '100%', padding: '10px'}}
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
                        <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>

                        <button
                            type="submit"
                            className="secondary-btn"
                            style={{
                                backgroundColor: modalType === 'delete' ? '#d32f2f' : '#4CAF50',
                                color: 'white'
                            }}
                        >
                            <strong>{modalType === 'create' ? 'Create' : modalType === 'edit' ? 'Save' : 'Delete'}</strong>
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Sidebar;