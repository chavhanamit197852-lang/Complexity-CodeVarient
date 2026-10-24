import Link from 'next/link';
import Hero from '@/components/landing/Hero';
import Story from '@/components/landing/Story';
import { FileText, Layers, Users, Repeat, ArrowRight } from 'lucide-react';
import FoldedScene from '@/components/three/FoldedScene';
const FEATURES = [
  { icon: FileText, title: 'Structured notes', body: 'Capture conversation context into readable, searchable notes.' },
  { icon: Layers, title: 'Task extraction',   body: 'Turn notes into owned, dated tasks in a single gesture.' },
  { icon: Users, title: 'Team alignment',     body: 'A shared source of truth for every meeting follow-up.' },
  { icon: Repeat, title: 'Follow-through',    body: 'Track open items, deadlines, and overdue actions at a glance.' },
];

export default function LandingPage() {
  return (
    <main className="relative">
       <FoldedScene />
      <Hero />
      <Story />

      <section className="border-t border-white/5 px-5 py-24 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Capabilities</p>
          <h2 className="mt-4 fluid-h2 max-w-2xl font-semibold tracking-tight">
            Built for teams that meet often and forget nothing.
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <Icon className="h-6 w-6 text-cyan-300" />
                  <p className="mt-4 font-medium text-white">{f.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 px-5 py-24 sm:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="fluid-h2 font-semibold tracking-tight">Ready to make the next step effortless?</h2>
          <p className="mt-5 text-white/60">Open the workspace. Drag a draft to create. Everything else follows.</p>
          <Link href="/dashboard" className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
            Enter Workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 px-5 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-white/40 sm:flex-row">
          <p>After the Event — built for teams that meet often.</p>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-white/80">Workspace</Link>
            <Link href="/login" className="hover:text-white/80">Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
