// Simple wrapper around AsyncStorage for the auth token and user.
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'ras.auth.token';
const USER_KEY  = 'ras.auth.user';

export async function saveAuth(token, user) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getAuth() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem(USER_KEY);
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
}

export async function clearAuth() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
}