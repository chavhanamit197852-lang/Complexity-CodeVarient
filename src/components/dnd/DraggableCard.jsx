'use client';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function DraggableCard({
  id, type, data = {}, preview, disabled = false, withHandle = false, children, className,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id, data: { type, ...data, preview }, disabled,
  });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), touchAction: 'none' }
    : { touchAction: 'none' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl border border-white/10 bg-white/[0.035] backdrop-blur-sm transition-all',
        !withHandle && !disabled && 'cursor-grab active:cursor-grabbing',
        disabled && 'opacity-60 pointer-events-none',
        isDragging && 'opacity-30 ring-2 ring-cyan-400/50',
        className
      )}
      {...(withHandle ? {} : attributes)}
      {...(withHandle ? {} : listeners)}
    >
      {withHandle && (
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md p-1 text-white/40 transition hover:bg-white/5 hover:text-white/80 active:cursor-grabbing"
          aria-label={`Drag ${data.title ?? id}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}
