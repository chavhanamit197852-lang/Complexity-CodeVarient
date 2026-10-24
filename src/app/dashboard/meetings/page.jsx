
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionZone, DraggableCard } from '@/components/dnd';
import { useDropAction } from '@/hooks/useDropAction';
import gsap from 'gsap';
import {
  CalendarDays,
  Clock3,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  ArrowDown,
  RefreshCw,
} from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState(null);

  const pageRef = useRef(null);
  const toastTimer = useRef(null);
  const { run } = useDropAction();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/meetings');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load meetings');
      }

      setMeetings(json.data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Entrance animation
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      intro
        .from('[data-intro]', {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
        })
        .from(
          '[data-compose]',
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            stagger: 0.15,
          },
          '-=0.3'
        );
    }, root);

    return () => {
      ctx.revert();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Animate newly rendered meeting cards without taking control of React's DOM.
  useEffect(() => {
    if (loading || !pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-meeting-card]',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [meetings, loading]);

  const notify = useCallback((message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const onCreate = (card) =>
    run(async () => {
      if (!card.title?.trim() || card.title === 'Untitled meeting') {
        notify('Add a meeting title first', 'error');
        return;
      }

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: card.title.trim(),
          description: description.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not create meeting');
      }

      setTitle('');
      setDescription('');
      notify('Meeting created successfully');
      await load();
    });

  const onTrash = (card) =>
    run(async () => {
      const res = await fetch(`/api/meetings/${card.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Could not delete meeting');
      }

      notify('Meeting deleted');
      await load();
    });

  return (
    <main
      ref={pageRef}
      className="relative mx-auto max-w-7xl space-y-9 overflow-hidden pb-12"
    >
      {/* Ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-[100px]"
      />

      {/* Header */}
      <header
        data-intro
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-300/75">
            <Sparkles className="h-3.5 w-3.5" />
            Workspace / Meetings
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Meetings<span className="text-cyan-300">.</span>
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Capture the conversation. Keep the next step moving.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm text-white/70 transition duration-300 hover:border-cyan-300/30 hover:bg-white/[0.07] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
            toast.type === 'error'
              ? 'border-rose-400/20 bg-[#170c12] text-rose-200'
              : 'border-cyan-300/20 bg-[#08151a] text-cyan-100'
          }`}
        >
          {toast.type === 'error' ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              ✓
            </span>
          )}
          {toast.message}
        </div>
      )}

      {/* Intro banner */}
      <section
        data-intro
        className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.09] via-[#0b1019] to-violet-400/[0.06] p-5 sm:p-7"
      >
        <div className="pointer-events-none absolute -right-8 -top-20 h-52 w-52 rounded-full bg-cyan-300/[0.08] blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200 sm:flex">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/70">
                Meeting studio
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Make every conversation count.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Create a meeting draft, then drag it into the highlighted
                drop zone to save it to your workspace.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Drag-and-drop enabled
          </div>
        </div>
      </section>

      {/* Create meeting */}
      <section className="space-y-4">
        <div data-intro>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/65">
            Start something new
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Create a meeting
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Add the details below and drag the draft to the create zone.
          </p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <div data-compose>
            <DraggableCard
              id="m-draft"
              type="meeting-draft"
              withHandle
              data={{ title: title || 'Untitled meeting' }}
            >
              <div className="space-y-5 p-5 pr-12 sm:p-6 sm:pr-12">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] p-2.5 text-cyan-200">
                    <Plus className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      Meeting draft
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Drag using the card handle
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="meeting-title"
                    className="text-xs font-medium text-white/55"
                  >
                    Meeting title
                  </label>
                  <input
                    id="meeting-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design sync"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="meeting-description"
                    className="text-xs font-medium text-white/55"
                  >
                    Description
                  </label>
                  <textarea
                    id="meeting-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What should this meeting accomplish?"
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-white/35">
                  <FileText className="h-3.5 w-3.5" />
                  You can add notes and follow-ups after creating it.
                </div>
              </div>
            </DraggableCard>
          </div>

          <div data-compose className="min-h-64">
            <ActionZone
              id="m-create"
              label="＋ Drop here to create meeting"
              variant="create"
              acceptTypes={['meeting-draft']}
              onDrop={onCreate}
            />
          </div>
        </div>
      </section>

      {/* Meeting list */}
      <section className="space-y-5">
        <div data-intro className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/65">
              Your workspace
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Recent meetings
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Drag any meeting into the trash zone to delete it.
            </p>
          </div>

          {!loading && (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/50">
              {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'}
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.04] p-4 text-sm text-rose-200">
            <p>{error}</p>
            <button
              onClick={load}
              className="mt-2 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              />
            ))}
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
            <CalendarDays className="h-7 w-7 text-white/25" />
            <p className="mt-4 text-sm font-medium text-white/70">
              Your story starts here
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-white/40">
              No meetings yet. Create your first draft above to get started.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById('meeting-title')
                  ?.focus({ preventScroll: false })
              }
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100"
            >
              <Plus className="h-4 w-4" />
              Start a meeting
            </button>
          </div>
        )}

        {!loading && meetings.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {meetings.map((meeting) => (
              <div
                key={meeting._id}
                data-meeting-card
                className="group min-w-0"
              >
                <DraggableCard
                  id={meeting._id}
                  type="meeting"
                  data={{
                    id: meeting._id,
                    title: meeting.title,
                  }}
                  className="h-full p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/[0.035] sm:p-5"
                >
                  <div className="flex h-full min-h-36 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-cyan-200/80 transition group-hover:border-cyan-300/20 group-hover:bg-cyan-300/[0.08]">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <ArrowDown className="h-4 w-4 text-white/20 transition group-hover:translate-y-1 group-hover:text-cyan-200/70" />
                    </div>

                    <h3 className="mt-5 break-words text-sm font-semibold leading-6 text-white">
                      {meeting.title}
                    </h3>

                    {meeting.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                        {meeting.description}
                      </p>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-5 text-[11px] text-white/35">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(
                        meeting.date || meeting.createdAt
                      ).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </DraggableCard>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trash zone */}
      <section data-intro className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300/65">
            Cleanup
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Remove a meeting
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Drop a meeting card here to delete it.
          </p>
        </div>

        <ActionZone
          id="m-trash"
          label="🗑 Drop meeting here to delete"
          variant="delete"
          acceptTypes={['meeting']}
          onDrop={onTrash}
          className="min-h-[120px]"
        />
      </section>

      <footer className="flex items-center gap-2 border-t border-white/[0.07] pt-5 text-xs text-white/35">
        <Trash2 className="h-3.5 w-3.5" />
        Drag carefully — deleting a meeting may remove its associated data,
        depending on your backend implementation.
      </footer>
    </main>
  );
}
