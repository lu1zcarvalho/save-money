import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth";
import { apiRequest } from "./api";
import { clearToken, getStoredToken, saveToken } from "./tokenStorage";

export function hasStoredSession(): boolean {
  return Boolean(getStoredToken());
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    withAuth: false,
  });

  saveToken(response.token);
  return response;
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    withAuth: false,
  });

  saveToken(response.token);
  return response;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiRequest<{ user: User }>("/auth/me");
  return response.user;
}

export function logoutUser(): void {
  clearToken();
}
