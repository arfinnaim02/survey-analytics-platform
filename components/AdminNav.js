import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminNav() {
  const router = useRouter();

  const items = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/responses', label: 'Responses' },
    { href: '/admin/analytics', label: 'Analytics' },
  ];

  return (
    <div className="mb-8 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Research Admin
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Survey Control Panel</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {items.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
            onClick={async () => {
              await fetch('/api/logout');
              window.location.href = '/admin/login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}