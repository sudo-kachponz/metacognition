'use client';

import React from 'react';
import { LogIn } from 'lucide-react';

export default function SignInPrompt() {
  const handleLogin = () => {
    if (typeof window !== 'undefined') {
      document.cookie = `bci_auth_token=bci-mock-session-token; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold text-gray-900">Akses Terbatas</h2>
        <p className="mt-2 text-sm text-gray-500">
          Sesi Anda belum terautentikasi. Silakan masuk menggunakan akun demo peneliti.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLogin}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <LogIn className="h-4 w-4" />
            Masuk Sesi (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
