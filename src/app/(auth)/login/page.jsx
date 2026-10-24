'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActionZone, DraggableCard } from '@/components/dnd';
import { useDropAction } from '@/hooks/useDropAction';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { run, pending, error } = useDropAction();

  const onDrop = () => run(async () => {
    if (!email || !password) throw new Error('Enter email and password first');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Login failed');
    router.push('/dashboard');
  });

  return (
    <main className="relative min-h-screen px-5 py-16">
      <div className="pointer-events-none absolute inset-0 ambient opacity-50" aria-hidden />
      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="text-xs uppercase tracking-[0.3em] text-white/50">← After the Event</Link>
        <h1 className="mt-6 text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-white/55">
          Type your credentials into the card, then drag it into the Sign In zone.
        </p>

        <div className="mt-8 space-y-5">
          <DraggableCard
            id="login-draft"
            type="login-draft"
            withHandle
            data={{ title: email || 'Login draft' }}
          >
            <div className="space-y-3 p-5 pr-12">
              <div>
                <label className="text-xs text-white/50">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
                  placeholder="you@team.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </DraggableCard>

          <ActionZone
            id="login-zone"
            label={pending ? 'Signing in…' : '↓ Drop here to sign in'}
            description="Release the credentials card"
            variant="auth"
            acceptTypes={['login-draft']}
            onDrop={onDrop}
            className="min-h-[120px]"
          >
            <Lock className="h-4 w-4 text-indigo-300/70" />
          </ActionZone>

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <p className="text-center text-sm text-white/50">
            No account?{' '}
            <Link href="/register" className="text-cyan-300 hover:text-cyan-200">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
