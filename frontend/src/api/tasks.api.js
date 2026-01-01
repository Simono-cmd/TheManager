import api from './axios.js';

// ZMIANA: Dodajemy parametry page i limit (domyślnie 1 i 10)
export const getAllTasks = async (page = 1, limit = 10) => {
    // Przekazujemy parametry w zapytaniu GET
    const response = await api.get(`/tasks?page=${page}&limit=${limit}`);
    return response.data;
    // Teraz zwróci obiekt: { totalItems, totalPages, currentPage, tasks: [...] }
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
    // Tutaj zazwyczaj nie chcemy paginacji (widok Kanban), więc zostawiamy bez zmian
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