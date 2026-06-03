// Dashboard shell — protected route.
// Layout wraps all /dashboard/* pages with sidebar navigation.
//
// Auth: currently uses a mock token check. If the cookie is missing,
// we show a "sign in" button that plants the mock token and reloads.
// This is scaffold-only — see lib/auth.ts TODO.

import Link from 'next/link';
import { Brain, Activity, Sliders, History, Settings, LogIn } from 'lucide-react';
import { isAuthenticated, setMockAuth } from '@/lib/auth';

import SignInPrompt from './SignInPrompt';

const navItems = [
  { href: '/dashboard/live', label: 'Live Decoder', icon: Activity },
  { href: '/dashboard/calibration', label: 'Kalibrasi', icon: Sliders },
  { href: '/dashboard/history', label: 'Riwayat Sesi', icon: History },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authed = isAuthenticated();

  if (!authed) {
    return <SignInPrompt />;
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/40 lg:flex" aria-label="Navigasi Dashboard">
        <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
          <Brain className="h-5 w-5 text-primary" />
          NeuroSuara
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2" aria-label="Dashboard">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile hamburger could go here) */}
        <header className="flex h-14 items-center gap-4 border-b px-6 lg:hidden">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold">NeuroSuara</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
