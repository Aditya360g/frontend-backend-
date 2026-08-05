import {
  AUTH_STORAGE_KEYS,
} from "../constants/auth";

import type { User } from "../types/auth";

function getAccessToken(): string | null {
  return localStorage.getItem(
    AUTH_STORAGE_KEYS.ACCESS_TOKEN
  );
}

function setAccessToken(
  accessToken: string
): void {
  localStorage.setItem(
    AUTH_STORAGE_KEYS.ACCESS_TOKEN,
    accessToken
  );
}

function removeAccessToken(): void {
  localStorage.removeItem(
    AUTH_STORAGE_KEYS.ACCESS_TOKEN
  );
}

function getUser(): User | null {
  const storedUser = localStorage.getItem(
    AUTH_STORAGE_KEYS.USER
  );

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(
      AUTH_STORAGE_KEYS.USER
    );

    return null;
  }
}

function setUser(user: User): void {
  localStorage.setItem(
    AUTH_STORAGE_KEYS.USER,
    JSON.stringify(user)
  );
}

function removeUser(): void {
  localStorage.removeItem(
    AUTH_STORAGE_KEYS.USER
  );
}

function clear(): void {
  removeAccessToken();
  removeUser();
}

export const authStorage = {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getUser,
  setUser,
  removeUser,
  clear,
};