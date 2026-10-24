'use client';
import { useCallback, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor, KeyboardSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core';

export default function DragDropProvider({ children }) {
  const [active, setActive] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );
  const onStart = useCallback((e) => setActive(e.active?.data?.current ?? null), []);
  const onEnd = useCallback(() => setActive(null), []);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={onEnd}>
      {children}
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="rounded-xl border border-cyan-400/50 bg-[#0a0a12] px-4 py-3 shadow-[0_20px_60px_-20px_rgba(34,211,238,0.6)]">
            <p className="text-sm font-medium text-white">{active.title || 'Dragging…'}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
