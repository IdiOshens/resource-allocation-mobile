import { API_BASE_URL } from "./config";

export async function fetchAdminDashboard(token) {
  const url = `${API_BASE_URL}?action=admin-dashboard`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchInstructorDashboard(token) {
  const url = `${API_BASE_URL}?action=instructor-dashboard`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchDepartmentHeadDashboard(token) {
  const url = `${API_BASE_URL}?action=department-head-dashboard`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchInstructorStudents(token) {
  const url = `${API_BASE_URL}?action=instructor-students`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchDepartmentHeadStats(token) {
  const url = `${API_BASE_URL}?action=department-head-stats`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function fetchAdminAnalytics(token) {
  const url = `${API_BASE_URL}?action=admin-analytics`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Fetches all pending bookings waiting for admin/head approval.
 * @param {string} token - Bearer token
 */
export async function fetchPendingBookings(token) {
  const url = `${API_BASE_URL}?action=pending-bookings`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

/**
 * Approves a pending booking.
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 */
export async function approveBooking(token, bookingId) {
  const url = `${API_BASE_URL}?action=approve-booking`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ allocation_id: bookingId }),
  });

  return response.json();
}

/**
 * Rejects a pending booking.
 * @param {string} token - Bearer token
 * @param {number|string} bookingId
 * @param {string} notes
 */
export async function rejectBooking(token, bookingId, notes = "") {
  const url = `${API_BASE_URL}?action=reject-booking`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ allocation_id: bookingId, notes }),
  });

  return response.json();
}
