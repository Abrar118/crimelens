import apiClient from "./client";

export async function getPosts(params?: {
  page?: number;
  limit?: number;
  division?: string;
  district?: string;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
}) {
  const { data } = await apiClient.get("/posts", { params });
  return data;
}

export async function getPost(id: string) {
  const { data } = await apiClient.get(`/posts/${id}`);
  return data;
}

export async function createPost(body: {
  title: string;
  description?: string;
  division: string;
  district: string;
  images: string[];
  video?: string;
  crime_time: string;
  is_anonymous?: boolean;
}) {
  const { data } = await apiClient.post("/posts", body);
  return data;
}

export async function deletePost(id: string) {
  const { data } = await apiClient.delete(`/posts/${id}`);
  return data;
}

export async function votePost(id: string, type: "up" | "down") {
  const { data } = await apiClient.post(`/posts/${id}/vote`, { type });
  return data;
}

export async function getPostLocations() {
  const { data } = await apiClient.get("/posts/locations");
  return data;
}

export async function getLeaderboard() {
  const { data } = await apiClient.get("/leaderboard");
  return data;
}
