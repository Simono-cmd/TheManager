import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserById, getUserTasks } from '../api/users.api';
import '../assets/styles/profile-style.css';

const ProfilePage = () => {
    const { user } = useAuth();

    // states
    const [profileData, setProfileData] = useState(null);
    const [ownedTasks, setOwnedTasks] = useState([]);
    const [assignedTasks, setAssignedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    //pagination for owned and assigned tasks
    const [tasksPage, setTasksPage] = useState(1);
    const [membershipsPage, setMembershipsPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    //get all data
    const fetchProfileData = async () => {
        try {
            const userData = await getUserById(user.id);
            setProfileData(userData);

            const allTasks = await getUserTasks(user.id);

            // we're getting user tasks and filtering them through task member role
            const owned = allTasks.filter(t => t.TaskMember && t.TaskMember.role === 'owner');
            const assigned = allTasks.filter(t => t.TaskMember && t.TaskMember.role !== 'owner');

            setOwnedTasks(owned);
            setAssignedTasks(assigned);

        } catch (error) {
            console.error("Error loading profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        document.title = `Profile - ${user.username}`;

        if (user){
            (async () => {
                await fetchProfileData();
            })();}
    }, [user]);

    // for cool colorful task status
    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'completed': return 'status-completed';
            default: return 'status-todo';
        }
    };

    if (isLoading) {
        return <div className="profile-container"><p>Loading...</p></div>;
    }

    // rysowanie przycisków do paginacji - client side
    const renderPaginationControls = (currentPage, totalItems, setPage) => {
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
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
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };


    return (
        <div className="profile-wrapper-scroll">
        <div className="profile-container">
            <h1 className="profile-title">Welcome, {profileData?.username}!</h1>

            {/*section for user data*/}
            <div className="profile-section">
                <h2 className="section-header">My data:</h2>
                {profileData && (
                    <table className="user-info-table">
                        <tbody>
                        <tr>
                            <td className="user-info-label">Username:</td>
                            <td>{profileData.username}</td>
                        </tr>
                        <tr>
                            <td className="user-info-label">Email:</td>
                            <td>{profileData.email}</td>
                        </tr>
                        <tr>
                            <td className="user-info-label">Created at:</td>
                            <td>
                                {profileData.createdAt
                                    ? new Date(profileData.createdAt).toLocaleDateString()
                                    : '-'}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                )}
            </div>

            {/* section for tasks by user*/}
            <div className="profile-section">
                <h2 className="section-header green-border">My tasks</h2>
                {ownedTasks.length > 0 ? (
                    <>
                    <table className="tasks-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Board</th>
                            <th>Status</th>
                            <th>Deadline</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getPaginatedData(ownedTasks, tasksPage).map(task => (
                            <tr key={task.id}>
                                <td><strong>{task.title}</strong></td>
                                <td>{task.board?.name}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                        {renderPaginationControls(tasksPage, ownedTasks.length, setTasksPage)}
                    </>
                ) : (
                    <p className="empty-message">No tasks created by you</p>
                )}
            </div>

            {/* section for tasks assigned to user*/}
            <div className="profile-section">
                <h2 className="section-header blue-border">Tasks assigned to me</h2>
                {assignedTasks.length > 0 ? (
                    <>
                    <table className="tasks-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Board</th>
                            <th>Status</th>
                            <th>Deadline</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getPaginatedData(assignedTasks, membershipsPage).map(task => (
                            <tr key={task.id}>
                                <td><strong>{task.title}</strong></td>
                                <td>{task.board?.name}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {renderPaginationControls(membershipsPage, assignedTasks.length, setMembershipsPage)}
                </>
                ) : (
                    <p className="empty-message">No assigned tasks</p>
                )}
            </div>
        </div></div>
    );
};

export default ProfilePage;