import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllBoardsAdmin, createBoardAdmin, updateBoard, deleteBoard } from '../../api/boards.api';
import { getTasksByBoardId } from '../../api/tasks.api';
import '../../assets/styles/admin-style.css';
import {useAuth} from "../../hooks/useAuth.jsx";

const AdminBoardsPage = () => {
    const { user } = useAuth();

    //admin boards table state
    const [boards, setBoards] = useState([]);

    //main page pagination server side
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 8;

    //modals
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false); //for adding and editing
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    //pagination modals client side
    const [modalPage, setModalPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5;

    //additional states
    const [boardToDelete, setBoardToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);

    // states for selected board
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [boardTasks, setBoardTasks] = useState([]);

    //getting data into boards table
    const fetchBoards = async (page) => {
        try {
            const data = await getAllBoardsAdmin(page, ITEMS_PER_PAGE);
            setBoards(data.boards);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        document.title = `AdminMode - ${user.username}`;
        (async () => {
            await fetchBoards(currentPage);
        })();
    }, [currentPage]);

    //main page pagination server side
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // functions for modals (edit and add base on same state)
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

    // for details modal
    const handleDetails = async (board) => {
        setSelectedBoard(board);
        setModalPage(1);
        try {
            const tasks = await getTasksByBoardId(board.id);
            setBoardTasks(tasks);
            setDetailsOpen(true);
        } catch (error) {
            console.error(error);
        }
    };

    // for saving data (in edit and add)
    const handleSave = async (e) => {
        e.preventDefault();
        setActionError(null);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (selectedBoard) await updateBoard(selectedBoard.id, data);
            else await createBoardAdmin(data);
            setEditOpen(false);
            fetchBoards(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    // deleting boards
    const confirmDelete = async () => {
        if (!boardToDelete) return;
        setActionError(null);

        try {
            await deleteBoard(boardToDelete.id);
            setDeleteOpen(false);
            setBoardToDelete(null);
            fetchBoards(currentPage);
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    //get paginated data client site
    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * MODAL_ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + MODAL_ITEMS_PER_PAGE);
    };

    // pagination controls render - client side
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

    //columns for our table
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'owner', label: 'Owner', render: (b) => b.user.username},
        { key: 'createdAt', label: 'Created at', render: (b) => new Date(b.createdAt).toLocaleDateString()}
    ];

    return (
        <div className="admin-container">
            <AdminToolbar
                title="Manage boards"
                onAdd={openAddModal}/>

            <AdminTable
                columns={columns}
                data={boards}
                actions={{
                    onDetails: handleDetails,
                    onEdit: openEditModal,
                    onDelete: openDeleteModal
                }}
            />

            {/*Pagination of the main boards table*/}
            {/*main pagination - server side*/}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="secondary-btn">&lt;</button>
                    <span> {currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="secondary-btn">&gt;</button>
                </div>
            )}

            {/* Details modal */}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Board Details`}>
                {selectedBoard && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f3f3f3', borderRadius: '5px' }}>
                            {Object.entries(selectedBoard).map(([key, value]) => {
                                if (typeof value === 'object' && value!== null) return null;
                                const displayValue = (key.includes('At')) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (<div key={key} ><strong style={{ textTransform: 'capitalize', color: '#555555' }}>{key}: </strong><span>{displayValue}</span></div>);
                            })}
                        </div>

                        {/* Tasks in this table */}
                        <div className="details-section">
                            <h3>Tasks in this board ({boardTasks.length})</h3>
                            {boardTasks.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Deadline</th></tr></thead>
                                        <tbody>
                                        {getPaginatedData(boardTasks, modalPage).map(t => (
                                            <tr key={t.id}>
                                                <td>{t.id}</td>
                                                <td>{t.title}</td>
                                                <td><span style={{textTransform: 'capitalize'}}>{t.status}</span></td>
                                                <td>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {renderPaginationControls(modalPage, boardTasks.length, setModalPage)}
                                </>
                            ) : <p>No tasks </p>}
                        </div>
                    </>
                )}
            </Modal>


            {/*modal for adding editing*/}
            <Modal isOpen={isEditOpen} onClose={closeEditModal} title={selectedBoard ? "Edit board" : "Add board"}>
                <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    <label>
                        <strong>Board name:</strong>
                        <input name="name" defaultValue={selectedBoard?.name} required className="admin-input" style={{width: '100%', marginTop: '5px'}} />
                    </label>
                    <label>
                        <strong>Owner ID:</strong>
                        <input type="number" name="ownerId" defaultValue={selectedBoard?.ownerId} required className="admin-input" style={{width: '100%', marginTop: '5px'}} />
                        <small style={{color: '#555555'}}>Please provide ID of user who will own this board</small>
                    </label>

                    {actionError && <div className="error-message">{actionError}</div>}
                    <button className="primary-btn" style={{marginTop: '10px'}}>Save</button>
                </form>
            </Modal>

            {/*Modal for deleting*/}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm delete">
                <div>
                    <p>Are you sure you want to delete board: <strong>{boardToDelete?.name}</strong>?</p>
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

export default AdminBoardsPage;