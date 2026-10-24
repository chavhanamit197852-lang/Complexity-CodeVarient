'use client';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { cn } from '@/lib/cn';

const VARIANTS = {
  create: 'border-cyan-400/30    from-cyan-500/10    to-blue-500/10',
  save:   'border-violet-400/30  from-violet-500/10  to-fuchsia-500/10',
  delete: 'border-red-400/30     from-red-500/10     to-orange-500/10',
  status: 'border-emerald-400/30 from-emerald-500/10 to-teal-500/10',
  auth:   'border-indigo-400/30  from-indigo-500/10  to-purple-500/10',
  view:   'border-white/10       from-white/[0.04]   to-white/[0.02]',
};

export default function ActionZone({
  id, label, description, variant = 'create',
  acceptTypes = [], onDrop, children, className,
}) {
  const { isOver, setNodeRef, active } = useDroppable({ id, data: { accepts: acceptTypes, variant } });

  useDndMonitor({
    onDragEnd(event) {
      if (event.over?.id !== id) return;
      const data = event.active?.data?.current;
      if (!data) return;
      if (acceptTypes.length && !acceptTypes.includes(data.type)) return;
      onDrop?.(data, event);
    },
  });

  const activeType = active?.data?.current?.type;
  const compatible = !acceptTypes.length || acceptTypes.includes(activeType);
  const showOver   = isOver && compatible;

  return (
    <div
      ref={setNodeRef}
      role="region"
      aria-label={label}
      data-dnd-zone={id}
      data-active={showOver ? 'true' : 'false'}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200 bg-gradient-to-br',
        VARIANTS[variant] ?? VARIANTS.create,
        active && compatible && 'animate-pulse-slow ring-2 ring-cyan-400/40',
        showOver && 'scale-[1.02] border-solid shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)]',
        active && !compatible && 'opacity-40',
        className
      )}
    >
      <div className="pointer-events-none select-none">
        <p className="text-sm font-semibold text-white">{label}</p>
        {description && <p className="mt-1 text-xs leading-relaxed text-white/55">{description}</p>}
      </div>
      {children}
    </div>
  );
}
