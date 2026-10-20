import { API_BASE_URL } from './config';

export async function fetchMyNotifications(token, unreadOnly = false) {
    const url = `${API_BASE_URL}?action=my-notifications${unreadOnly ? '&unread=1' : ''}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
}

export async function fetchNotificationCount(token) {
    const url = `${API_BASE_URL}?action=notification-count`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
}

export async function markNotificationRead(token, notificationId) {
    const url = `${API_BASE_URL}?action=mark-notification-read`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_id: notificationId }),
    });
    return response.json();
}

export async function markAllNotificationsRead(token) {
    const url = `${API_BASE_URL}?action=mark-all-notifications-read`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: '{}',
    });
    return response.json();
}
