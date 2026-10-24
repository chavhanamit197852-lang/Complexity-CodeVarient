'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PANELS = [
  { id: 'capture',  label: 'Capture',       title: 'Every detail matters.',      body: 'Notes from every conversation, organized the moment the meeting ends.' },
  { id: 'organize', label: 'Organize',      title: 'Turn thoughts into action.', body: 'Extract tasks, owners, and deadlines from the noise — automatically.' },
  { id: 'connect',  label: 'Connect',       title: 'Keep everyone aligned.',     body: 'One shared timeline for meetings, notes, and follow-ups across the team.' },
  { id: 'follow',   label: 'Follow Through', title: 'Make the next step effortless.', body: 'Drag a task into the next stage — always know what comes after.' },
];
function PanelVisual({ type }) {
  const visuals = {
    capture: {
      image: '/images/event.jpg',
      label: 'Meeting captured',
      detail: 'Your conversations, organized.',
    },
    organize: {
      image: '/images/workspace.jpg',
      label: 'Action items extracted',
      detail: 'Tasks, owners and deadlines.',
    },
    connect: {
      image: '/images/event.jpg',
      label: 'Team timeline',
      detail: 'Everyone stays aligned.',
    },
    follow: {
      image: '/images/workspace.jpg',
      label: 'Next steps',
      detail: 'Turn plans into progress.',
    },
  };

  const visual = visuals[type];

  return (
    <div className="group relative mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-950/20">
      <div className="relative h-56 sm:h-72">
        <img
          src={visual.image}
          alt={visual.label}
          className="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-black/10 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-sm font-medium text-cyan-200">
            {visual.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {visual.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Story() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = trackRef.current;
      const panels = track.querySelectorAll('[data-panel]');
      const totalWidth = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -totalWidth(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => '+=' + totalWidth(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      panels.forEach((panel) => {
        gsap.from(panel.querySelectorAll('[data-anim]'), {
          y: 40, opacity: 0, duration: 0.8, stagger: 0.1,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: tween, // ← the actual horizontal tween
            start: 'left 70%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    mm.add('(max-width: 1023px)', () => {
      const panels = sectionRef.current.querySelectorAll('[data-panel]');
      panels.forEach((panel) => {
        gsap.from(panel.querySelectorAll('[data-anim]'), {
          y: 30, opacity: 0, duration: 0.7, stagger: 0.08,
          scrollTrigger: { trigger: panel, start: 'top 82%' },
        });
      });
      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} id="story" className="relative overflow-hidden">
      <div className="hidden lg:block">
        <div ref={trackRef} className="flex h-screen items-center">
          {PANELS.map((p, i) => (
            <article
              key={p.id}
              data-panel
              className="flex h-screen w-screen shrink-0 flex-col justify-center px-16 xl:px-24"
            >
              <p data-anim className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
                0{i + 1} — {p.label}
              </p>
              <h2 data-anim className="mt-6 max-w-3xl fluid-h2 font-semibold tracking-tight">
                {p.title}
              </h2>
              <p data-anim className="mt-6 max-w-xl fluid-body text-white/60">
                {p.body}
              </p>
             <div data-anim>
       <PanelVisual type={p.id} />
</div>
            </article>
          ))}
        </div>
      </div>

      <div className="lg:hidden">
        {PANELS.map((p, i) => (
          <article key={p.id} data-panel className="border-t border-white/5 px-6 py-20">
            <p data-anim className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              0{i + 1} — {p.label}
            </p>
            <h2 data-anim className="mt-5 fluid-h2 font-semibold tracking-tight">{p.title}</h2>
            <p data-anim className="mt-4 fluid-body text-white/60">{p.body}</p>
            <div data-anim className="mt-8 grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, k) => (
                <div data-anim>
  <PanelVisual type={p.id} />
</div>      ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
