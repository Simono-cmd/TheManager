import api from './axios.js';

//for adding members to a task - as member
export const assignUserToTask = async (taskId, userId) => {
    const response = await api.post('/task-members', {
        taskId: taskId,
        userId: userId,
        role: 'member'
    });
    return response.data;
};

export const getAllTaskMembers = async () => {
    const response = await api.get('/task-members');
    return response.data;
};

export const getMembersByTaskId = async (taskId) => {
    const response = await api.get(`/task-members/${taskId}`);
    return response.data;
};

export const updateTaskMemberRole = async (taskId, userId, role) => {
    const response = await api.put(`/task-members/${taskId}/${userId}`, { role });
    return response.data;
};

export const removeUserFromTask = async (taskId, userId) => {
    const response = await api.delete(`/task-members/${taskId}/${userId}`);
    return response.data;
};

