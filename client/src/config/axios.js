import axios from "axios"

// serverUrl = "http://localhost:5000/api/v1"
const serverUrl = "https://patha-yatri-backend.vercel.app/api/v1"

const axiosInstance = axios.create({
    baseURL: serverUrl,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default axiosInstance;