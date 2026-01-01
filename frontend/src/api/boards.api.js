import api from './axios.js';


export const getAllBoards = async (page = 1, limit = 10) => {
    const response = await api.get(`/boards?page=${page}&limit=${limit}`);
    return response.data;
};

export const getAllBoardsAdmin = async (page = 1, limit = 10) => {
    const response = await api.get(`/boards/admin-all?page=${page}&limit=${limit}`);
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

export const createBoardAdmin = async (data) => {
    const response = await api.post('/boards/admin-create', data);
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