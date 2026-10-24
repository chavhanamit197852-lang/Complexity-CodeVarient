import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import { LayoutDashboard, Calendar, CheckSquare } from 'lucide-react';

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-white/5 bg-black/30 px-4 py-4 lg:w-60 lg:border-b-0 lg:border-r lg:py-6">
        <Link href="/" className="block text-xs uppercase tracking-[0.3em] text-white/50 lg:mb-8">
          After the Event
        </Link>
        <nav className="mt-4 flex flex-wrap gap-2 lg:mt-0 lg:flex-col lg:gap-1">
          <NavLink href="/dashboard"          icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" />
          <NavLink href="/dashboard/meetings" icon={<Calendar className="h-4 w-4" />}        label="Meetings" />
          <NavLink href="/dashboard/tasks"    icon={<CheckSquare className="h-4 w-4" />}     label="Tasks" />
        </nav>
        <div className="mt-6 lg:mt-8">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
