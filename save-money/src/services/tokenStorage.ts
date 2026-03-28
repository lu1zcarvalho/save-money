const TOKEN_STORAGE_KEY = "save-money:token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}
