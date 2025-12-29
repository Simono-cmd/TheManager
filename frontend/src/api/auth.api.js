import api from "./axios.js";

export const loginUser = async (username, password) =>{
    const response = await api.post('/auth/login', {username, password});
    return response.data;
}

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};