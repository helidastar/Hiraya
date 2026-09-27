import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaShare, FaComment, FaEllipsisH, FaTrash, FaRegEdit, FaUndo, FaRedo, FaPen } from "react-icons/fa";
import Modal from '../components/Modal';
import MoodPicker from '../components/MoodPicker';
import PageShell, { Loader } from '../components/PageShell';
import Starfield from '../components/Starfield';
import { MoodIcon, moodLabel, moodTone } from '../components/moods';
import { rise, stagger, ease } from '../lib/motion';

interface FeedEntry {
  id: string;
  content: string;
  created_at: string;
  mood: string;
  public: boolean;
  user_id: string;
  likes_count?: number;
  is_liked?: boolean;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  title?: string;
}

interface Comment {
  id: string;
  entry_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: { full_name?: string };
}

export default function Feed() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'comment'; id: string; entryId: string } | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [openOptions, setOpenOptions] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<FeedEntry | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  const [editUndoStack, setEditUndoStack] = useState<string[]>([]);
  const [editRedoStack, setEditRedoStack] = useState<string[]>([]);
  const editContentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    async function fetchFeed() {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
        .from("journal")
          .select(`
            id, 
            content, 
            created_at, 
            mood, 
            public, 
            user_id,
            profiles:profiles!user_id(id, full_name, avatar_url),
            likes(user_id),
            title
          `)
          .eq("public", true);

        // Apply filters
        switch (filter) {
          case 'recent':
            query = query.order("created_at", { ascending: false });
            break;
          case 'popular':
            // sorted by likes below, newest first as a tiebreaker
            query = query.order("created_at", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const entriesWithLikes = (data || []).map(({ likes, ...entry }) => ({
          ...entry,
          likes_count: likes?.length ?? 0,
          is_liked: !!user && (likes || []).some((l: { user_id: string }) => l.user_id === user.id),
          profiles: Array.isArray(entry.profiles) ? entry.profiles[0] || { id: '', full_name: '', avatar_url: '' } : entry.profiles || { id: '', full_name: '', avatar_url: '' }
        }));

        if (filter === 'popular') entriesWithLikes.sort((a, b) => b.likes_count - a.likes_count);
        setEntries(entriesWithLikes as unknown as FeedEntry[]);
      } catch (err) {
        // Likes also link journal to profiles, so the author join above has to
        // name its column (profiles!user_id) or Supabase rejects it as ambiguous
        console.error('Failed to load feed:', err);
        setError('Failed to load feed');
      } finally {
      setLoading(false);
      }
    }
    fetchFeed();
  }, [filter]);

  // Fetch comments for all entries
  useEffect(() => {
    async function fetchAllComments(entryIds: string[]) {
      if (!entryIds.length) return;
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:profiles(full_name)')
        .in('entry_id', entryIds)
        .order('created_at', { ascending: true });
      if (!error && data) {
        // Group comments by entry_id
        const grouped: Record<string, Comment[]> = {};
        data.forEach((c: Comment) => {
          if (!grouped[c.entry_id]) grouped[c.entry_id] = [];
          grouped[c.entry_id].push(c);
        });
        setComments(grouped);
      }
    }
    if (entries.length > 0) {
      fetchAllComments(entries.map(e => e.id));
    }
  }, [entries]);

  const handleLike = async (entryId: string) => {
    if (!currentUser) return;
    const target = entries.find(e => e.id === entryId);
    if (!target) return;
    const wasLiked = !!target.is_liked;

    const toggle = (list: FeedEntry[]) => list.map(entry =>
      entry.id === entryId 
        ? { 
            ...entry, 
            is_liked: !entry.is_liked,
            likes_count: entry.is_liked ? (entry.likes_count || 1) - 1 : (entry.likes_count || 0) + 1
          }
        : entry
    );

    // Update the UI right away, then undo it if the database call fails
    setEntries(toggle);
    const { error } = wasLiked
      ? await supabase.from('likes').delete().eq('entry_id', entryId).eq('user_id', currentUser.id)
      : await supabase.from('likes').insert([{ entry_id: entryId, user_id: currentUser.id }]);
    if (error) setEntries(toggle);
  };

  const handleShare = async (entry: FeedEntry) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reflection by ${entry.profiles?.full_name || 'Anonymous'}`,
          text: entry.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy the entry text
      await navigator.clipboard.writeText(entry.content);
      toast.success('Entry copied to clipboard');
    }
  };

  async function handleAddComment(entryId: string) {
    const content = commentInputs[entryId]?.trim();
    if (!content) return;
    setCommentLoading((prev) => ({ ...prev, [entryId]: true }));
    setCommentErrors((prev) => ({ ...prev, [entryId]: "" }));
    if (!currentUser) {
      setCommentErrors((prev) => ({ ...prev, [entryId]: "You must be logged in to comment." }));
      setCommentLoading((prev) => ({ ...prev, [entryId]: false }));
      return;
    }
    const { data, error } = await supabase
      .from('comments')
      .insert([{ entry_id: entryId, user_id: currentUser.id, content }])
      .select('*, user:profiles(full_name)');
    if (error) {
      setCommentErrors((prev) => ({ ...prev, [entryId]: error.message || 'Failed to post comment.' }));
    }
    if (!error && data && data[0]) {
      setComments((prev) => ({
        ...prev,
        [entryId]: [...(prev[entryId] || []), data[0]],
      }));
      setCommentInputs((prev) => ({ ...prev, [entryId]: "" }));
    }
    setCommentLoading((prev) => ({ ...prev, [entryId]: false }));
  }

  function handleDeleteComment(commentId: string, entryId: string) {
    setDeleteConfirm({ type: 'comment', id: commentId, entryId });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'comment' && deleteConfirm.entryId) {
      await supabase.from('comments').delete().eq('id', deleteConfirm.id);
      setComments(prev => ({
        ...prev,
        [deleteConfirm.entryId!]: (prev[deleteConfirm.entryId!] || []).filter(c => c.id !== deleteConfirm.id),
      }));
    }
    setDeleteConfirm(null);
  }

  // Edit handler
  function handleEditEntry(entry: FeedEntry) {
    setEditEntry(entry);
    setEditTitle(entry.title || '');
    setEditContent(entry.content);
    setEditMood(entry.mood || null);
    setOpenOptions(null);
  }

  function handleEditContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditUndoStack(prev => [...prev, editContent]);
    setEditRedoStack([]);
    setEditContent(e.target.value);
  }
  function handleEditUndo() {
    if (editUndoStack.length === 0) return;
    const prev = editUndoStack[editUndoStack.length - 1];
    setEditUndoStack(editUndoStack.slice(0, -1));
    setEditRedoStack(r => [...r, editContent]);
    setEditContent(prev);
  }
  function handleEditRedo() {
    if (editRedoStack.length === 0) return;
    const next = editRedoStack[editRedoStack.length - 1];
    setEditRedoStack(editRedoStack.slice(0, -1));
    setEditUndoStack(u => [...u, editContent]);
    setEditContent(next);
  }

  // Save edit
  async function handleSaveEdit() {
    if (!editEntry) return;
    setEditLoading(true);
    const { data, error } = await supabase
      .from('journal')
      .update({ title: editTitle, content: editContent, mood: editMood || '' })
      .eq('id', editEntry.id)
      .select();
    setEditLoading(false);
    if (!error && data && data[0]) {
      setEntries(prev => prev.map(e => e.id === editEntry.id ? { ...e, title: editTitle, content: editContent, mood: editMood || '' } : e));
      setEditEntry(null);
    } else {
      toast.error('The entry didn\'t save. Try again.');
    }
  }

  // Delete handler
  async function handleDeleteEntry() {
    if (!deleteEntryId) return;
    await supabase.from('journal').delete().eq('id', deleteEntryId);
    setEntries(prev => prev.filter(e => e.id !== deleteEntryId));
    setDeleteEntryId(null);
  }

  const iconBtn = "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-iris-soft hover:text-iris";

  return (
    <PageShell
      title="Community"
      eyebrow="Entries people chose to share"
      width="max-w-3xl"
      actions={
        <div className="glass flex rounded-full p-1 shadow-soft" role="tablist" aria-label="Sort entries">
          {([['recent', 'Newest'], ['popular', 'Most liked']] as const).map(([key, label]) => {
            const active = key === 'popular' ? filter === 'popular' : filter !== 'popular';
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? 'text-on-iris' : 'text-muted hover:text-ink'}`}
              >
                {active && <motion.span layoutId="feed-tab" className="absolute inset-0 rounded-full bg-iris" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
      }
    >
      {error && (
        <motion.p variants={rise} role="alert" className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          The feed didn&apos;t load. Check your connection and refresh the page.
        </motion.p>
      )}

      {loading ? (
        <Loader />
      ) : entries.length === 0 ? (
        <motion.div variants={rise} className="night dark px-6 pb-28 pt-16 text-center">
          <Starfield className="absolute" count={30} seed={19} shooting={false} />
          <div className="planet top-[calc(100%-5rem)]" />
          <div className="relative">
          <FaRegEdit className="mx-auto mb-4 text-4xl text-iris drop-shadow-[0_0_14px_rgb(var(--iris)/0.7)]" aria-hidden />
          <p className="font-display text-3xl">Nothing shared yet</p>
          <p className="mx-auto mt-2 max-w-sm text-muted">Turn on Public when you write a journal entry and it will appear here.</p>
          <Link href="/dashboard/journal?new=1" className="btn-primary mt-6">Write an entry</Link>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="flex flex-col gap-5">
          <AnimatePresence initial={false}>
          {entries.map(entry => {
            const entryComments = comments[entry.id] || [];
            const isOwner = !!currentUser && currentUser.id === entry.user_id;
            return (
              <motion.article
                key={entry.id}
                variants={rise}
                layout
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                className="card card-lift relative overflow-hidden p-5 sm:p-6"
              >
                <span className={`absolute inset-y-0 left-0 w-1.5 ${entry.mood ? moodTone(entry.mood).split(' ')[0] : 'bg-line'}`} aria-hidden />
                <header className="flex items-center gap-3">
                  <Image
                    src={entry.profiles?.avatar_url || "/default-avatar.png"}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full border border-line bg-paper object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{entry.profiles?.full_name || "Anonymous"}</p>
                    <p className="text-sm text-muted">{new Date(entry.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  {entry.mood && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${moodTone(entry.mood)}`}>
                      <MoodIcon value={entry.mood} /> {moodLabel(entry.mood)}
                    </span>
                  )}
                  {isOwner && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenOptions(openOptions === entry.id ? null : entry.id)}
                        aria-label="Entry options"
                        aria-expanded={openOptions === entry.id}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-iris-soft hover:text-ink"
                      >
                        <FaEllipsisH />
                      </button>
                      <AnimatePresence>
                        {openOptions === entry.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="card absolute right-0 z-40 mt-2 w-36 origin-top-right overflow-hidden rounded-2xl p-1"
                          >
                            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-paper" onClick={() => handleEditEntry(entry)}><FaPen className="text-xs text-muted" aria-hidden /> Edit</button>
                            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => { setDeleteEntryId(entry.id); setOpenOptions(null); }}><FaTrash className="text-xs" aria-hidden /> Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </header>

                {entry.title && <h2 className="mt-4 font-display text-2xl">{entry.title}</h2>}
                <p className={`${entry.title ? 'mt-2' : 'mt-4'} whitespace-pre-wrap break-words text-[17px] leading-relaxed`}>{entry.content}</p>

                <footer className="mt-5 flex items-center gap-1 border-t border-line pt-3">
                  <button
                    onClick={() => handleLike(entry.id)}
                    aria-pressed={!!entry.is_liked}
                    aria-label={entry.is_liked ? 'Unlike' : 'Like'}
                    className={`${iconBtn} ${entry.is_liked ? '!text-rose-500 hover:!bg-rose-50 dark:hover:!bg-rose-950/40' : ''}`}
                  >
                    <motion.span key={String(entry.is_liked)} initial={{ scale: entry.is_liked ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="flex">
                      {entry.is_liked ? <FaHeart /> : <FaRegHeart />}
                    </motion.span>
                    <span className="tabular-nums">{entry.likes_count || 0}</span>
                  </button>
                  <button
                    onClick={() => setOpenComments(openComments === entry.id ? null : entry.id)}
                    aria-expanded={openComments === entry.id}
                    className={`${iconBtn} ${openComments === entry.id ? 'bg-iris-soft !text-iris' : ''}`}
                  >
                    <FaComment /> <span className="tabular-nums">{entryComments.length}</span>
                    <span className="sr-only">comments</span>
                  </button>
                  <button onClick={() => handleShare(entry)} className={`${iconBtn} ml-auto`}>
                    <FaShare /> Share
                  </button>
                </footer>

                <AnimatePresence initial={false}>
                  {openComments === entry.id && (
                    <motion.section
                      key="comments"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden"
                      aria-label="Comments"
                    >
                      <div className="mt-3 rounded-2xl bg-paper p-4">
                        {commentErrors[entry.id] && (
                          <p role="alert" className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{commentErrors[entry.id]}</p>
                        )}
                        {entryComments.length === 0 ? (
                          <p className="mb-3 text-sm text-muted">No comments yet. Start the conversation.</p>
                        ) : (
                          <ul className="mb-4 space-y-3">
                            {entryComments.map((comment) => (
                              <li key={comment.id} className="group flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-iris-soft text-sm font-semibold text-iris">
                                  {comment.user?.full_name?.[0]?.toUpperCase() || "U"}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm">
                                    <span className="font-semibold">{comment.user?.full_name || "User"}</span>
                                    <span className="ml-2 text-xs text-muted">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </p>
                                  <p className="break-words">{comment.content}</p>
                                </div>
                                {(currentUser && (currentUser.id === comment.user_id || currentUser.id === entry.user_id)) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id, entry.id)}
                                    aria-label="Delete comment"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100 dark:hover:bg-red-950/40"
                                  >
                                    <FaTrash className="text-xs" aria-hidden />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleAddComment(entry.id); }}>
                          <label htmlFor={`comment-${entry.id}`} className="sr-only">Write a comment</label>
                          <input
                            id={`comment-${entry.id}`}
                            type="text"
                            className="field rounded-full py-2.5"
                            placeholder="Write a comment"
                            value={commentInputs[entry.id] || ""}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            disabled={commentLoading[entry.id]}
                          />
                          <button type="submit" className="btn-primary shrink-0" disabled={commentLoading[entry.id] || !(commentInputs[entry.id] && commentInputs[entry.id].trim())}>
                            Post
                          </button>
                        </form>
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete this comment?" style={{ maxWidth: 420 }}>
        <p className="text-muted">The comment is removed for everyone. This can&apos;t be undone.</p>
        <div className="mt-7 flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="btn-ghost">Cancel</button>
          <button onClick={confirmDelete} className="btn-primary !bg-red-600 !text-white">Delete comment</button>
        </div>
      </Modal>

      <Modal isOpen={!!editEntry} onClose={() => setEditEntry(null)} title="Edit entry">
        <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
          <label htmlFor="edit-title" className="label">Title <span className="font-normal text-muted">(optional)</span></label>
          <input id="edit-title" type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="field mb-4" />
          <MoodPicker value={editMood} onChange={setEditMood} />
          <div className="mb-1.5 flex items-end justify-between">
            <label htmlFor="edit-body" className="label mb-0">Entry</label>
            <div className="flex gap-1">
              <button type="button" onClick={handleEditUndo} disabled={editUndoStack.length === 0} aria-label="Undo" className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted transition hover:bg-iris-soft hover:text-iris disabled:opacity-40 disabled:hover:bg-transparent"><FaUndo /></button>
              <button type="button" onClick={handleEditRedo} disabled={editRedoStack.length === 0} aria-label="Redo" className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-muted transition hover:bg-iris-soft hover:text-iris disabled:opacity-40 disabled:hover:bg-transparent"><FaRedo /></button>
            </div>
          </div>
          <textarea id="edit-body" ref={editContentRef} value={editContent} onChange={handleEditContentChange} rows={7} className="field resize-y leading-relaxed" />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setEditEntry(null)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={editLoading || !editContent.trim()} className="btn-primary">{editLoading ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteEntryId} onClose={() => setDeleteEntryId(null)} title="Delete this entry?" style={{ maxWidth: 420 }}>
        <p className="text-muted">It&apos;s removed from your journal and the feed, along with its likes and comments. This can&apos;t be undone.</p>
        <div className="mt-7 flex justify-end gap-2">
          <button onClick={() => setDeleteEntryId(null)} className="btn-ghost">Cancel</button>
          <button onClick={handleDeleteEntry} className="btn-primary !bg-red-600 !text-white">Delete entry</button>
        </div>
      </Modal>
    </PageShell>
  );
}
