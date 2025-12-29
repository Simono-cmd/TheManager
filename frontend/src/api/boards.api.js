import api from './axios.js';

export const getBoards = async () => {
    const response = await api.get('/boards');
    return response.data;
};

export const getBoardById = async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
};

export const createBoard = async (boardData) => {
    const response = await api.post('/boards', boardData);
    return response.data;
};

export const updateBoard = async (id, boardData) => {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data;
};

export const deleteBoard = async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response.data;
};