import { API_BASE_URL } from "./config";

/**
 * Fetches the list of classrooms from the API.
 * @param {string} token - Bearer token
 * @param {object} filters - Optional { building, room_type, min_capacity, status }
 */
export async function fetchClassrooms(token, filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}?action=classrooms${query ? "&" + query : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches a single classroom by ID.
 * @param {string} token - Bearer token
 * @param {number|string} classroomId
 */
export async function fetchClassroom(token, classroomId) {
  const url = `${API_BASE_URL}?action=classroom&id=${classroomId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
