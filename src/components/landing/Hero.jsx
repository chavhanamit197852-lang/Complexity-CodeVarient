
'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import gsap from 'gsap';

const WORDS = ['Every', 'conversation', 'leads', 'somewhere.'];

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('.hero-word', {
        y: 45,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
      })
        .from('.hero-sub, .hero-cta', {
          y: 22,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
        }, '-=0.35')
        .from('.visual-card', {
          y: 35,
          opacity: 0,
          scale: 0.96,
          duration: 0.8,
          stagger: 0.12,
        }, '-=0.65');

      gsap.to('.float-card', {
        y: -10,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.35,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:px-16"
    >
      <div className="ambient pointer-events-none absolute inset-0 opacity-70" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
        {/* LEFT: Copy */}
        <div className="relative z-10">
          <p className="mb-6 text-xs uppercase tracking-[0.3em] text-cyan-300/80">
            After the Event
          </p>

          <h1 className="fluid-h1 max-w-4xl font-semibold tracking-tight">
            {WORDS.map((word, i) => (
              <span
                key={word}
                className="hero-word mr-2 inline-block sm:mr-3"
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="hero-sub mt-6 max-w-xl fluid-body text-white/65">
            Turn events and meetings into meaningful notes, clear actions,
            and thoughtful follow-ups.
          </p>

          <div className="hero-cta mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
            >
              Enter Workspace
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="#story"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/85 transition hover:border-cyan-300/50 hover:bg-white/5"
            >
              Explore the Experience
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-2 text-xs text-white/40">
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
            <span>Scroll to explore</span>
          </div>
        </div>

        {/* RIGHT: Visual collage */}
        <div className="relative mx-auto min-h-[470px] w-full max-w-[560px] sm:min-h-[560px]">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[100px]" />

          {/* Event photo */}
          <div className="visual-card float-card absolute left-[3%] top-[5%] w-[65%] rotate-[-7deg] overflow-hidden rounded-2xl border border-white/15 bg-[#101b2c] shadow-2xl shadow-cyan-950/40">
            <div className="relative h-48 sm:h-60">
              <img
                src="/images/event.jpg"
                alt="Audience at a professional event"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <p className="absolute bottom-4 left-4 text-sm font-medium text-white">
                Great conversations start here.
              </p>
            </div>
          </div>

          {/* Follow-up card */}
          <div className="visual-card float-card absolute right-0 top-[7%] z-20 w-[43%] rotate-[6deg] rounded-2xl border border-white/15 bg-[#f1edff] p-4 text-slate-900 shadow-xl sm:p-5">
            <p className="mb-3 text-sm font-semibold">Follow-ups</p>
            {['Send proposal', 'Book a demo', 'Share resources'].map((item) => (
              <div key={item} className="mb-3 flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-600" />
                <span>{item}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-500">3 actions to go</span>
          </div>

          {/* Workspace photo */}
          <div className="visual-card float-card absolute bottom-[5%] left-[1%] z-10 w-[61%] rotate-[5deg] overflow-hidden rounded-2xl border border-white/15 bg-[#101b2c] shadow-2xl">
            <div className="relative h-44 sm:h-56">
              <img
                src="/images/workspace.jpg"
                alt="Notebook and laptop on a desk"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <p className="absolute bottom-4 left-4 text-sm font-medium text-white">
                Ideas become action.
              </p>
            </div>
          </div>

          {/* Meeting notes UI card */}
          <div className="visual-card float-card absolute bottom-[13%] right-[1%] z-30 w-[55%] rotate-[-4deg] rounded-2xl border border-white/15 bg-[#0d1424]/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-cyan-400/15 p-2 text-cyan-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Meeting Notes</p>
                <p className="text-[10px] text-white/40">Product sync · Today</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-xs font-medium text-cyan-200">Key takeaway</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/60">
                  Finalize the product proposal and share it with the team.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-200">Next action</p>
                <p className="mt-1 text-[11px] text-white/60">
                  Follow up next Monday
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-[35%] -z-10 h-24 w-24 rounded-full bg-violet-500/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
