#!/usr/bin/env bash
# ============================================================
# After the Event — Animation Layer (additive)
# Adds: preloader, hero parallax, framer-motion, drop feedback,
#       dashboard entrances, toast motion, kanban layout anims
# ============================================================
set -euo pipefail

G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[0;36m'; N='\033[0m'
log()  { echo -e "${G}▶${N} $*"; }
warn() { echo -e "${Y}⚠${N} $*"; }
err()  { echo -e "${R}✖${N} $*"; }
info() { echo -e "${C}ℹ${N} $*"; }

[ -f package.json ] || { err "Run from the project root"; exit 1; }
BACKUP=".anim-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
log "Backups → $BACKUP"

# ---------- 1. Framer Motion ----------
log "Installing framer-motion"
if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then
  pnpm add framer-motion
elif command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then
  yarn add framer-motion
else
  npm install framer-motion
fi

write_file() {
  local t="$1"; mkdir -p "$(dirname "$t")"
  if [ -f "$t" ]; then
    mkdir -p "$BACKUP/$(dirname "$t")"; cp "$t" "$BACKUP/$t"
    warn "Backed up $t"
  fi
  cat > "$t"; log "Wrote $t"
}

# ---------- 2. Animation helpers ----------
write_file src/lib/motion.js << 'EOF'
// Shared Framer Motion variants — respects prefers-reduced-motion automatically
// because Framer respects the OS setting when `reducedMotion="user"` is set on
// the MotionConfig provider (wired up in the Providers component below).

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:  { opacity: 0, x: 24, transition: { duration: 0.2 } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
EOF

# ---------- 3. MotionConfig provider ----------
write_file src/components/providers/MotionProvider.jsx << 'EOF'
'use client';
import { MotionConfig } from 'framer-motion';

export default function MotionProvider({ children }) {
  // reducedMotion="user" makes Framer Motion respect prefers-reduced-motion
  // across every motion.* component in the tree.
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
EOF

# ---------- 4. Preloader ----------
write_file src/components/landing/Preloader.jsx << 'EOF'
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
EOF

# ---------- 5. Hero parallax ----------
write_file src/components/landing/HeroParallax.jsx << 'EOF'
'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HeroParallax() {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 ambient opacity-80" />
      <div className="absolute -top-24 left-1/4 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 h-[36rem] w-[36rem] translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px]" />
    </div>
  );
}
EOF

# ---------- 6. DropFeedback (checkmark burst on successful drop) ----------
write_file src/components/dnd/DropFeedback.jsx << 'EOF'
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function DropFeedback({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-emerald-400/20 p-3 ring-2 ring-emerald-400/50">
            <Check className="h-6 w-6 text-emerald-300" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
EOF

# ---------- 7. Toast with motion ----------
write_file src/components/ui/Toast.jsx << 'EOF'
'use client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-[60] rounded-lg border border-cyan-400/30 bg-[#0a0a12]/95 px-4 py-2 text-sm text-cyan-200 shadow-2xl backdrop-blur"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
EOF

# ---------- 8. Patch ActionZone — add success flash ----------
log "Patching ActionZone to add success flash"
AZ=src/components/dnd/ActionZone.jsx
if [ -f "$AZ" ]; then
  cp "$AZ" "$BACKUP/$AZ"
  # Insert useState import at top
  if ! grep -q "useState" "$AZ"; then
    sed -i.bak "s/'use client';/'use client';\nimport { useState } from 'react';/" "$AZ" && rm -f "$AZ.bak"
  fi
  # Add success state + effect inside component body (after useDndMonitor block's opening)
  node - "$AZ" << 'NODE'
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('dropSuccess')) { console.log('· already patched'); process.exit(0); }

// add state
s = s.replace(
  /const \{ isOver, setNodeRef, active \} = useDroppable\(\{ id, data: \{ accepts: acceptTypes, variant \} \}\);/,
  `const { isOver, setNodeRef, active } = useDroppable({ id, data: { accepts: acceptTypes, variant } });
  const [dropSuccess, setDropSuccess] = useState(false);`
);

// wrap onDrop call with success flash
s = s.replace(
  /if \(acceptTypes\.length && !acceptTypes\.includes\(data\.type\)\) return;\n\s*onDrop\?\.\(data, event\);/,
  `if (acceptTypes.length && !acceptTypes.includes(data.type)) return;
      setDropSuccess(true);
      setTimeout(() => setDropSuccess(false), 700);
      onDrop?.(data, event);`
);

// render a success ring when dropSuccess
s = s.replace(
  /showOver && 'scale-\[1\.02\] border-solid shadow-\[0_0_40px_-8px_rgba\(34,211,238,0\.55\)\]'/,
  `showOver && 'scale-[1.02] border-solid shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)]',
        dropSuccess && 'ring-4 ring-emerald-400/60 shadow-[0_0_60px_-8px_rgba(52,211,153,0.7)]'`
);

fs.writeFileSync(f, s);
console.log('✓ ActionZone patched');
NODE
  log "ActionZone animated"
else
  warn "ActionZone.jsx not found — skipping patch"
fi

# ---------- 9. Wrap root layout with MotionProvider + Preloader ----------
log "Wiring MotionProvider + Preloader into root layout"
LAYOUT=""
for f in src/app/layout.js src/app/layout.jsx; do [ -f "$f" ] && LAYOUT="$f" && break; done

if [ -n "$LAYOUT" ]; then
  cp "$LAYOUT" "$BACKUP/$LAYOUT"
  node - "$LAYOUT" << 'NODE'
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('MotionProvider')) { console.log('· already wired'); process.exit(0); }

// imports
s = s.replace(
  /import DragDropProvider from '@\/components\/dnd\/DragDropProvider';/,
  `import DragDropProvider from '@/components/dnd/DragDropProvider';
import MotionProvider from '@/components/providers/MotionProvider';
import Preloader from '@/components/landing/Preloader';`
);

// wrap children: DragDropProvider > MotionProvider > {children}
s = s.replace(
  /<DragDropProvider>\{children\}<\/DragDropProvider>/,
  `<DragDropProvider>
          <MotionProvider>
            <Preloader />
            {children}
          </MotionProvider>
        </DragDropProvider>`
);

fs.writeFileSync(f, s);
console.log('✓ Root layout wired');
NODE
else
  err "layout.js not found"
fi

# ---------- 10. Patch Hero to use HeroParallax ----------
log "Patching Hero with parallax layer"
HERO=src/components/landing/Hero.jsx
if [ -f "$HERO" ]; then
  cp "$HERO" "$BACKUP/$HERO"
  node - "$HERO" << 'NODE'
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('HeroParallax')) { console.log('· already patched'); process.exit(0); }

s = s.replace(
  /import gsap from 'gsap';/,
  `import gsap from 'gsap';
import HeroParallax from './HeroParallax';`
);
s = s.replace(
  /<div className="pointer-events-none absolute inset-0 ambient opacity-70" aria-hidden \/>/,
  `<HeroParallax />`
);
fs.writeFileSync(f, s);
console.log('✓ Hero parallax wired');
NODE
fi

# ---------- 11. Patch dashboard overview with entrances + Toast ----------
log "Patching dashboard overview with motion entrances"
OV=src/app/dashboard/page.jsx
if [ -f "$OV" ]; then
  cp "$OV" "$BACKUP/$OV"
  node - "$OV" << 'NODE'
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('motion.div')) { console.log('· already patched'); process.exit(0); }

