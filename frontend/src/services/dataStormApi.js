const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Data Storm API request failed.");
  }

  return data;
}

export async function fetchPosts({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/posts`, { signal });
  const payload = await parseResponse(response);
  return payload.data ?? [];
}

export async function createPost({ title, content, authorName, authorEmail, thumbnail }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  formData.append("authorName", authorName);
  formData.append("authorEmail", authorEmail);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    body: formData,
  });
  const payload = await parseResponse(response);
  return payload.data;
}

export async function deletePost(postId) {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
  });
  return parseResponse(response);
}

export { API_BASE_URL };
