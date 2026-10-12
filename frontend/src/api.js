import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("exam-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status >= 500) {
    return "The server could not process this request. Check the backend terminal and database connection.";
  }
  if (!error.response) {
    return "The API could not be reached. Make sure the backend server is running.";
  }
  return error.message || "Something went wrong. Please try again.";
}

export default api;
