import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllTasks, deleteTask, updateTask, createTask } from '../../api/tasks.api';
import { getMembersByTaskId } from '../../api/taskMembers.api';
import '../../assets/styles/admin-style.css';

const AdminTasksPage = () => {
    // --- STANY DANYCH ---
    const [tasks, setTasks] = useState([]);
    // Usunięto filteredTasks i searchQuery (paginacja backendowa gryzie się z filtrowaniem frontendowym)

    // --- STANY PAGINACJI GŁÓWNEJ ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // --- STANY MODALI ---
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // --- STANY POMOCNICZE ---
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskMembers, setTaskMembers] = useState([]);

    // --- NOWE: STANY PAGINACJI W MODALU ---
    const [membersPage, setMembersPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5;

    // --- POBIERANIE DANYCH ---
    const fetchTasks = async (page) => {
        try {
            // Przekazujemy stronę i limit do API
            const data = await getAllTasks(page, ITEMS_PER_PAGE);

            // Backend powinien zwracać obiekt { tasks, totalPages, currentPage }
            // Jeśli zwraca tablicę, trzeba dostosować backend lub ten kod
            setTasks(data.tasks || data);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || 1);
        } catch (error) {
            console.error("Błąd pobierania zadań:", error);
        }
    };

    useEffect(() => { fetchTasks(currentPage); }, [currentPage]);

    // --- OBSŁUGA ZMIANY STRONY (GŁÓWNA TABELA) ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // --- FUNKCJE POMOCNICZE (OTWIERANIE/ZAMYKANIE) ---
    const openAddModal = () => {
        setSelectedTask(null);
        setActionError(null);
        setEditOpen(true);
    };

    const openEditModal = (task) => {
        setSelectedTask(task);
        setActionError(null);
        setEditOpen(true);
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setActionError(null);
    };

    const handleDetails = async (task) => {
        setSelectedTask(task);
        // Reset paginacji modala przy otwarciu
        setMembersPage(1);
        try {
            const members = await getMembersByTaskId(task.id);
            setTaskMembers(members);
            setDetailsOpen(true);
        } catch (error) { console.error(error); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setActionError(null);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if(data.boardId) data.boardId = parseInt(data.boardId);

        try {
            if (selectedTask) await updateTask(selectedTask.id, data);
            else await createTask(data);

            setEditOpen(false);
            fetchTasks(currentPage); // Odśwież bieżącą stronę
        } catch(e) {
            const msg = e.response?.data?.message || e.message;
            setActionError(msg);
        }
    };

    // --- FUNKCJE USUWANIA ---
    const openDeleteModal = (task) => {
        setTaskToDelete(task);
        setActionError(null);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        setActionError(null);

        try {
            await deleteTask(taskToDelete.id);
            setDeleteOpen(false);
            setTaskToDelete(null);
            fetchTasks(currentPage); // Odśwież bieżącą stronę
        } catch(e) {
            const msg = e.response?.data?.message || e.message;
            setActionError(msg);
        }
    };

    // --- HELPERS DO PAGINACJI W MODALU ---
    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * MODAL_ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + MODAL_ITEMS_PER_PAGE);
    };

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

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Tytuł' },
        { key: 'status', label: 'Status', render: (t) => <span className={`status-badge status-${t.status.replace(' ', '')}`}>{t.status}</span> },
        { key: 'board', label: 'Tablica', render: (task) => task.board ? task.board.name : `ID: ${task.boardId}` },
        { key: 'deadline', label: 'Deadline', render: (t) => t.deadline ? new Date(t.deadline).toLocaleDateString() : '-' }
    ];

    return (
        <div className="admin-container">
            <AdminToolbar
                title="Zarządzanie Zadaniami"
                onAdd={openAddModal}
            />

            <AdminTable
                columns={columns}
                data={tasks} // Bezpośrednio tasks, bez filtrowania client-side
                actions={{
                    onDetails: handleDetails,
                    onEdit: openEditModal,
                    onDelete: openDeleteModal
                }}
            />

            {/* --- PASEK PAGINACJI GŁÓWNEJ --- */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="secondary-btn"
                        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        &lt; Poprzednia
                    </button>
                    <span style={{ fontWeight: 'bold', color: '#555' }}>
                        Strona {currentPage} z {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="secondary-btn"
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        Następna &gt;
                    </button>
                </div>
            )}

            {/* MODAL DETALI */}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Szczegóły Zadania`}>
                {selectedTask && (
                    <>
                        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px', marginBottom: '15px', border: '1px solid #bbdefb' }}>
                            <h4 style={{marginTop: 0, marginBottom: '10px', color: '#1565c0'}}>Przypisana Tablica</h4>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}><strong>Nazwa Tablicy:</strong> <span>{selectedTask.board?.name || 'Usunięta lub brak'}</span></div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}><strong>Board ID:</strong> <span>{selectedTask.boardId}</span></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                            {Object.entries(selectedTask).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                if (key === 'boardId') return null;
                                const displayValue = (key.includes('At') && value) || (key === 'deadline' && value) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (<div key={key} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', display: 'flex', justifyContent: 'space-between' }}><strong style={{ textTransform: 'capitalize', color: '#555' }}>{key}: </strong><span style={{textAlign: 'right'}}>{displayValue}</span></div>);
                            })}
                        </div>

                        <div className="details-section">
                            <h3>Członkowie Zadania ({taskMembers.length})</h3>
                            {taskMembers.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Username</th><th>Rola</th></tr></thead>
                                        <tbody>
                                        {/* Wyświetlamy tylko slice dla aktualnej strony modala */}
                                        {getPaginatedData(taskMembers, membersPage).map(m => (
                                            <tr key={m.userId}>
                                                <td>{m.userId}</td>
                                                <td>{m.user?.username || 'Nieznany'}</td>
                                                <td>{m.role === 'owner' ? <strong style={{color: '#d32f2f'}}>Owner</strong> : m.role}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {/* Paginacja w modalu */}
                                    {renderPaginationControls(membersPage, taskMembers.length, setMembersPage)}
                                </>
                            ) : <p>Brak przypisanych członków.</p>}
                        </div>
                    </>
                )}
            </Modal>

            {/* MODAL EDYCJI / DODAWANIA */}
            <Modal isOpen={isEditOpen} onClose={closeEditModal} title={selectedTask ? "Edycja Zadania" : "Nowe Zadanie"}>
                <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <label><strong>Tytuł:</strong><input name="title" defaultValue={selectedTask?.title} required className="admin-input" style={{width: '100%', marginTop:'5px'}} /></label>
                    <label><strong>Opis:</strong><textarea name="description" defaultValue={selectedTask?.description} className="admin-input" rows="3" style={{width: '100%', marginTop:'5px'}} /></label>
                    <label><strong>Status:</strong><select name="status" defaultValue={selectedTask?.status || 'to do'} className="admin-select" style={{width: '100%', marginTop:'5px'}}><option value="to do">To Do</option><option value="in progress">In Progress</option><option value="completed">Completed</option></select></label>
                    <label><strong>ID Tablicy (Board ID):</strong><input type="number" name="boardId" defaultValue={selectedTask?.boardId} required className="admin-input" style={{width: '100%', marginTop:'5px'}} /></label>
                    <label><strong>Deadline:</strong><input type="date" name="deadline" defaultValue={selectedTask?.deadline ? new Date(selectedTask.deadline).toISOString().split('T')[0] : ''} className="admin-input" style={{width: '100%', marginTop:'5px'}} /></label>

                    {actionError && <div className="error-message">⚠️ {actionError}</div>}
                    <button className="primary-btn" style={{marginTop: '10px'}}>Zapisz zmiany</button>
                </form>
            </Modal>

            {/* MODAL USUWANIA */}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title="Potwierdź usunięcie">
                <div>
                    <p>Czy na pewno chcesz usunąć zadanie: <strong>{taskToDelete?.title}</strong>?</p>
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

export default AdminTasksPage;