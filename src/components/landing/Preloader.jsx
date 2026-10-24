'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SESSION_KEY = 'ate_preloader_seen';

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);
  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const skipRef = useRef(false);

  useEffect(() => {
    // Never show on client-side navigation, only first landing of the session
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) { setHidden(true); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setHidden(true);
      return;
    }

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setHidden(true);
      },
    });

    tl.to(counter, {
      v: 100,
      duration: 1.1,
      ease: 'power2.inOut',
      onUpdate: () => setCount(Math.round(counter.v)),
    })
    .to(overlayRef.current, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.8,
      ease: 'power4.inOut',
    }, '+=0.1');

    // Hard fallback — never block longer than 2.5s
    const failsafe = setTimeout(() => {
      if (!skipRef.current) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setHidden(true);
      }
    }, 2500);

    return () => { clearTimeout(failsafe); tl.kill(); };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[#050508]"
        style={{ clipPath: 'inset(0 0 0 0)' }}
      />
      <div className="relative z-10 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-cyan-300/70">
          After the Event
        </p>
        <p className="mt-4 font-mono text-7xl font-semibold tabular-nums text-white">
          {String(count).padStart(3, '0')}
        </p>
      </div>
    </div>
  );
}
