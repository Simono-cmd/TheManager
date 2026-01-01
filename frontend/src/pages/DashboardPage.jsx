import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TaskCard from '../components/tasks/TaskCard';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/dashboard-style.css';
import Modal from '../components/common/Modal';

// Importy API
import { getTasksByBoardId, createTask, updateTask, deleteTask } from '../api/tasks.api';
import { getAllUsers } from '../api/users.api';
import { getMembersByTaskId, assignUserToTask, removeUserFromTask } from '../api/taskMembers.api';

const DashboardPage = () => {
    const { user } = useAuth();
    const [activeBoard, setActiveBoard] = useState(null);
    const [tasks, setTasks] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('create');
    const [targetTask, setTargetTask] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: ''
    });

    // Members management state
    const [allUsers, setAllUsers] = useState([]); // Wszyscy użytkownicy systemu
    const [currentMembers, setCurrentMembers] = useState([]); // Aktualni członkowie edytowanego zadania
    const [selectedUserId, setSelectedUserId] = useState(''); // ID wybrane w select

    // 1. Pobieranie zadań po zmianie tablicy
    useEffect(() => {
        if (activeBoard) {
            fetchTasks(activeBoard.id);
        } else {
            setTasks([]);
        }
    }, [activeBoard, user]);

    // 2. Pobieranie listy WSZYSTKICH userów (do selecta)
    useEffect(() => {
        if (user?.role !== 'guest') {
            // Prosimy o duży limit (np. 1000), aby pobrać wszystkich do dropdowna,
            // ponieważ backend domyślnie stronicuje wyniki.
            getAllUsers(1, 1000)
                .then(data => {
                    // Obsługa nowej struktury z paginacją { users: [...], totalPages: ... }
                    // oraz starej struktury [...]
                    if (data.users && Array.isArray(data.users)) {
                        setAllUsers(data.users);
                    } else if (Array.isArray(data)) {
                        setAllUsers(data);
                    } else {
                        setAllUsers([]);
                    }
                })
                .catch(console.error);
        }
    }, [user]);

    const fetchTasks = async (boardId) => {
        if (user?.role === 'guest') {
            const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
            setTasks(allTasks.filter(t => t.boardId === boardId));
        } else {
            try {
                const data = await getTasksByBoardId(boardId);
                setTasks(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleBoardSelect = (board) => {
        setActiveBoard(board);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- LOGIKA OTWIERANIA MODALI ---

    const openCreateModal = () => {
        setModalType('create');
        setFormData({
            title: '',
            description: '',
            deadline: new Date().toISOString().split('T')[0]
        });
        setTargetTask(null);
        setIsModalOpen(true);
    };

    const openEditModal = async (task) => {
        setModalType('edit');
        setTargetTask(task);

        let formattedDeadline = '';
        if (task.deadline) {
            formattedDeadline = new Date(task.deadline).toISOString().split('T')[0];
        }

        setFormData({
            title: task.title,
            description: task.description || '',
            deadline: formattedDeadline
        });

        // Pobranie członków dla tego zadania (tylko dla zalogowanych)
        if (user?.role !== 'guest') {
            try {
                setCurrentMembers([]); // Reset przed pobraniem
                const members = await getMembersByTaskId(task.id);
                setCurrentMembers(members);
            } catch (error) {
                console.error("Błąd pobierania członków:", error);
            }
        }

        setIsModalOpen(true);
    };

    const openDeleteModal = (task) => {
        setModalType('delete');
        setTargetTask(task);
        setIsModalOpen(true);
    };

    // --- LOGIKA STATUSU ---

    const handleToggleStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'to do' : 'completed';

        if (user?.role === 'guest') {
            const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
            const updatedTasks = allTasks.map(t =>
                t.id === task.id ? { ...t, status: newStatus } : t
            );
            localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks));
            fetchTasks(activeBoard.id);
        } else {
            try {
                await updateTask(task.id, { status: newStatus });
                fetchTasks(activeBoard.id);
            } catch (error) {
                console.error("Błąd zmiany statusu:", error);
            }
        }
    };

    // --- LOGIKA CZŁONKÓW (MEMBERS) ---

    const handleAddMember = async () => {
        if (!selectedUserId || !targetTask) return;
        try {
            await assignUserToTask(targetTask.id, selectedUserId);
            // Odśwież listę członków
            const members = await getMembersByTaskId(targetTask.id);
            setCurrentMembers(members);
            setSelectedUserId(''); // Reset selecta
        } catch (error) {
            alert("Nie udało się przypisać użytkownika.");
        }
    };

    const handleRemoveMember = async (userIdToRemove) => {
        if (!targetTask) return;
        try {
            await removeUserFromTask(targetTask.id, userIdToRemove);
            const members = await getMembersByTaskId(targetTask.id);
            setCurrentMembers(members);
        } catch (error) {
            console.error(error);
        }
    };

    // --- SUBMIT FORMULARZA ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (modalType !== 'delete') {
            if (!formData.title.trim() || !formData.deadline) {
                alert("Tytuł i termin są wymagane!");
                return;
            }
        }

        try {
            if (user?.role === 'guest') {
                const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');

                if (modalType === 'create') {
                    const newTask = {
                        id: Date.now(),
                        ...formData,
                        boardId: activeBoard.id,
                        status: 'to do'
                    };
                    localStorage.setItem('guest_tasks', JSON.stringify([...allTasks, newTask]));
                }
                else if (modalType === 'edit' && targetTask) {
                    const updatedTasks = allTasks.map(t =>
                        t.id === targetTask.id ? { ...t, ...formData } : t
                    );
                    localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks));
                }
                else if (modalType === 'delete' && targetTask) {
                    const updatedTasks = allTasks.filter(t => t.id !== targetTask.id);
                    localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks));
                }
            } else {
                if (modalType === 'create') {
                    await createTask({
                        title: formData.title,
                        description: formData.description,
                        deadline: formData.deadline,
                        boardId: activeBoard.id,
                        status: 'to do'
                    });
                }
                else if (modalType === 'edit' && targetTask) {
                    await updateTask(targetTask.id, {
                        title: formData.title,
                        description: formData.description,
                        deadline: formData.deadline
                    });
                }
                else if (modalType === 'delete' && targetTask) {
                    await deleteTask(targetTask.id);
                }
            }

            await fetchTasks(activeBoard.id);
            setIsModalOpen(false);

        } catch (error) {
            console.error("Error saving task:", error);
            alert("Wystąpił błąd podczas zapisu.");
        }
    };

    const getModalTitle = () => {
        if (modalType === 'create') return "Nowe Zadanie";
        if (modalType === 'edit') return "Edytuj Zadanie";
        if (modalType === 'delete') return "Usuń Zadanie";
    };

    // --- FILTROWANIE UŻYTKOWNIKÓW (Logic improvement) ---
    // Tworzymy listę użytkowników dostępnych do dodania (tzn. takich, których nie ma jeszcze w zadaniu)
    const currentMemberIds = currentMembers.map(m => m.userId);
    // Upewniamy się, że allUsers to tablica (zabezpieczenie)
    const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
    const availableUsers = safeAllUsers.filter(u => !currentMemberIds.includes(u.id));

    return (
        <div className="dashboard-container">
            <div className="sidebar-wrapper">
                <Sidebar
                    onSelectBoard={handleBoardSelect}
                    selectedBoardId={activeBoard?.id}
                />
            </div>

            <div className="tasks-area">
                {!activeBoard ? (
                    <div className="welcome-screen">
                        <h1>Hello, {user?.username || 'Guest'}!</h1>
                        <p>Choose the board to start</p>
                    </div>
                ) : (
                    <div>
                        <div className="board-header">
                            <h1 title={activeBoard.name}>{activeBoard.name}</h1>
                            <button className="primary-btn" onClick={openCreateModal}>+ Add Task</button>
                        </div>

                        <div className="tasks-list">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={() => openEditModal(task)}
                                    onDelete={() => openDeleteModal(task)}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                            {tasks.length === 0 && <p>Brak zadań.</p>}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={getModalTitle()}
            >
                <form onSubmit={handleSubmit} className="task-form">
                    {(modalType === 'create' || modalType === 'edit') && (
                        <>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px' }}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', minHeight: '60px', resize: 'vertical' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Deadline *</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px' }}
                                    required
                                />
                            </div>

                            {/* --- SEKCJA TASK MEMBERS --- */}
                            {modalType === 'edit' && user?.role !== 'guest' && (
                                <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                                    <h4 style={{ margin: '0 0 10px 0' }}>Assigned users:</h4>

                                    <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                                        {currentMembers.map(member => {
                                            const isOwner = member.role === 'owner';
                                            const displayName = member.user?.username || member.User?.username || 'ID: ' + member.userId;

                                            return (
                                                <li key={member.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: isOwner ? 'bold' : 'normal' }}>{displayName}</span>
                                                        {isOwner ? (
                                                            <span style={{ fontSize: '0.75em', color: '#fff', backgroundColor: '#1c4b75', padding: '2px 6px', borderRadius: '10px' }}>owner</span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75em', color: '#fff', backgroundColor: '#666', padding: '2px 6px', borderRadius: '10px' }}>member</span>
                                                        )}
                                                    </div>
                                                    {!isOwner && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member.userId)}
                                                            style={{ color: '#d32f2f', border: '1px solid #d32f2f', background: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.8em' }}
                                                            title="Usuń użytkownika"
                                                        >
                                                            Usuń
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                        {currentMembers.length === 0 && <li style={{ color: '#999', fontStyle: 'italic' }}>Brak przypisanych osób</li>}
                                    </ul>

                                    {/* Dodawanie nowego - FILTROWANY SELECT */}
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <select
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(e.target.value)}
                                            style={{ flex: 1, padding: '5px' }}
                                            disabled={availableUsers.length === 0}
                                        >
                                            <option value="">
                                                {availableUsers.length > 0 ? "Wybierz użytkownika" : "Wszyscy dostępni są już przypisani"}
                                            </option>
                                            {availableUsers.map(u => (
                                                <option key={u.id} value={u.id}>{u.username}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddMember}
                                            disabled={!selectedUserId}
                                            style={{ cursor: 'pointer', padding: '5px 10px' }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {modalType === 'delete' && (
                        <div style={{ marginBottom: '15px', color: 'black' }}>
                            Are you sure you want to delete the task <strong>{targetTask?.title}</strong>?
                        </div>
                    )}

                    <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
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

export default DashboardPage;