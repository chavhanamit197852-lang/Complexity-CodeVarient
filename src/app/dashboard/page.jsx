
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { ActionZone, DraggableCard } from '@/components/dnd';
import { useDropAction } from '@/hooks/useDropAction';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [toast, setToast] = useState(null);
  const { run } = useDropAction();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Unable to load dashboard');
      }

      setData(json.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type });

    // Clear an earlier notification before scheduling a new one.
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const onCreateMeeting = (card) =>
    run(async () => {
      if (!card.title?.trim() || card.title === 'Untitled') {
        notify('Add a meeting title first', 'error');
        return;
      }

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: card.title.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not create meeting');
      }

      setDraftTitle('');
      notify('Meeting created successfully');
      await load();
    });

  const onMoveStatus = (status) => (card) =>
    run(async () => {
      const res = await fetch(`/api/tasks/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not update task');
      }

      notify(`Task moved to ${status}`);
      await load();
    });

  const onTrash = (card) =>
    run(async () => {
      const route = card.type === 'task' ? 'tasks' : 'meetings';

      const res = await fetch(`/api/${route}/${card.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not delete item');
      }

      notify('Item deleted');
      await load();
    });

  const stats = data
    ? [
        {
          label: 'Total meetings',
          value: data.stats.meetings,
          icon: Calendar,
          color: 'text-cyan-300',
          glow: 'bg-cyan-400/10',
          description: 'Meetings in your workspace',
        },
        {
          label: 'Open tasks',
          value: data.stats.openTasks,
          icon: CheckCircle2,
          color: 'text-amber-300',
          glow: 'bg-amber-400/10',
          description: 'Still need your attention',
        },
        {
          label: 'Meeting notes',
          value: data.stats.notes,
          icon: FileText,
          color: 'text-violet-300',
          glow: 'bg-violet-400/10',
          description: 'Knowledge captured',
        },
        {
          label: 'All tasks',
          value: data.stats.tasks,
          icon: Activity,
          color: 'text-emerald-300',
          glow: 'bg-emerald-400/10',
          description: 'Across your workspace',
        },
      ]
    : [];

  return (
    <main className="relative mx-auto max-w-[1440px] space-y-8 pb-12">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-500/[0.07] blur-[100px]"
      />

      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-300/80">
            <Sparkles className="h-3.5 w-3.5" />
            Your workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Overview<span className="text-cyan-300">.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Everything discussed, organized, and ready for what comes next.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition hover:border-cyan-300/30 hover:bg-white/[0.07] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh overview
        </button>
      </header>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
            toast.type === 'error'
              ? 'border-rose-400/20 bg-[#180d15] text-rose-200'
              : 'border-emerald-400/20 bg-[#0b1715] text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <Activity className="h-4 w-4 shrink-0" />
          ) : (
            <Check className="h-4 w-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-rose-200">
              Couldn't load your workspace
            </p>
            <p className="mt-1 text-sm text-white/45">{error}</p>
          </div>

          <button
            onClick={load}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Stats */}
          <section
            aria-label="Workspace statistics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0b0d14]/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.035]"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${stat.glow} blur-3xl transition group-hover:scale-125`}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/50">{stat.label}</p>
                      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                        {stat.value ?? 0}
                      </p>
                    </div>

                    <div className={`rounded-xl border border-white/[0.07] bg-white/[0.04] p-3 ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="relative mt-4 text-xs text-white/35">
                    {stat.description}
                  </p>
                </article>
              );
            })}
          </section>

          {/* Workflow introduction */}
          <section className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-400/[0.09] via-[#0c111b] to-violet-400/[0.06] p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-20 h-52 w-52 rounded-full bg-cyan-300/[0.07] blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200 sm:flex">
                  <Zap className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                    Your action center
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                    Move work forward, naturally.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    Drag a meeting draft to create it, move a task to complete,
                    or drop an item in the trash zone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 lg:self-center">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.6)]" />
                Drag-and-drop enabled
              </div>
            </div>
          </section>

          {/* Quick create */}
          <section className="space-y-4">
            <SectionHeading
              eyebrow="Get started"
              title="Quick create"
              description="Start with a meeting draft and drop it into the create zone."
            />

            <div className="grid items-stretch gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-300/10 p-2.5 text-cyan-200">
                    <Plus className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">New meeting</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      Create a draft to get started
                    </p>
                  </div>
                </div>

                <DraggableCard
                  id="ov-draft"
                  type="meeting-draft"
                  withHandle
                  data={{ title: draftTitle || 'Untitled' }}
                >
                  <div className="p-3 pr-12">
                    <label
                      htmlFor="meeting-title"
                      className="text-xs font-medium text-white/50"
                    >
                      Meeting title
                    </label>

                    <input
                      id="meeting-title"
                      value={draftTitle}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      placeholder="e.g. Product strategy review"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                    />

                    <p className="mt-3 text-xs text-white/35">
                      <Layers3 className="mr-1 inline h-3.5 w-3.5" />
                      Drag this card using its handle.
                    </p>
                  </div>
                </DraggableCard>
              </div>

              <ActionZone
                id="ov-create"
                label="＋ Drop here to create meeting"
                variant="create"
                acceptTypes={['meeting-draft']}
                onDrop={onCreateMeeting}
              />
            </div>
          </section>

          {/* Work lists */}
          <section className="space-y-4">
            <SectionHeading
              eyebrow="Stay on top of things"
              title="Your work"
              description="Drag meetings or tasks into an action zone below."
            />

            <div className="grid gap-5 xl:grid-cols-2">
              {/* Meetings */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-violet-300/10 p-2.5 text-violet-200">
                      <Calendar className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Recent meetings
                      </h3>
                      <p className="mt-1 text-xs text-white/40">
                        {data.recentMeetings.length} recent items
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/40">
                    Meetings
                  </span>
                </div>

                <div className="space-y-3">
                  {data.recentMeetings.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Nothing on the calendar yet"
                      description="Create your first meeting using the draft above."
                    />
                  ) : (
                    data.recentMeetings.map((meeting) => (
                      <DraggableCard
                        key={meeting._id}
                        id={meeting._id}
                        type="meeting"
                        data={{
                          id: meeting._id,
                          title: meeting.title,
                        }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-white/[0.05] p-2 text-white/50">
                            <FileText className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-white">
                              {meeting.title}
                            </p>

                            <p className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
                              <Clock3 className="h-3.5 w-3.5" />
                              {new Date(
                                meeting.date || meeting.createdAt
                              ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          <ArrowDownRight className="h-4 w-4 shrink-0 text-white/25" />
                        </div>
                      </DraggableCard>
                    ))
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-300/10 p-2.5 text-amber-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Pending tasks
                      </h3>
                      <p className="mt-1 text-xs text-white/40">
                        {data.pendingTasks.length} items need attention
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.05] px-2.5 py-1 text-xs text-amber-200/70">
                    To do
                  </span>
                </div>

                <div className="space-y-3">
                  {data.pendingTasks.length === 0 ? (
                    <EmptyState
                      icon={CheckCircle2}
                      title="You're all caught up"
                      description="No pending tasks are waiting here."
                    />
                  ) : (
                    data.pendingTasks.map((task) => (
                      <DraggableCard
                        key={task._id}
                        id={task._id}
                        type="task"
                        data={{
                          id: task._id,
                          title: task.title,
                        }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-amber-300/[0.07] p-2 text-amber-200/80">
                            <CheckSquareIcon />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-white">
                              {task.title}
                            </p>
                            <p className="mt-2 text-xs capitalize text-white/40">
                              {task.status || 'pending'}
                            </p>
                          </div>

                          <ArrowDownRight className="h-4 w-4 shrink-0 text-white/25" />
                        </div>
                      </DraggableCard>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Drop zones */}
          <section className="space-y-4">
            <SectionHeading
              eyebrow="Take action"
              title="Drop zones"
              description="Choose where the work should go next."
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <ActionZone
                id="ov-complete"
                label="✓ Drop tasks here to mark complete"
                variant="status"
                acceptTypes={['task']}
                onDrop={onMoveStatus('completed')}
              />

              <ActionZone
                id="ov-trash"
                label="🗑 Drop items here to delete"
                variant="delete"
                acceptTypes={['task', 'meeting']}
                onDrop={onTrash}
              />
            </div>
          </section>

          {/* Footer note */}
          <footer className="flex flex-col gap-2 border-t border-white/[0.07] pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Small actions create meaningful progress.
            </span>
            <span>After the Event · Workspace overview</span>
          </footer>
        </>
      )}
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/65">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-white/40">{description}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-8 text-center">
      <Icon className="h-6 w-6 text-white/25" />
      <p className="mt-3 text-sm font-medium text-white/65">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-white/35">
        {description}
      </p>
    </div>
  );
}

function CheckSquareIcon() {
  return <CheckCircle2 className="h-4 w-4" />;
}
