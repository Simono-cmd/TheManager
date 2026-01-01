import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllUsers, deleteUser, updateUser, getUserBoards, getUserTasks, createUser } from '../../api/users.api';
import '../../assets/styles/admin-style.css';

const AdminUsersPage = () => {
    // --- STANY DANYCH ---
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // --- STANY PAGINACJI GŁÓWNEJ ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // --- STANY MODALI ---
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isAddOpen, setAddOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // --- STANY POMOCNICZE ---
    const [userToDelete, setUserToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserRelations, setSelectedUserRelations] = useState({ boards: [], tasks: [], memberships: [] });

    // --- NOWE: STANY PAGINACJI W MODALU ---
    const [boardsPage, setBoardsPage] = useState(1);
    const [tasksPage, setTasksPage] = useState(1);
    const [membershipsPage, setMembershipsPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5; // Ile elementów na stronę w modalu

    // --- POBIERANIE DANYCH ---
    const fetchUsers = async (page) => {
        try {
            const data = await getAllUsers(page, ITEMS_PER_PAGE);
            setUsers(data.users);
            setFilteredUsers(data.users);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    // --- FILTROWANIE ---
    useEffect(() => {
        let result = users;
        if (searchQuery) result = result.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
        if (roleFilter) result = result.filter(u => u.role === roleFilter);
        setFilteredUsers(result);
    }, [searchQuery, roleFilter, users]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // --- HELPERY OTWIERANIA MODALI ---
    const openAddModal = () => {
        setSelectedUser(null);
        setActionError(null);
        setAddOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setActionError(null);
        setEditOpen(true);
    };

    const closeEditAddModal = () => {
        setEditOpen(false);
        setAddOpen(false);
        setActionError(null);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setActionError(null);
        setDeleteOpen(true);
    };

    // --- LOGIKA AKCJI ---
    const handleDetails = async (user) => {
        setSelectedUser(user);
        // NOWE: Resetujemy paginację modala przy każdym otwarciu nowego usera
        setBoardsPage(1);
        setTasksPage(1);
        setMembershipsPage(1);

        try {
            const boards = await getUserBoards(user.id);
            const tasks = await getUserTasks(user.id);
            const ownedTasks = tasks.filter(t => t.TaskMember?.role === 'owner');
            const memberTasks = tasks.filter(t => t.TaskMember?.role !== 'owner');

            setSelectedUserRelations({ boards, tasks: ownedTasks, memberships: memberTasks });
            setDetailsOpen(true);
        } catch (error) {
            alert("Błąd pobierania szczegółów");
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setActionError(null);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (selectedUser) {
                await updateUser(selectedUser.id, data);
            } else {
                await createUser(data);
            }
            closeEditAddModal();
            setSelectedUser(null);
            fetchUsers(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setActionError(msg);
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        setActionError(null);
        try {
            await deleteUser(userToDelete.id);
            setDeleteOpen(false);
            setUserToDelete(null);
            fetchUsers(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setActionError(msg);
        }
    };

    // --- NOWE: Helper do renderowania kontrolek paginacji wewnątrz modala ---
    const renderPaginationControls = (currentPage, totalItems, setPage) => {
        const totalPages = Math.ceil(totalItems / MODAL_ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', fontSize: '0.9rem' }}>
                <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                    &lt;
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                    &gt;
                </button>
            </div>
        );
    };

    // --- NOWE: Helper do cięcia danych dla aktualnej strony ---
    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * MODAL_ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + MODAL_ITEMS_PER_PAGE);
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Nazwa Użytkownika' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rola', render: (u) => <span className={`status-badge status-${u.role === 'admin' ? 'completed' : 'todo'}`}>{u.role}</span> },
        { key: 'createdAt', label: 'Utworzono', render: (u) => new Date(u.createdAt).toLocaleDateString() }
    ];

    return (
        <div className="admin-container">
            <AdminToolbar title="Manage Users" onAdd={openAddModal}/>

            <AdminTable
                columns={columns}
                data={filteredUsers}
                actions={{ onDetails: handleDetails, onEdit: openEditModal, onDelete: openDeleteModal }}
            />

            {/* Paginacja głównej tabeli */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="secondary-btn">&lt; Poprzednia</button>
                    <span>Strona {currentPage} z {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="secondary-btn">Następna &gt;</button>
                </div>
            )}

            {/* --- MODAL DETALI --- */}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Szczegóły: ${selectedUser?.username}`}>
                {selectedUser && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                            {Object.entries(selectedUser).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                if (key === 'password') return null;
                                const displayValue = (key.includes('At') && value) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (<div key={key} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}><strong style={{ textTransform: 'capitalize', color: '#555' }}>{key}: </strong><span>{displayValue}</span></div>);
                            })}
                        </div>

                        {/* SEKCJA TABLIC */}
                        <div className="details-section">
                            <h3>Posiadane Tablice ({selectedUserRelations.boards.length})</h3>
                            {selectedUserRelations.boards.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Nazwa</th></tr></thead>
                                        <tbody>
                                        {/* Wyświetlamy tylko wycinek tablicy */}
                                        {getPaginatedData(selectedUserRelations.boards, boardsPage).map(b => (
                                            <tr key={b.id}><td>{b.id}</td><td>{b.name}</td></tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {/* Kontrolki paginacji */}
                                    {renderPaginationControls(boardsPage, selectedUserRelations.boards.length, setBoardsPage)}
                                </>
                            ) : <p>Brak tablic.</p>}
                        </div>

                        {/* SEKCJA ZADAŃ (Właściciel) */}
                        <div className="details-section">
                            <h3>Zadania (Właściciel) - Total: {selectedUserRelations.tasks.length}</h3>
                            {selectedUserRelations.tasks.length > 0 ? (
                                <>
                                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                        {getPaginatedData(selectedUserRelations.tasks, tasksPage).map(t => (
                                            <li key={t.id}>{t.title} ({t.status})</li>
                                        ))}
                                    </ul>
                                    {renderPaginationControls(tasksPage, selectedUserRelations.tasks.length, setTasksPage)}
                                </>
                            ) : <p>Brak zadań.</p>}
                        </div>

                        {/* SEKCJA ZADAŃ (Członek) */}
                        <div className="details-section">
                            <h3>Zadania (Członek) - Total: {selectedUserRelations.memberships.length}</h3>
                            {selectedUserRelations.memberships.length > 0 ? (
                                <>
                                    <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                        {getPaginatedData(selectedUserRelations.memberships, membershipsPage).map(t => (
                                            <li key={t.id}>{t.title}</li>
                                        ))}
                                    </ul>
                                    {renderPaginationControls(membershipsPage, selectedUserRelations.memberships.length, setMembershipsPage)}
                                </>
                            ) : <p>Brak przypisań.</p>}
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODAL EDYCJI / DODAWANIA --- */}
            <Modal isOpen={isEditOpen || isAddOpen} onClose={closeEditAddModal} title={selectedUser ? "Edytuj" : "Dodaj Użytkownika"}>
                <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>Username: <input name="username" defaultValue={selectedUser?.username} required className="admin-input" /></label>
                    <label>Email: <input name="email" defaultValue={selectedUser?.email} required className="admin-input" /></label>
                    {!selectedUser && <label>Hasło: <input name="password" type="password" required className="admin-input" /></label>}
                    <label>Rola:
                        <select name="role" defaultValue={selectedUser?.role || 'user'} className="admin-select">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    {actionError && <div className="error-message">⚠️ {actionError}</div>}
                    <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>Zapisz</button>
                </form>
            </Modal>

            {/* --- MODAL USUWANIA --- */}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title="Potwierdź usunięcie">
                <div>
                    <p>Czy na pewno chcesz usunąć użytkownika: <strong>{userToDelete?.username}</strong>?</p>
                    {actionError && <div className="error-message">⚠️ {actionError}</div>}
                    <div className="modal-actions">
                        <button onClick={() => setDeleteOpen(false)} className="secondary-btn">Anuluj</button>
                        <button onClick={confirmDelete} className="danger-btn">Usuń</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUsersPage;