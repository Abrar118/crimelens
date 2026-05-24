import apiClient from "./client";

export async function getComments(postId: string) {
  const { data } = await apiClient.get(`/posts/${postId}/comments`);
  return data;
}

export async function createComment(postId: string, body: {
  text: string;
  proof_url: string;
}) {
  const { data } = await apiClient.post(`/posts/${postId}/comments`, body);
  return data;
}

export async function deleteComment(postId: string, commentId: string) {
  const { data } = await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  return data;
}
