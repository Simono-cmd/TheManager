import api from './axios.js';

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

export const updateUser = async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};


export const getUserBoards = async (id) => {
    const response = await api.get(`/users/${id}/boards`);
    return response.data;
};


export const getUserTasks = async (id) => {
    const response = await api.get(`/users/${id}/tasks`);
    return response.data;
};


export const getUserTaskMembers = async (id) => {
    const response = await api.get(`/users/${id}/task-members`);
    return response.data;
};