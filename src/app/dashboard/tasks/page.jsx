'use client';
import { useCallback, useEffect, useState } from 'react';
import { ActionZone, DraggableCard } from '@/components/dnd';
import { useDropAction } from '@/hooks/useDropAction';

const COLUMNS = [
  { id: 'pending',     label: 'Pending' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'completed',   label: 'Completed' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [toast, setToast] = useState(null);
  const { run } = useDropAction();

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/tasks');
    const json = await res.json();
    if (json.success) setTasks(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2000); };

  const onCreate = (card) => run(async () => {
    if (!card.title?.trim()) return notify('⚠ Add a title first');
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: card.title }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message);
    setTitle('');
    notify('✓ Task created');
    load();
  });

  const onMove = (status) => (card) => run(async () => {
    const res = await fetch(`/api/tasks/${card.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message);
    notify(`✓ → ${status}`);
    load();
  });

  const onTrash = (card) => run(async () => {
    const res = await fetch(`/api/tasks/${card.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message);
    notify('🗑 Deleted');
    load();
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="mt-1 text-sm text-white/55">
          Create a task by dragging the draft into a column. Move between columns by dragging.
        </p>
      </header>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-cyan-400/30 bg-[#0a0a12] px-4 py-2 text-sm text-cyan-200 shadow-2xl">
          {toast}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <DraggableCard id="t-draft" type="task-draft" withHandle data={{ title: title || 'Untitled task' }}>
          <div className="p-5 pr-12">
            <label className="text-xs text-white/50">New task title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-cyan-400/50"
              placeholder="e.g. Send recap email"
            />
            <p className="mt-2 text-xs text-white/40">Drag into any column below to create.</p>
          </div>
        </DraggableCard>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ActionZone id="t-trash" label="🗑 Trash" variant="delete" acceptTypes={['task']} onDrop={onTrash} className="min-h-[100px]" />
          <ActionZone id="t-hint" label="Drag tasks left or right" variant="view" acceptTypes={[]} className="min-h-[100px] opacity-70" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <ActionZone
            key={col.id}
            id={`col-${col.id}`}
            label={col.label}
            variant="status"
            acceptTypes={['task', 'task-draft']}
            onDrop={(card) => {
              if (card.type === 'task-draft') return onCreate(card);
              if (card.type === 'task') return onMove(col.id)(card);
            }}
            className="!items-stretch !text-left min-h-[280px]"
          >
            <div className="mt-3 w-full space-y-2">
              {loading && <p className="text-xs text-white/40">Loading…</p>}
              {!loading && tasks.filter((t) => t.status === col.id).length === 0 && (
                <p className="text-xs text-white/30">Drop a task here</p>
              )}
              {tasks.filter((t) => t.status === col.id).map((t) => (
                <DraggableCard
                  key={t._id}
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
              ))}
            </div>
          </ActionZone>
        ))}
      </section>
    </div>
  );
}
