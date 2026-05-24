import apiClient from "./client";

export async function getAllUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function banUser(userId: string) {
  const { data } = await apiClient.post(`/admin/users/${userId}/ban`);
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
