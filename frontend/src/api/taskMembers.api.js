import api from './axios.js';

export const assignUserToTask = async (data) => {
    const response = await api.post('/task-members', data);
    return response.data;
};

export const getAllTaskMembers = async () => {
    const response = await api.get('/task-members');
    return response.data;
};

export const getTaskMemberById = async (id) => {
    const response = await api.get(`/task-members/${id}`);
    return response.data;
};

export const updateTaskMemberRole = async (id, role) => {
    const response = await api.put(`/task-members/${id}`, { role });
    return response.data;
};

export const removeUserFromTask = async (id) => {
    const response = await api.delete(`/task-members/${id}`);
    return response.data;
};