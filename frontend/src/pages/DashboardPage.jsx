import { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TaskCard from '../components/tasks/TaskCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import '../assets/styles/dashboard-style.css';
import { getTasksByBoardId, createTask, updateTask, deleteTask } from '../api/tasks.api';
import { getAllUsers } from '../api/users.api';
import { getMembersByTaskId, assignUserToTask, removeUserFromTask } from '../api/taskMembers.api';

const DashboardPage = () => {
    const { user } = useAuth();
    const [actionError, setActionError] = useState(null);
    //states for showing tasks for a board
    const [activeBoard, setActiveBoard] = useState(null);
    const [tasks, setTasks] = useState([]);

    //modals for tasks states
    const [selectedTask, setSelectedTask] = useState(null);
    const [isTaskModalOpen, setTaskModalOpen] = useState(false);//for add and edit
    const [isDeleteOpen, setDeleteOpen] = useState(false);

    //states for assigning task members
    const [allUsers, setAllUsers] = useState([]);
    const [currentMembers, setCurrentMembers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');


    useEffect(() => {
        document.title = "Dashboard | TheManager";
        if (activeBoard) (async () => {
            await fetchTasks(activeBoard.id);
        })();
        else setTasks([]);
    }, [activeBoard, user]);

    //only get users to assign to task if not guest
    useEffect(() => {
        if (user?.role !== 'guest') {
            getAllUsers(1, 1000).then(data => {
                const users = data.users || (Array.isArray(data) ? data : []);
                setAllUsers(users);
            }).catch(console.error);
        }
    }, [user]);

    // fetch data
    const fetchTasks = async (boardId) => {
        if (user?.role === 'guest') {
            const allTasks = JSON.parse(localStorage.getItem('guest_tasks'));
            setTasks(allTasks.filter(t => t.boardId === boardId));
        } else {
            try {
                const data = await getTasksByBoardId(boardId);
                setTasks(data);
            } catch (error) { console.error(error); }
        }
    };

    //modals handling
    const openCreateModal = () => {
        setSelectedTask(null);
        setCurrentMembers([]);
        setTaskModalOpen(true);
        setActionError(null);
    };

    const openEditModal = async (task) => {
        setSelectedTask(task);
        setActionError(null);
        if (user?.role !== 'guest') {
            try {
                const members = await getMembersByTaskId(task.id);
                setCurrentMembers(members);
            } catch (error) { console.error(error); }
        }
        setTaskModalOpen(true);
    };

    const openDeleteModal = (task) => {
        setSelectedTask(task);
        setDeleteOpen(true);
        setActionError(null);
    };


    // handle save - for guest and logged-in user - both edit and add
    const handleSave = async (e) => {
        e.preventDefault();
        setActionError(null);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!data.title || !data.title.trim()) {
            setActionError("Title cannot be empty")
            return;
        }

        try {
            // for guests - local created tasks
            if (user?.role === 'guest') {
                // get all tasks from local storage
                const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
                let updatedTasks;

                if (selectedTask) {
                    //editing task
                    updatedTasks = allTasks.map(t => t.id === selectedTask.id ? { ...t, ...data } : t);
                } else {
                    // creating task
                    const newTask = {
                        id: Date.now(),
                        ...data,
                        boardId: activeBoard.id,
                        status: 'to do'
                    };
                    updatedTasks = [...allTasks, newTask];
                }
                localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks));
            }
            // logic for logged-in user
            else {
                if (selectedTask) {
                    // edit task
                    await updateTask(selectedTask.id, data);
                } else {
                    // create task
                    await createTask({
                        ...data,
                        boardId: activeBoard.id,
                        status: 'to do'
                    });
                }
            }

            //get tasks for chosen board again
            await fetchTasks(activeBoard.id);
            setTaskModalOpen(false);
            setSelectedTask(null);

        } catch (error) {
            console.error(error);
            setActionError("Error saving task");
        }
    };

    //handle delete
    const handleDelete = async () => {
        if (!selectedTask) return;
        try {
            //for guest - filter out deleted task
            if (user?.role === 'guest') {
                const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
                const filtered = allTasks.filter(t => t.id !== selectedTask.id);
                localStorage.setItem('guest_tasks', JSON.stringify(filtered));
            } else {
                await deleteTask(selectedTask.id);
            }
            await fetchTasks(activeBoard.id);
            setDeleteOpen(false);
            setSelectedTask(null);
        } catch (error) { console.error(error); }
    };

    // for changing task status
    const handleToggleStatus = async (task) => {
        //switcher - completed/to do
        const newStatus = task.status === 'completed' ? 'to do' : 'completed';
        if (user?.role === 'guest') {
            const allTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
            const updated = allTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
            localStorage.setItem('guest_tasks', JSON.stringify(updated));
            await fetchTasks(activeBoard.id);
        } else {
            await updateTask(task.id, { status: newStatus });
            await fetchTasks(activeBoard.id);
        }
    };

    // adding task members
    const handleAddMember = async () => {
        if(!selectedUserId || !selectedTask) return;
        try {
            await assignUserToTask(selectedTask.id, selectedUserId);
            const m = await getMembersByTaskId(selectedTask.id);
            setCurrentMembers(m);
            setSelectedUserId('');
        } catch(e) { console.error(e); }
    };

    // removing task members
    const handleRemoveMember = async (userId) => {
        if(!selectedTask) return;
        try {
            await removeUserFromTask(selectedTask.id, userId);
            const m = await getMembersByTaskId(selectedTask.id);
            setCurrentMembers(m);
        } catch(e) { console.error(e); }
    };

    // filter already assigned users
    const currentMemberIds = currentMembers.map(m => m.userId);
    const availableUsers = allUsers.filter(u => !currentMemberIds.includes(u.id));

    return (
        <div className="dashboard-container">

            {/* sidebar */}
            <div className="sidebar-wrapper">
                <Sidebar onSelectBoard={setActiveBoard} selectedBoardId={activeBoard?.id} />
            </div>

            {/*container for tasks*/}
            <div className="tasks-area">
                {!activeBoard ? (
                    <div className="welcome-screen">
                        <h1>Hello, {user?.username || 'Guest'}!</h1>
                        <p>Choose the board to start</p>
                    </div>
                ) : (
                    // when board is selected
                    <div>
                        <div className="board-header">
                            <h1>{activeBoard.name}</h1>
                            <button className="primary-btn" onClick={openCreateModal}>+ Add Task</button>
                        </div>
                        <div className="tasks-list">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onEdit={() => openEditModal(task)}
                                    onDelete={() => openDeleteModal(task)}
                                    onToggleStatus={handleToggleStatus}/>
                            ))}
                            {tasks.length === 0 && <p style={{color: '#777777'}}>No tasks assigned to board.</p>}
                        </div>
                    </div>
                )}
            </div>

            {/*Modal - create and delete - logic is different when task is selected*/}
            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                title={selectedTask ? "Edit Task" : "New Task"}>

                {/*add*/}
                <form onSubmit={handleSave} className="task-form">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Title *</label>
                        <input
                            name="title"
                            defaultValue={selectedTask?.title}
                            style={{ width: '100%', padding: '8px' }}/>
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            defaultValue={selectedTask?.description}
                            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label>Deadline *</label>
                        <input
                            type="date"
                            name="deadline"
                            defaultValue={selectedTask?.deadline
                                ? new Date(selectedTask.deadline).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0]
                            }
                            style={{ width: '100%', padding: '8px' }}/>
                    </div>

                    {/*edit*/}
                    {selectedTask && user?.role !== 'guest' && (
                        <div style={{ marginTop: '10px', padding: '15px', background: '#f0f0f0', borderRadius: '5px', border: '1px solid #ddd' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Assign task members:</h4>
                            {/* Current user list - only current members*/}
                            <ul style={{ paddingLeft: '10px', marginBottom: '15px' }}>
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
                                {currentMembers.length === 0 && <li>No assigned task members</li>}
                            </ul>

                            {/* Add new task member */}
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

                    {actionError && (
                        <div className="error-message" style={{ color: '#d32f2f', marginTop: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                            {actionError}
                        </div>
                    )}

                    <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="button" onClick={() => setTaskModalOpen(false)} className="secondary-btn">Cancel</button>
                        <button type="submit" className="primary-btn">
                            {selectedTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/*Modal for deleting*/}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Confirm Delete"
            >
                <div style={{ marginBottom: '20px' }}>
                    Are you sure you want to delete task: <strong>{selectedTask?.title}</strong>?
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={() => setDeleteOpen(false)} className="secondary-btn">Cancel</button>
                    <button onClick={handleDelete} className="danger-btn">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;