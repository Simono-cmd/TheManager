import { useState, useEffect } from 'react';
import AdminToolbar from '../../components/admin/AdminToolbar';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/common/Modal';
import { getAllTasks, deleteTask, updateTask, createTask } from '../../api/tasks.api';
import {assignUserToTask, getMembersByTaskId, removeUserFromTask, getAllTaskMembers} from '../../api/taskMembers.api';
import {getAllUsers} from "../../api/users.api.js";
import '../../assets/styles/admin-style.css';
import {useAuth} from "../../hooks/useAuth.jsx";

const AdminTasksPage = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    // admin task table with pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // states for modals
    const [isDetailsOpen, setDetailsOpen] = useState(false);
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    // additional states
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [getTaskMembers, setGetTaskMembers] = useState([]);

    //states for editing taskmembers in task edit
    const [allUsers, setAllUsers] = useState([]);
    const [currentMembers, setCurrentMembers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');

    // modal pagination
    const [membersPage, setMembersPage] = useState(1);
    const MODAL_ITEMS_PER_PAGE = 5;

    // all task members button states
    const [isAllMembersModalOpen, setAllMembersModalOpen] = useState(false);
    const [allTaskMembers, setAllTaskMembers] = useState([]);
    const [allMembersPage, setAllMembersPage] = useState(1);

    // getting data in
    const fetchTasks = async (page) => {
        try {
            const data = await getAllTasks(page, ITEMS_PER_PAGE);

            setTasks(data.tasks);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error("Error fetching tasks", error);
        }
    };

    useEffect(() => {
        document.title = `AdminMode - ${user.username}`;
        (async () => {
            await fetchTasks(currentPage);
        })();
    }, [currentPage]);

    // getting users for editing taskmembers
    useEffect(() => {
        getAllUsers(1, 1000)
            .then(data => {
                    setAllUsers(data.users);
            })
            .catch(console.error);
    }, []);

    // obsługa zmiany stron - server side
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // obsługa modali
    const openAddModal = () => {
        setSelectedTask(null);
        setActionError(null);
        setEditOpen(true);
        setCurrentMembers([]);
    };

    const openEditModal = async (task) => {
        setSelectedTask(task);
        setActionError(null);
        setSelectedUserId('');

        //load users for assigning
        try {
            const members = await getMembersByTaskId(task.id);
            setCurrentMembers(members);
        } catch (error) {
            console.error("Error getting taskmembers", error);
            setCurrentMembers([]);
        }

        setEditOpen(true);

    };

    const closeEditModal = () => {
        setEditOpen(false);
        setSelectedTask(null);
        setActionError(null);
    };

    // data for details modal
    const handleDetails = async (task) => {
        setSelectedTask(task);
        setMembersPage(1);
        try {
            const members = await getMembersByTaskId(task.id);
            setGetTaskMembers(members);
            setDetailsOpen(true);
        } catch (error) { console.error(error); }
    };

    // adding/editing tasks (zależy czy jest wybrany selectedTask)
    const handleSave = async (e) => {
        e.preventDefault();
        setActionError(null);

        //pobieramy dane z formularza
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (selectedTask) await updateTask(selectedTask.id, data);
            else await createTask(data);

            setEditOpen(false);
            await fetchTasks(currentPage);
        } catch(e) {
            const msg = e.message;
            setActionError(msg);
        }
    };

    // modal for deleting
    const openDeleteModal = (task) => {
        setTaskToDelete(task);
        setActionError(null);
        setDeleteOpen(true);
    };

    // funkcja for deleting
    const confirmDelete = async () => {
        if (!taskToDelete) return;
        setActionError(null);

        try {
            await deleteTask(taskToDelete.id);
            setDeleteOpen(false);
            setTaskToDelete(null);
            await fetchTasks(currentPage);
        } catch(e) {
            const msg = e.message;
            setActionError(msg);
        }
    };


    // getter for paginated data client side
    const getPaginatedData = (data, page) => {
        const startIndex = (page - 1) * MODAL_ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + MODAL_ITEMS_PER_PAGE); //pagination client side
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

    // function for adding new taskmembers in edit mode
    const handleAddMember = async () => {
        if (!selectedUserId || !selectedTask) return;
        setActionError(null);

        try {
            await assignUserToTask(selectedTask.id, selectedUserId);
            const members = await getMembersByTaskId(selectedTask.id);
            setCurrentMembers(members);
            setSelectedUserId('');
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    //for removing taskmembers in edit
    const handleRemoveMember = async (userIdToRemove) => {
        if (!selectedTask) return;
        setActionError(null);
        try {
            await removeUserFromTask(selectedTask.id, userIdToRemove);
            const members = await getMembersByTaskId(selectedTask.id);
            setCurrentMembers(members);
        } catch (error) {
            const msg = error.response?.data?.message;
            setActionError(msg);
        }
    };

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status', render: (t) => <span className={`status-badge status-${t.status.replace(' ', '')}`}>{t.status}</span> },
        { key: 'board', label: 'Board', render: (task) => task.board?.name},
        { key: 'deadline', label: 'Deadline', render: (t) => t.deadline ? new Date(t.deadline).toLocaleDateString() : '-' }
    ];

    // we only show taskmembers that are not already assigned to the task
    const currentMemberIds = currentMembers.map(m => m.userId);
    const safeAllUsers = Array.isArray(allUsers) ? allUsers : [];
    const availableUsers = safeAllUsers.filter(u => !currentMemberIds.includes(u.id));

    //for all taskmembers button
    const openAllMembersModal = async () =>{
        try {
            const data = await getAllTaskMembers();
            setAllTaskMembers(data);
            setAllMembersPage(1);
            setAllMembersModalOpen(true);
        }
        catch(error){
            setActionError("Error fetching taskmembers: " + error);
        }
    }

    return (
        <div className="admin-container">
            <AdminToolbar
                title="Manage tasks"
                onAdd={openAddModal}
            />

            <AdminTable
                columns={columns}
                data={tasks}
                actions={{
                    onDetails: handleDetails,
                    onEdit: openEditModal,
                    onDelete: openDeleteModal
                }}
            />

            {/*main pagination - server side*/}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="secondary-btn">&lt;</button>
                    <span> {currentPage} / {totalPages}</span>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="secondary-btn">&gt;</button>
                </div>
            )}

            {/* button for showing all task members */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginBottom: '20px' }}>
            <button
                onClick={openAllMembersModal}
                className="primary-btn">
                View all taskmembers
            </button>
            </div>

            {/* modal - show all task members - whole table */}
            <Modal isOpen={isAllMembersModalOpen} onClose={() => setAllMembersModalOpen(false)} title="All Task Members">
                <div style={{ overflowX: 'auto' }}>
                    <p style={{marginBottom: '10px', color: '#666'}}>Total records: {allTaskMembers.length}</p>
                    {allTaskMembers.length > 0 ? (
                        <>
                            <table className="mini-table">
                                <thead>
                                <tr>
                                    <th>Task ID</th>
                                    <th>Task title</th>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Assigned At</th>
                                </tr>
                                </thead>
                                <tbody>
                                {getPaginatedData(allTaskMembers, allMembersPage).map((m) => (
                                    <tr key={`${m.taskId}-${m.userId}`}>
                                        <td>{m.taskId}</td>
                                        <td>{m.task?.title}</td>
                                        <td>{m.userId}</td>
                                        <td>{m.user?.username}</td>
                                        <td>
                                            <span style={{color: m.role === 'owner' ? '#a81b1b' : '#02b02a'}}>
                                                {m.role}
                                            </span>
                                        </td>
                                        <td>{m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            {renderPaginationControls(allMembersPage, allTaskMembers.length, setAllMembersPage)}
                        </>
                    ) : (
                        <p>No task members found.</p>
                    )}
                </div>
            </Modal>


            {/*modal for details */}
            <Modal isOpen={isDetailsOpen} onClose={() => setDetailsOpen(false)} title={`Task details`}>
                {selectedTask && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px', padding: '15px', background: '#f3f3f3', borderRadius: '5px' }}>
                            {Object.entries(selectedTask).map(([key, value]) => {
                                {/*Mapujemy wszystkie elementy wyciągnięte z selected Task i formatujemy datę*/}
                                if (typeof value === 'object' && value !== null) return null;
                                const displayValue = (key.includes('At') && value) || (key === 'deadline' && value) ? new Date(value).toLocaleString() : (value?.toString() || '-');
                                return (
                                    <div key={key}><strong style={{ textTransform: 'capitalize', color: '#555555' }}>{key}: </strong><span>{displayValue}</span></div>);
                            })}
                        </div>

                        <div className="details-section">
                            <h3>Task members ({getTaskMembers.length})</h3>
                            {getTaskMembers.length > 0 ? (
                                <>
                                    <table className="mini-table">
                                        <thead><tr><th>ID</th><th>Username</th><th>Rola</th></tr></thead>
                                        <tbody>
                                        {/*client side pagination*/}
                                        {getPaginatedData(getTaskMembers, membersPage).map(m => (
                                            <tr key={m.userId}>
                                                <td>{m.userId}</td>
                                                <td>{m.user.username}</td>
                                                <td>{m.role}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    {renderPaginationControls(membersPage, getTaskMembers.length, setMembersPage)}
                                </>
                            ) : <p>No assigned members</p>}
                        </div>
                    </>
                )}
            </Modal>

            {/*Modal for editing/adding the logic is the same, the key factor is if we select the task*/}
            <Modal isOpen={isEditOpen} onClose={closeEditModal} title={selectedTask ? "Edit task" : "New task"}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label><strong>Title:</strong><input name="title" defaultValue={selectedTask?.title} required className="admin-input" style={{ width: '100%', marginTop: '5px' }} /></label>
                    <label><strong>Description:</strong><textarea name="description" defaultValue={selectedTask?.description} className="admin-input" rows="3" style={{ width: '100%', marginTop: '5px' }} /></label>
                    <label><strong>Status:</strong><select name="status" defaultValue={selectedTask?.status || 'to do'} className="admin-select" style={{ width: '100%', marginTop: '5px' }}><option value="to do">To Do</option><option value="completed">Completed</option></select></label>
                    <label><strong>Board ID:</strong><input type="number" name="boardId" defaultValue={selectedTask?.boardId} required className="admin-input" style={{ width: '100%', marginTop: '5px' }} /></label>
                    <label><strong>Deadline:</strong><input type="date" name="deadline" defaultValue={selectedTask?.deadline ? new Date() : ''} className="admin-input" style={{ width: '100%', marginTop: '5px' }} /></label>

                    {/*only in edit - editing taskmembers*/}
                    {selectedTask && (
                        <div style={{ marginTop: '10px', padding: '15px', background: '#f0f0f0', borderRadius: '5px', border: '1px solid #ddd' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Assign taskmembers:</h4>

                            {/* Current user list - only currentmembers*/}
                            <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                                {currentMembers.map(member => {
                                    const isOwner = member.role === 'owner';
                                    const displayName = member.user?.username;

                                    return (
                                        <li key={member.userId} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>
                                                <strong>{displayName}</strong>
                                            </span>
                                            {/*button to delete members who are not owners*/}
                                            {!isOwner && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(member.userId)}
                                                    style={{ color: 'red', border: '1px solid red', background: 'transparent', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}>
                                                    x
                                                </button>
                                            )}
                                            {isOwner && <span style={{fontSize:'0.8rem', color:'#555555'}}>(owner)</span>}
                                        </li>
                                    );
                                })}
                                {currentMembers.length === 0 && <li>No assigned taskmembers</li>}
                            </ul>

                            {/* Add new taskmember */}
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <select
                                    className="admin-select"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    style={{ flex: 1 }}
                                    size={6}>
                                    <option value="">
                                        {availableUsers.length > 0 ? "Add user:" : "No users available"}
                                    </option>
                                    {availableUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.username} (ID: {u.id})</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    disabled={!selectedUserId}
                                    className="primary-btn"
                                    >Add +
                                </button>
                            </div>
                        </div>
                    )}

                    {actionError && <div className="error-message">{actionError}</div>}
                    <button className="primary-btn">Save changes</button>
                </form>
            </Modal>

            {/* modal for deleting tasks */}
            <Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} title={`Confirm deletion of task`}>
                <div>
                    <p>Are you sure you want to delete task: <strong>{taskToDelete?.title}</strong>?</p>
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

export default AdminTasksPage;