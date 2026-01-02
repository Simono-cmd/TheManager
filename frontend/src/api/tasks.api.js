import api from './axios.js';

export const getAllTasks = async (page = 1, limit = 10) => {
    const response = await api.get(`/tasks?page=${page}&limit=${limit}`);
    return response.data;
};

export const getTaskById = async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
};

export const createTask = async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
};

export const getTasksByBoardId = async (boardId) => {
    const response = await api.get(`/tasks/board/${boardId}`);
    return response.data;
};

export const updateTask = async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
};