
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActionZone, DraggableCard } from '@/components/dnd';
import { useDropAction } from '@/hooks/useDropAction';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { run, pending, error } = useDropAction();

  const onRegister = () =>
    run(async () => {
      const normalizedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedName || !normalizedEmail || !password) {
        throw new Error('Please fill in every field.');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      let res;
      let json;

      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: normalizedName,
            email: normalizedEmail,
            password,
          }),
        });

        json = await res.json();
      } catch {
        throw new Error('Unable to connect to the server. Please try again.');
      }

      if (!res.ok || !json?.success) {
        throw new Error(
          json?.error?.message || 'Registration failed. Please try again.'
        );
      }

      router.push('/dashboard');
      router.refresh();
    });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050508] px-4 py-10 sm:px-6 sm:py-16">
      <div
        aria-hidden="true"
        className="ambient pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white"
        >
          ← After the Event
        </Link>

        <header className="mt-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/70">
            Your next chapter
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Create your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            Create a workspace for your conversations, notes, and next steps.
          </p>
        </header>

        <form
          className="mt-8 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onRegister();
          }}
        >
          <DraggableCard
            id="register-draft"
            type="register-draft"
            withHandle
            data={{ title: email || 'Register draft' }}
          >
            <div className="space-y-4 p-5 pr-12">
              <div>
                <label
                  htmlFor="register-name"
                  className="text-xs text-white/65"
                >
                  Full name
                </label>

                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                  placeholder="Ada Lovelace"
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="text-xs text-white/65"
                >
                  Email address
                </label>

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                  placeholder="you@team.com"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="text-xs text-white/65"
                >
                  Password
                </label>

                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                  placeholder="At least 8 characters"
                />

                <p className="mt-2 text-[11px] text-white/35">
                  Use at least 8 characters.
                </p>
              </div>
            </div>
          </DraggableCard>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {pending ? 'Creating account…' : 'Create account'}
          </button>

          <ActionZone
            id="register-zone"
            label={pending ? 'Creating account…' : '↓ Drop here to create account'}
            description="Or drag your registration card here"
            variant="auth"
            acceptTypes={['register-draft']}
            onDrop={onRegister}
            className="min-h-[120px]"
          >
            <UserPlus className="h-4 w-4 text-indigo-300/70" />
          </ActionZone>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-cyan-300 transition-colors hover:text-cyan-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
