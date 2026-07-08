import { apiFetch } from "@/lib/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

const TOKEN_KEY = "quizflow_token";
const USER_KEY = "quizflow_user";

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(payload: LoginPayload) {
  const data = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth(data.token, data.user);

  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const data = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  saveAuth(data.token, data.user);

  return data;
}

export async function getCurrentUser() {
  const data = await apiFetch<{ user: AuthUser }>("/auth/me", {
    method: "GET",
    auth: true,
  });

  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data.user;
}