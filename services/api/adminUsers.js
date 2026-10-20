import { API_BASE_URL } from "./config";

export async function fetchAdminUsers(token, filters = {}) {
  const query = new URLSearchParams(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();
  const url = `${API_BASE_URL}?action=admin-users${query ? `&${query}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchAdminUser(token, userId) {
  const url = `${API_BASE_URL}?action=admin-user&id=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function updateAdminUserStatus(token, userId, status) {
  const url = `${API_BASE_URL}?action=admin-update-user-status`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId, status }),
  });

  return response.json();
}

export async function createAdminUser(token, data) {
  const url = `${API_BASE_URL}?action=admin-create-user`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export async function updateAdminUser(token, userId, data) {
  const url = `${API_BASE_URL}?action=admin-update-user`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, user_id: userId }),
  });

  return response.json();
}
