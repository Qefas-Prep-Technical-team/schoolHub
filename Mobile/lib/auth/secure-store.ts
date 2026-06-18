import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';

/**
 * Save access and refresh tokens to secure storage
 */
export async function setTokens(accessToken: string, refreshToken?: string) {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Error saving tokens securely:', error);
  }
}

/**
 * Retrieve the access token from secure storage
 */
export async function getAccessToken() {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Retrieve the refresh token from secure storage
 */
export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Clear all tokens from secure storage (e.g. on logout)
 */
export async function clearTokens() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
}

const USER_ROLE_KEY = 'USER_ROLE';

export async function setUserRole(role: string) {
  try {
    await SecureStore.setItemAsync(USER_ROLE_KEY, role);
  } catch (error) {
    console.error('Error saving user role:', error);
  }
}

export async function getUserRole() {
  try {
    return await SecureStore.getItemAsync(USER_ROLE_KEY);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function clearUserRole() {
  try {
    await SecureStore.deleteItemAsync(USER_ROLE_KEY);
  } catch (error) {
    console.error('Error clearing user role:', error);
  }
}

