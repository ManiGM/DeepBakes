import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "https://deepbakes.onrender.com";
// const API_BASE_URL = "http://localhost:2213";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    toast.error(message);
    return Promise.reject(error);
  },
);

export const productApi = {
  getAll: () => api.get("/products"),
  create: (data) => api.post("/products", data),
};

export const orderApi = {
  getAll: () => api.get("/orders"),
  getByUser: (userId) => api.get(`/orders/${userId}`),
  create: (data) => api.post("/orders", data),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
};

export const authApi = {
  login: (credentials) => api.post("/login", credentials),
  register: (userData) => api.post("/register", userData),
};

export default api;
