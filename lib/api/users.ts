import apiClient from "./client";

export async function getMyProfile() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateMyProfile(body: {
  name?: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
}) {
  const { data } = await apiClient.put("/users/me", body);
  return data;
}

export async function getUserProfile(id: string) {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
}

export async function getUserPosts(id: string) {
  const { data } = await apiClient.get(`/users/${id}/posts`);
  return data;
}