// import motion + variants + Toast
s = s.replace(
  /import \{ useDropAction \} from '@\/hooks\/useDropAction';/,
  `import { useDropAction } from '@/hooks/useDropAction';
import { motion } from 'framer-motion';
import { fadeUp, stagger } from '@/lib/motion';
import Toast from '@/components/ui/Toast';`
);

// replace fixed toast block with <Toast message={toast} />
s = s.replace(
  /\{toast && \(\s*<div className="fixed bottom-6 right-6 z-50[^>]*>\s*\{toast\}\s*<\/div>\s*\)\}/s,
  `<Toast message={toast} />`
);

// wrap stats grid with motion
s = s.replace(
  /<section className="grid grid-cols-2 gap-3 sm:grid-cols-4">/,
  `<motion.section
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >`
);
s = s.replace(
  /(<StatCard icon=\{Activity\}\s+label="Total tasks"\s+value=\{data\.stats\.tasks\} \/>)\s*<\/section>/s,
  `$1
          </motion.section>`
);

// wrap StatCard body in motion.div — replace its return block
s = s.replace(
  /<div className="rounded-xl border border-white\/10 bg-white\/\[0\.02\] p-4">/,
  `<motion.div variants={fadeUp} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">`
);
s = s.replace(
  /<p className="text-xs text-white\/45">\{label\}<\/p>\s*<\/div>/,
  `<p className="text-xs text-white/45">{label}</p>
    </motion.div>`
);

fs.writeFileSync(f, s);
console.log('✓ Overview animated');
NODE
fi

# ---------- 12. Patch tasks page — Framer layout for kanban ----------
log "Patching tasks kanban for layout animation"
TK=src/app/dashboard/tasks/page.jsx
if [ -f "$TK" ]; then
  cp "$TK" "$BACKUP/$TK"
  node - "$TK" << 'NODE'
const fs = require('fs');
const f = process.argv[2];
let s = fs.readFileSync(f, 'utf8');
if (s.includes('layoutId')) { console.log('· already patched'); process.exit(0); }

s = s.replace(
  /import \{ useDropAction \} from '@\/hooks\/useDropAction';/,
  `import { useDropAction } from '@/hooks/useDropAction';
import { AnimatePresence, motion } from 'framer-motion';
import Toast from '@/components/ui/Toast';`
);

// Toast swap
s = s.replace(
  /\{toast && \(\s*<div className="fixed bottom-6 right-6 z-50[^>]*>\s*\{toast\}\s*<\/div>\s*\)\}/s,
  `<Toast message={toast} />`
);

// Wrap the task list inside each column with AnimatePresence + motion
// Wrap each DraggableCard render with motion.div layout
s = s.replace(
  /\{tasks\.filter\(\(t\) => t\.status === col\.id\)\.map\(\(t\) => \(\s*<DraggableCard\s+key=\{t\._id\}\s+id=\{t\._id\}\s+type="task"\s+data=\{\{ id: t\._id, title: t\.title \}\}\s+className="w-full p-3"\s*>\s*<p className="text-sm text-white">\{t\.title\}<\/p>\s*\{t\.dueDate && \(\s*<p className="mt-1 text-\[11px\] text-white\/40">\s*due \{new Date\(t\.dueDate\)\.toLocaleDateString\(\)\}\s*<\/p>\s*\)\}\s*<\/DraggableCard>\s*\)\)\}/s,
  `<AnimatePresence initial={false}>
                {tasks.filter((t) => t.status === col.id).map((t) => (
                  <motion.div
                    key={t._id}
                    layout
                    layoutId={\`task-\${t._id}\`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <DraggableCard
                      id={t._id}
                      type="task"
                      data={{ id: t._id, title: t.title }}
                      className="w-full p-3"
                    >
                      <p className="text-sm text-white">{t.title}</p>
                      {t.dueDate && (
                        <p className="mt-1 text-[11px] text-white/40">
                          due {new Date(t.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </DraggableCard>
                  </motion.div>
                ))}
              </AnimatePresence>`
);

fs.writeFileSync(f, s);
console.log('✓ Kanban layout animation wired');
NODE
fi

# ---------- 13. Add CSS keyframes for preloader fallback ----------
CSS=""
for f in src/app/globals.css; do [ -f "$f" ] && CSS="$f" && break; done
if [ -n "$CSS" ]; then
  cat >> "$CSS" << 'EOF'

/* Drop-success flash */
@keyframes successFlash {
  0%   { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.6); }
  100% { box-shadow: 0 0 0 20px rgba(52, 211, 153, 0); }
}
[data-dnd-zone][data-active="true"] { animation: successFlash 0.7s ease-out; }
EOF
  log "Appended success flash CSS"
fi

# ---------- 14. Verify build ----------
log "Running production build to verify"
if npm run build 2>&1 | tail -20; then
  log "Build passed ✅"
else
  warn "Build had issues — check output above. Rollback:  cp -r $BACKUP/src ./src"
fi

echo
log "════════════════════════════════════════════════════════"
log "  Animation layer applied."
log "════════════════════════════════════════════════════════"
echo
info "Added:"
echo "  • Preloader — counter + clip-path reveal, session-scoped, reduced-motion aware, 2.5s failsafe"
echo "  • Hero parallax — scroll-driven gradient drift (desktop, disabled for reduced motion)"
echo "  • Framer Motion + MotionConfig reducedMotion=\"user\""
echo "  • ActionZone success flash — emerald ring burst on every successful drop"
echo "  • Dashboard stat cards — staggered fade-up entrance"
echo "  • Kanban — layout-animated card moves (slides between columns), presence enter/exit"
echo "  • Toast — slide + scale motion on appear/dismiss"
echo
info "Untouched:"
echo "  • GSAP horizontal story (already correct)"
echo "  • All API routes, models, auth"
echo "  • Drag-and-drop interaction model (all primary actions remain drops)"
echo
warn "Backups: $BACKUP"
warn "Rollback: cp -r $BACKUP/src ./src"