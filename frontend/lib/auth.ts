// Mock auth utilities for scaffold v0.
// TODO: Replace with NextAuth / Clerk / hospital SSO (SAML) before clinical use.
// The mock token is stored in localStorage — never do this with real credentials.

import { cookies } from 'next/headers';

const MOCK_TOKEN = 'bci-mock-session-token';
const TOKEN_COOKIE = 'bci_auth_token';

/**
 * Server-side: check if the current request has a mock token cookie.
 * Returns true if "authenticated".
 */
export function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  return token === MOCK_TOKEN;
}

/**
 * Client-side: set the mock token cookie so server-side checks pass.
 */
export function setMockAuth(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=${MOCK_TOKEN}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

/**
 * Client-side: clear mock auth.
 */
export function clearMockAuth(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
}
