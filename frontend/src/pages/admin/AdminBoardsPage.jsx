import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllBoardsAdmin, createBoardAdmin, updateBoard, deleteBoard } from '../../api/boards.api';
import { getTasksByBoardId } from '../../api/tasks.api';
import '../../assets/styles/admin-style.css';

const AdminBoardsPage = () => {
    // --- STANY DANYCH ---
    const [boards, setBoards] = useState([]);

    // --- PAGINACJA GŁÓWNA (BACKEND) ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // --- STANY MODALI ---
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // --- PAGINACJA W MODALU (FRONTEND) ---
    const [modalPage, setModalPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5;

    // --- STANY POMOCNICZE ---
    const [boardToDelete, setBoardToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);

    // Dane wybranego elementu
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [boardTasks, setBoardTasks] = useState([]);

    // 1. Pobieranie Tablic (Backend Pagination)
    const fetchBoards = async (page) => {
        try {
            const data = await getAllBoardsAdmin(page, ITEMS_PER_PAGE);
            setBoards(data.boards);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error("Błąd pobierania tablic:", error);
        }
    };

    useEffect(() => { fetchBoards(currentPage); }, [currentPage]);

    // --- OBSŁUGA STRON TABELI GŁÓWNEJ ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // --- OBSŁUGA STRON W MODALU (Client-Side) ---
    const indexOfLastTask = modalPage * MODAL_ITEMS_PER_PAGE;
    const indexOfFirstTask = indexOfLastTask - MODAL_ITEMS_PER_PAGE;
    const currentModalTasks = boardTasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalModalPages = Math.ceil(boardTasks.length / MODAL_ITEMS_PER_PAGE);

    const handleModalPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalModalPages) {
            setModalPage(newPage);
        }
    };

    // --- HELPERY OTWIERANIA MODALI ---
    const openAddModal = () => {
        setSelectedBoard(null);
        setActionError(null);
        setEditOpen(true);
    };

    const openEditModal = (board) => {
        setSelectedBoard(board);
        setActionError(null);
        setEditOpen(true);
    };

    const closeEditModal = () => {
        setEditOpen(false);
        setActionError(null);
    };

    const openDeleteModal = (board) => {
        setBoardToDelete(board);
        setActionError(null);
        setDeleteOpen(true);
    };

    const handleDetails = async (board) => {
        setSelectedBoard(board);
        setModalPage(1); // Resetujemy paginację modala przy otwarciu
        try {
            const tasks = await getTasksByBoardId(board.id);
            setBoardTasks(tasks);
            setDetailsOpen(true);
        } catch (error) {
            console.error(error);
            alert("Nie udało się pobrać zadań dla tej tablicy.");
        }
    };

    // --- LOGIKA ZAPISU I USUWANIA ---
    const handleSave = async (e) => {
        e.preventDefault();
        setActionError(null);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        if(data.ownerId) data.ownerId = parseInt(data.ownerId);

        try {
            if (selectedBoard) await updateBoard(selectedBoard.id, data);
            else await createBoardAdmin(data);

            setEditOpen(false);
            fetchBoards(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setActionError(msg);
        }
    };

    const confirmDelete = async () => {
        if (!boardToDelete) return;
        setActionError(null);

        try {
            await deleteBoard(boardToDelete.id);
            setDeleteOpen(false);
            setBoardToDelete(null);
            fetchBoards(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            setActionError(msg);
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nazwa Tablicy' },
        {
            key: 'owner',
            label: 'Właściciel',
            render: (b) => b.user ? b.user.username : `ID: ${b.ownerId}`
        },
        {
            key: 'createdAt',
            label: 'Utworzono',
            render: (b) => new Date(b.createdAt).toLocaleDateString()
        }
    ];

    return (
        <div className="admin-container">
            <AdminToolbar
                title="Manage boards"
                onAdd={openAddModal}/>

            <AdminTable
                columns={columns}
                data={boards} // Bezpośrednio przekazujemy boards, nie filteredBoards
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

            {/* MODAL DETALI (Z PAGINACJĄ WEWNĘTRZNĄ) */}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Szczegóły Tablicy`}>
                {selectedBoard && (
                    <>
                        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px', marginBottom: '15px', border: '1px solid #bbdefb' }}>
                            <h4 style={{marginTop: 0, marginBottom: '10px', color: '#1565c0'}}>Właściciel Tablicy</h4>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                <strong>Nazwa użytkownika:</strong>
                                <span>{selectedBoard.user?.username || 'Nieznany'}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <strong>Owner ID:</strong>
                                <span>{selectedBoard.ownerId}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '5px' }}>
                            {Object.entries(selectedBoard).map(([key, value]) => {
                                if (typeof value === 'object' && value !== null) return null;
                                if (key === 'ownerId') return null;
                                const displayValue = (key.includes('At') && value) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (<div key={key} style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}><strong style={{ textTransform: 'capitalize', color: '#555' }}>{key}: </strong><span>{displayValue}</span></div>);
                            })}
                        </div>

                        <div className="details-section">
                            <h3>Zadania w tej tablicy ({boardTasks.length})</h3>
                            {boardTasks.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Tytuł</th><th>Status</th><th>Deadline</th></tr></thead>
                                        <tbody>
                                        {/* Wyświetlamy tylko slice zadań dla obecnej strony modala */}
                                        {currentModalTasks.map(t => (
                                            <tr key={t.id}>
                                                <td>{t.id}</td>
                                                <td>{t.title}</td>
                                                <td><span className={`status-badge status-${t.status.replace(' ', '')}`}>{t.status}</span></td>
                                                <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>

                                    {/* --- PAGINACJA MODALA --- */}
                                    {totalModalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
                                            <button
                                                onClick={() => handleModalPageChange(modalPage - 1)}
                                                disabled={modalPage === 1}
                                                style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd', background: modalPage === 1 ? '#eee' : 'white' }}
                                            >
                                                &lt;
                                            </button>
                                            <span style={{ fontSize: '0.9rem', alignSelf: 'center' }}>
                                                {modalPage} / {totalModalPages}
                                            </span>
                                            <button
                                                onClick={() => handleModalPageChange(modalPage + 1)}
                                                disabled={modalPage === totalModalPages}
                                                style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd', background: modalPage === totalModalPages ? '#eee' : 'white' }}
                                            >
                                                &gt;
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : <p>Brak zadań przypisanych do tej tablicy.</p>}
                        </div>
                    </>
                )}
            </Modal>

            {/* MODAL EDYCJI / DODAWANIA */}
            <Modal isOpen={isEditOpen} onClose={closeEditModal} title={selectedBoard ? "Edycja Tablicy" : "Nowa Tablica"}>
                <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <label>
                        <strong>Nazwa Tablicy:</strong>
                        <input name="name" defaultValue={selectedBoard?.name} required className="admin-input" style={{width: '100%', marginTop: '5px'}} />
                    </label>
                    <label>
                        <strong>ID Właściciela (Owner ID):</strong>
                        <input type="number" name="ownerId" defaultValue={selectedBoard?.ownerId} required className="admin-input" style={{width: '100%', marginTop: '5px'}} />
                        <small style={{color: '#888'}}>Podaj ID użytkownika, do którego ma należeć tablica.</small>
                    </label>

                    {actionError && <div className="error-message">⚠️ {actionError}</div>}
                    <button className="primary-btn" style={{marginTop: '10px'}}>Zapisz zmiany</button>
                </form>
            </Modal>

            {/* MODAL USUWANIA */}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title="Potwierdź usunięcie">
                <div>
                    <p>Czy na pewno chcesz usunąć tablicę: <strong>{boardToDelete?.name}</strong>?</p>
                    <p style={{color: '#d32f2f', fontSize: '0.9rem'}}>Tej operacji nie można cofnąć. Wszystkie zadania w tej tablicy również zostaną usunięte.</p>

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

export default AdminBoardsPage;