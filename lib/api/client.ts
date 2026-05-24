import axios from "axios";
import { auth } from "@/lib/firebase";

const apiClient = axios.create({
  baseURL: "/api/v1",
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
