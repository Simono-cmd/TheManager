import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllUsers, deleteUser, updateUser, getUserBoards, getUserTasks, createUser } from '../../api/users.api';
import '../../assets/styles/admin-style.css';
import {useAuth} from "../../hooks/useAuth.jsx";

const AdminUsersPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);

    //paginacja strony głównej (server side)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 8;

    //states dla modali
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    //states pomocnicze
    const [userToDelete, setUserToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserBoards , setSelectedUserBoards] = useState([]);
    const [selectedUserTasks , setSelectedUserTasks] = useState([]);
    const [selectedUserMemberships , setSelectedUserMemberships] = useState([]);

    // paginacja dla modali (client side)
    const [boardsPage, setBoardsPage] = useState(1);
    const [tasksPage, setTasksPage] = useState(1);
    const [membershipsPage, setMembershipsPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5;

    // pobieranie użytkowników
    const fetchUsers = async (page) => {
        try {
            const data = await getAllUsers(page, ITEMS_PER_PAGE);
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    useEffect(() => {
        document.title = `AdminMode - ${user.username}`;
        (async () => {
            await fetchUsers(currentPage);
        })();
    }, [currentPage]);

    // zmiana stron - server side
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // obsługa modali

    //modal add i edit bazują na tym samym stanie, obsługa różni się w zależności czy to przycisk który ma selecteduser czy nie
    const openAddModal = () => {
        setSelectedUser(null);
        setActionError(null);
        setEditOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setActionError(null);
        setEditOpen(true);
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setActionError(null);
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setActionError(null);
        setDeleteOpen(true);
    };

    //modal szczegółów
    const handleDetails = async (user) => {
        setSelectedUser(user);
        setBoardsPage(1);
        setTasksPage(1);
        setMembershipsPage(1);

        try {
            const boards = await getUserBoards(user.id);
            const tasks = await getUserTasks(user.id);
            const ownedTasks = tasks.filter(t => t.TaskMember?.role === 'owner');
            const memberTasks = tasks.filter(t => t.TaskMember?.role !== 'owner');

            // zapisujemy zależności między userami do tablic, zadań i taskmember
            setSelectedUserBoards(boards);
            setSelectedUserTasks(ownedTasks);
            setSelectedUserMemberships(memberTasks)
            setDetailsOpen(true);
        } catch (error) {
            console.error(error);        }
    };

    // obsługa zapisania użytkownika (nowy i edit) - jeśli jest selectedUser to edit
    const handleSaveUser = async (e) => {
        e.preventDefault();
        setActionError(null);

        //pobranie danych z formularza
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (selectedUser) {
                await updateUser(selectedUser.id, data);
            } else {
                await createUser(data);
            }
            closeEditModal();
            setSelectedUser(null);
            await fetchUsers(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    // potwierdzenie usunięcia użytkownika
    const confirmDelete = async () => {
        if (!userToDelete) return;
        setActionError(null);
        try {
            await deleteUser(userToDelete.id);
            setDeleteOpen(false);
            setUserToDelete(null);
            await fetchUsers(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    // rysowanie przycisków do paginacji - client side
    const renderPaginationControls = (currentPage, totalItems, setPage) => {
        const totalPages = Math.ceil(totalItems / MODAL_ITEMS_PER_PAGE);
        if (totalPages <= 1) return null;

        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px', fontSize: '1em' }}>
                <button onClick={() => setPage(currentPage - 1) } className="pagination-modal-btn"
                    disabled={currentPage === 1}>&lt;
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setPage(currentPage + 1)} className="pagination-modal-btn"
                    disabled={currentPage === totalPages}>&gt;
                </button>
            </div>
        );
    };

    // client side pagination data getter
    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * MODAL_ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + MODAL_ITEMS_PER_PAGE);
    };

    // dane do narysowania tabeli
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role'},
        { key: 'createdAt', label: 'Created at', render: (date) => new Date(date.createdAt).toLocaleDateString() }
    ];

    return (
        <div className="admin-container">
            {/* header - with add button and title*/}
            <AdminToolbar title="Manage users" onAdd={openAddModal}/>

            {/* drawing table */}
            <AdminTable
                columns={columns}
                data={users}
                actions={{ onDetails: handleDetails, onEdit: openEditModal, onDelete: openDeleteModal }}
            />

            {/*main pagination - server side*/}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="secondary-btn">&lt;</button>
                    <span> {currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="secondary-btn">&gt;</button>
                </div>
            )}

            {/*details modal for user*/}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Details: ${selectedUser?.username}`}>
                {selectedUser && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f3f3f3', borderRadius: '5px' }}>
                            {/*Mapujemy wszystkie pola z tablicy naszego usera i poprawiamy wyświetlanie daty*/}
                            {Object.entries(selectedUser).map(([key, value]) => {
                                if (key === 'password') return null;
                                const displayValue = (key.includes('At')) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (<div key={key} ><strong style={{ textTransform: 'capitalize', color: '#555555' }}>{key}: </strong><span>{displayValue}</span></div>);
                            })}
                        </div>

                        {/* list of user tables in modal */}
                        <div className="details-section">
                            <h3>Owned boards ({selectedUserBoards.length})</h3>
                            {selectedUserBoards.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Name</th></tr></thead>
                                        <tbody>
                                        {/*Mapujemy - wyciągamy zadania naszego usera  */}
                                        {getPaginatedData(selectedUserBoards, boardsPage).map(b => (
                                            <tr key={b.id}>
                                                <td>{b.id}</td>
                                                <td>{b.name}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {/* Kontrolki paginacji */}
                                    {renderPaginationControls(boardsPage, selectedUserBoards.length, setBoardsPage)}
                                </>
                            ) : <p>No data</p>}
                        </div>

                        {/* Tasks created by user list in modal */}
                        <div className="details-section">
                            <h3>Tasks (owner) - Total: {selectedUserTasks.length}</h3>
                            {selectedUserTasks.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
                                        <tbody>
                                        {/*Mapujemy - wyciągamy zadania taskmember naszego usera  */}
                                        {getPaginatedData(selectedUserTasks, tasksPage).map(b => (
                                            <tr key={b.id}>
                                                <td>{b.id}</td>
                                                <td>{b.title}</td>
                                                <td>{b.status}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {renderPaginationControls(tasksPage, selectedUserTasks.length, setTasksPage)}
                                </>
                            ) : <p>No data</p>}
                        </div>

                        {/* Tasks where the user is a member */}
                        <div className="details-section">
                            <h3>Tasks (member) - Total: {selectedUserMemberships.length}</h3>
                            {selectedUserMemberships.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
                                        <tbody>
                                        {/*Mapujemy - wyciągamy zadania naszego usera - taskmember  */}
                                        {getPaginatedData(selectedUserMemberships, membershipsPage).map(b => (
                                            <tr key={b.id}>
                                                <td>{b.id}</td>
                                                <td>{b.title}</td>
                                                <td>{b.status}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {renderPaginationControls(membershipsPage, selectedUserMemberships.length, setMembershipsPage)}
                                </>
                            ) : <p>No data</p>}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal for adding/editing users (the logic is the same so just the texts will be different */}
            <Modal isOpen={isEditOpen} onClose={closeEditModal} title={selectedUser ? "Edit user" : "Add user"}>
                <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/*Labels for adding/editing (password only for adding)*/}
                    <label>Username: <input name="username" defaultValue={selectedUser?.username} required className="admin-input" /></label>
                    <label>Email: <input name="email" defaultValue={selectedUser?.email} required className="admin-input" /></label>
                    {!selectedUser && <label>Password: <input name="password" type="password" required className="admin-input" /></label>}
                    <label>Role:
                        <select name="role" defaultValue={selectedUser?.role || 'user'} className="admin-select">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                    {actionError && <div className="error-message">{actionError}</div>}
                    <button type="submit" className="primary-btn" style={{ marginTop: '10px' }}>Save</button>
                </form>
            </Modal>

            {/*Modal for deleting*/}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm delete">
                <div>
                    <p>Are you sure you want to delete user: <strong>{userToDelete?.username}</strong>?</p>
                    {actionError && <div className="error-message">{actionError}</div>}
                    <div className="modal-actions">
                        <button onClick={() => setDeleteOpen(false)} className="secondary-btn">Cancel</button>
                        <button onClick={confirmDelete} className="danger-btn">Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUsersPage;