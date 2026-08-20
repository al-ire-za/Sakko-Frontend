// Central API Configuration and Utility Functions for Sakko

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("access_token");
}

export function setAuthTokens(access: string, refresh?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", access);
  localStorage.setItem("access_token", access);
  if (refresh) {
    localStorage.setItem("refreshToken", refresh);
  }
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function getSavedUser(): any | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setSavedUser(user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function getAuthHeaders(
  extraHeaders: Record<string, string> = {},
  isJson: boolean = true
): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return { ...headers, ...extraHeaders };
}

/**
 * Format a Date object to YYYY-MM-DD using local timezone (NOT UTC)
 */
export function formatDateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format Date to Persian locale string
 */
export function formatPersianDate(date: Date): string {
  try {
    const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date);
    const day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(date);
    const month = new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(date);
    const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(date);
    return `${weekday} ، ${day} ${month} ، ${year}`;
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

/**
 * Ensures media/file URLs are absolute
 */
export function fixFileUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = url.replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}
