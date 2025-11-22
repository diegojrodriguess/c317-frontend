// Allow usage of process.env in client-side TS without TS complaining in this file context
declare const process: any;
export const API_BASE_URL = (process?.env?.NEXT_PUBLIC_API_BASE_URL as string) || 'http://localhost:3000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof window === 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserIdFromToken(): string | undefined {
  const token = getAuthToken();
  if (!token) return undefined;
  const payload = decodeJwtPayload(token);
  return payload?.sub as string | undefined;
}
