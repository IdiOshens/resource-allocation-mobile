import { API_BASE_URL } from "./config";

/**
 * Fetches the list of equipment from the API.
 * @param {string} token - Bearer token
 * @param {object} filters - Optional { equipment_type, status, department_id }
 */
export async function fetchEquipment(token, filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = `${API_BASE_URL}?action=equipment${query ? "&" + query : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches a single equipment item by ID.
 * @param {string} token - Bearer token
 * @param {number|string} equipmentId
 */
export async function fetchEquipmentItem(token, equipmentId) {
  const url = `${API_BASE_URL}?action=equipment-item&id=${equipmentId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}
