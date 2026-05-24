import apiClient from "./client";

export async function getAllUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function banUser(userId: string) {
  const { data } = await apiClient.post(`/admin/users/${userId}/ban`);
  return data;
}

export async function unbanUser(userId: string) {
  const { data } = await apiClient.post(`/admin/users/${userId}/unban`);
  return data;
}

export async function getStats() {
  const { data } = await apiClient.get("/admin/stats");
  return data;
}

export async function adminDeletePost(postId: string) {
  const { data } = await apiClient.delete(`/admin/posts/${postId}`);
  return data;
}

export async function adminDeleteComment(commentId: string) {
  const { data } = await apiClient.delete(`/admin/comments/${commentId}`);
  return data;
}

export async function verifyPost(postId: string) {
  const { data } = await apiClient.post(`/admin/posts/${postId}/verify`);
  return data;
}

export async function getFlaggedPosts() {
  const { data } = await apiClient.get("/admin/posts/flagged");
  return data;
}
