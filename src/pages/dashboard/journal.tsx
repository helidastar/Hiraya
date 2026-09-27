import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { ensureProfile } from "../../lib/profile";
import { supabase } from "../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import Modal from '../../components/Modal';
import PageShell from "../../components/PageShell";
import Starfield from "../../components/Starfield";
import { FaPlus, FaPen, FaTrash, FaGlobeAsia, FaLock, FaUndo, FaRedo } from "react-icons/fa";
import MoodPicker from "../../components/MoodPicker";
import { MoodIcon, moodLabel, moodTone } from "../../components/moods";
import { localDateKey, timestampForDay } from "../../lib/dates";
import { rise, stagger } from "../../lib/motion";

type JournalEntry = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  public?: boolean;
  title?: string;
  mood?: string;
};


export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDate, setEntryDate] = useState(() => localDateKey());
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  
  useEffect(() => {
    async function fetchEntries() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase
        .from("journal")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setEntries(data || []);
      setLoading(false);
    }
    fetchEntries();
  }, [router]);

  // The dashboard "New Entry" button links here with ?new=1
  useEffect(() => {
    if (router.isReady && router.query.new) {
      setModalOpen(true);
      router.replace("/dashboard/journal", undefined, { shallow: true });
    }
  }, [router.isReady, router.query.new]);

  const resetForm = () => {
    setEditingEntry(null);
    setNewEntry("");
    setEntryTitle("");
    setSelectedMood(null);
    setEntryDate(localDateKey());
    setIsPublic(false);
    setModalOpen(false);
  };

  const openEditEntryModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNewEntry(entry.content);
    setEntryTitle(entry.title || "");
    setSelectedMood(entry.mood || null);
    setEntryDate(localDateKey(entry.created_at));
    setIsPublic(!!entry.public);
    setModalOpen(true);
  };

  const saveEntry = async () => {
    if (newEntry.trim() === "" || saving) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setSaving(true);
    try {
      await persistEntry(session.user);
    } finally {
      setSaving(false);
    }
  };

  const persistEntry = async (user: User) => {
    if (editingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from("journal")
        .update({
          content: newEntry,
          public: isPublic,
          updated_at: new Date().toISOString(),
          title: entryTitle,
          mood: selectedMood,
          // only move the entry if the user picked a different day
          ...(entryDate !== localDateKey(editingEntry.created_at) ? { created_at: timestampForDay(entryDate) } : {}),
        })
        .eq("id", editingEntry.id)
        .select();
      if (error || !data?.[0]) {
        toast.error(`Couldn't save your changes: ${error?.message ?? "the entry wasn't found"}`);
        return;
      }
      setEntries(entries.map(e => e.id === editingEntry.id ? data[0] : e));
      resetForm();
      toast.success("Changes saved");
    } else {
      // Entries belong to a profile; create it first if this account has none
      const { error: profileError } = await ensureProfile(user);
      if (profileError) {
        toast.error(`Couldn't save your entry: ${profileError}`);
        return;
      }
      const { data, error } = await supabase
        .from("journal")
        .insert([{
          content: newEntry,
          user_id: user.id,
          public: isPublic,
          title: entryTitle,
          mood: selectedMood,
          created_at: timestampForDay(entryDate),
        }])
        .select();
      if (error || !data?.[0]) {
        toast.error(`Couldn't save your entry: ${error?.message ?? "no entry came back"}`);
        return;
      }
      setEntries([data[0], ...entries].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      resetForm();
      toast.success("Entry saved");
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("journal").delete().eq("id", id);
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // Handle textarea change with undo/redo stack
  const handleEntryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUndoStack(prev => [...prev, newEntry]);
    setRedoStack([]);
    setNewEntry(e.target.value);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack(r => [...r, newEntry]);
    setNewEntry(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack(u => [...u, newEntry]);
    setNewEntry(next);
  };

  return (
    <PageShell
      title="Journal"
      eyebrow={`${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
      loading={loading}
      width="max-w-3xl"
      actions={<button onClick={() => setModalOpen(true)} className="btn-primary"><FaPlus aria-hidden className="text-sm" /> New entry</button>}
    >
      <Modal isOpen={modalOpen} onClose={resetForm} title={editingEntry ? "Edit entry" : "New entry"}>
        <form onSubmit={(e) => { e.preventDefault(); saveEntry(); }}>
          <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="entry-title" className="label">Title <span className="font-normal text-muted">(optional)</span></label>
              <input id="entry-title" type="text" value={entryTitle} onChange={e => setEntryTitle(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="entry-date" className="label">Date</label>
              <input id="entry-date" type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} className="field" />
            </div>
          </div>
          <MoodPicker value={selectedMood} onChange={setSelectedMood} />
          <div className="mb-1.5 flex items-end justify-between">
            <label htmlFor="entry-body" className="label mb-0">Entry</label>
            <div className="flex gap-1">
              <button type="button" onClick={handleUndo} disabled={undoStack.length === 0} aria-label="Undo" className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted transition hover:bg-iris-soft hover:text-iris disabled:opacity-40 disabled:hover:bg-transparent"><FaUndo /></button>
              <button type="button" onClick={handleRedo} disabled={redoStack.length === 0} aria-label="Redo" className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted transition hover:bg-iris-soft hover:text-iris disabled:opacity-40 disabled:hover:bg-transparent"><FaRedo /></button>
            </div>
          </div>
          <textarea
            id="entry-body"
            ref={textareaRef}
            value={newEntry}
            onChange={handleEntryChange}
            placeholder="What's on your mind?"
            rows={7}
            className="field resize-y leading-relaxed"
          />
          <div className="mt-5 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(v => !v)}
              className="flex items-center gap-3 text-left"
            >
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isPublic ? 'bg-iris' : 'bg-line'}`}>
                <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${isPublic ? 'right-0.5' : 'left-0.5'}`} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{isPublic ? 'Public' : 'Private'}</span>
                <span className="block text-xs text-muted">{isPublic ? 'Shown on the community feed' : 'Only you can see this entry'}</span>
              </span>
            </button>
            <button type="submit" disabled={newEntry.trim() === "" || saving} className="btn-primary">
              {saving ? 'Saving...' : editingEntry ? 'Save changes' : 'Save entry'}
            </button>
          </div>
        </form>
      </Modal>

      {entries.length === 0 ? (
        <motion.div variants={rise} className="night dark px-6 pb-28 pt-16 text-center">
          <Starfield className="absolute" count={30} seed={17} shooting={false} />
          <div className="planet top-[calc(100%-5rem)]" />
          <div className="relative">
          <p className="font-display text-3xl">Your journal is empty</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">Write about your day, a thought you keep coming back to, or just how you feel right now.</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mt-6"><FaPlus aria-hidden className="text-sm" /> Write your first entry</button>
          </div>
        </motion.div>
      ) : (
        <motion.ol variants={stagger(0.05)} className="space-y-4">
          <AnimatePresence initial={false}>
            {entries.map((entry, idx) => {
              const date = new Date(entry.created_at);
              return (
                <motion.li
                  key={entry.id}
                  variants={rise}
                  layout
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                  className="card card-lift group relative flex gap-5 overflow-hidden p-5 sm:p-6"
                >
                  {/* Mood spine: the entry's mood color runs down its left edge */}
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${entry.mood ? moodTone(entry.mood).split(' ')[0] : 'bg-line'}`} aria-hidden />
                  <span className={`pointer-events-none absolute -left-16 top-1/2 h-40 w-32 -translate-y-1/2 rounded-full opacity-25 blur-2xl transition group-hover:opacity-50 ${entry.mood ? moodTone(entry.mood).split(' ')[0] : 'bg-line'}`} aria-hidden />
                  <div className="w-12 shrink-0 pl-1 text-center">
                    <p className="font-display text-3xl leading-none">{date.getDate()}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">{date.toLocaleDateString(undefined, { month: 'short' })}</p>
                  </div>
                  <article className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="font-display text-xl">{entry.title && entry.title.trim() !== '' ? entry.title : `Entry ${entries.length - idx}`}</h2>
                      {entry.mood && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${moodTone(entry.mood)}`}>
                          <MoodIcon value={entry.mood} /> {moodLabel(entry.mood)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      {entry.public ? <FaGlobeAsia aria-hidden /> : <FaLock aria-hidden />}
                      {entry.public ? 'Public' : 'Private'}
                      <span aria-hidden>·</span>
                      {entry.updated_at ? `Edited ${new Date(entry.updated_at).toLocaleDateString()}` : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap break-words leading-relaxed">{entry.content}</p>
                    <div className="mt-4 flex gap-1 sm:opacity-0 sm:transition sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button onClick={() => openEditEntryModal(entry)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-iris-soft hover:text-iris">
                        <FaPen aria-hidden className="text-xs" /> Edit
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                        <FaTrash aria-hidden className="text-xs" /> Delete
                      </button>
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ol>
      )}
    </PageShell>
  );
}
