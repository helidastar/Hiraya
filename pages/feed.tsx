import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import Head from "next/head";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaShare, FaComment, FaEllipsisH } from "react-icons/fa";
import { useDarkMode } from "../components/DarkModeContext";
import Modal from '../components/Modal';

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

const emojiCategories = [
  { name: 'Smileys', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','😷','🤒','🤕','🤢','🤮','🥴','😇','🥳'] },
  { name: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'] },
  { name: 'Food', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','��','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','🍼','🥛','☕','🫖','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🫗','🥤','🧋','🧃','🧉','🧊','🥢','🍽️','🍴','🥄'] },
  { name: 'Activities', emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🥅','🏒','🏑','🏏','🥍','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛷','⛸️','🥌','🛼','🛶','⛵','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🛎️','🧳','⌛','⏳','⌚','⏰','⏱️','⏲️','🕰️','🌡️','🗺️','🧭','🎃','🎄','🎆','🎇','🧨','✨','🎈','🎉','🎊','🎋','🎍','🎎','🎏','🎐','🎑','🧧','🎀','🎁','🎗️','🎟️','🎫','🎖️','🏆','🏅','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🥅','🏒','🏑','🏏','🥍','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛷','⛸️','🥌','🛼'] },
  { name: 'Objects', emojis: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','🧾','💎','⚖️','🔧','🔨','⚒️','🛠️','⛏️','🔩','⚙️','🗜️','⚗️','🧪','🧫','🧬','🔬','🔭','📡','💉','🩸','💊','🩹','🩺','🚪','🛏️','🛋️','🪑','🚽','🚿','🛁','🪒','🧴','🧷','🧹','🧺','🧻','🧼','🪣','🧽','🧯','🛒','🚬','⚰️','🪦','⚱️','🏺','🕳️','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️','🎠','🎡','🎢','💈','🎪','🛤️','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🚚','🚛','🚜','🏎️','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','🛢️','⛽','🚨','🚥','🚦','🛑','🚧','⚓','⛵','🛶','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸'] },
  { name: 'Symbols', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅺','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚳','🔞','📵','🚭','❗','❓','❕','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆓','🆕','🆚','🈁','🈂️'] }
];

// Add a mapping from emoji to mood name
const moodNameMap: Record<string, string> = {
  '😐': 'Natural',
  '😊': 'Happy',
  '😌': 'Calm',
  '😥': 'Sad',
  '🥰': 'Loved',
  '😪': 'Tired',
};

export default function Feed() {
  const [collapsed, setCollapsed] = useState(true);
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const { darkMode } = useDarkMode();
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
  const [editDate, setEditDate] = useState('');
  const [editUndoStack, setEditUndoStack] = useState<string[]>([]);
  const [editRedoStack, setEditRedoStack] = useState<string[]>([]);
  const editContentRef = useRef<HTMLTextAreaElement>(null);
  const [editEmojiModalOpen, setEditEmojiModalOpen] = useState(false);
  const [editActiveEmojiCategory, setEditActiveEmojiCategory] = useState(emojiCategories[0].name);

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
            profiles:profiles(id, full_name, avatar_url),
            title
          `)
          .eq("public", true);

        // Apply filters
        switch (filter) {
          case 'recent':
            query = query.order("created_at", { ascending: false });
            break;
          case 'popular':
            // For now, we'll order by creation date, but you could add a likes_count field
            query = query.order("created_at", { ascending: false });
            break;
          default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Add mock likes data for demonstration
        const entriesWithLikes = (data || []).map(entry => ({
          ...entry,
          likes_count: 0,
          is_liked: false,
          profiles: Array.isArray(entry.profiles) ? entry.profiles[0] || { id: '', full_name: '', avatar_url: '' } : entry.profiles || { id: '', full_name: '', avatar_url: '' }
        }));

        setEntries(entriesWithLikes as unknown as FeedEntry[]);
      } catch {
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
    if (!currentUser) {
      // You could show a login prompt here
      return;
    }

    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { 
            ...entry, 
            is_liked: !entry.is_liked,
            likes_count: entry.is_liked ? (entry.likes_count || 1) - 1 : (entry.likes_count || 0) + 1
          }
        : entry
    ));

    // Here you would typically update the database
    // await supabase.from('likes').upsert({...})
  };

  const handleShare = async (entry: FeedEntry) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reflection by ${entry.profiles?.full_name || 'Anonymous'}`,
          text: entry.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(entry.content);
      // You could show a toast notification here
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
  function insertEditEmoji(emoji: string) {
    if (!editContentRef.current) return;
    const textarea = editContentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = editContent.slice(0, start);
    const after = editContent.slice(end);
    setEditContent(before + emoji + after);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
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
      alert('Failed to update entry.');
    }
  }

  // Delete handler
  async function handleDeleteEntry() {
    if (!deleteEntryId) return;
    await supabase.from('journal').delete().eq('id', deleteEntryId);
    setEntries(prev => prev.filter(e => e.id !== deleteEntryId));
    setDeleteEntryId(null);
  }

  return (
    <>
      <Head>
        <title>Community Feed | Muni</title>
        <meta name="description" content="See public reflections from the community" />
      </Head>
      <div className={`flex min-h-screen ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#B6A6CA] to-[#D4BEBE]'}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`flex-1 p-10 bg-transparent min-h-screen transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className={`text-4xl font-bold mb-4 font-serif ${darkMode ? 'text-[#A09ABC]' : 'text-[#A09ABC]'}`}>
                🌍 Community Feed
              </h2>
              <p className={`text-lg ${darkMode ? 'text-[#B6A6CA]' : 'text-[#6C63A6]'}`}>
                Discover inspiring reflections from our community
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              {['all', 'recent', 'popular'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === filterType
                      ? 'bg-[#A09ABC] text-white'
                      : darkMode 
                        ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80'
                        : 'bg-white/30 text-[#6C63A6] hover:bg-white/40'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A09ABC]"></div>
              </div>
            ) : entries.length === 0 ? (
              <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-[#23234a] text-[#B6A6CA]' : 'bg-white/40 text-[#B6A6CA]'} shadow backdrop-blur-md border border-white/30`}>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No public entries yet</h3>
                <p>Be the first to share your reflection with the community!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {entries.map(entry => (
                  <div key={entry.id} className={`rounded-2xl shadow-xl backdrop-blur-md p-6 border ${darkMode ? 'bg-[#23234a]/80 border-[#A09ABC]/20' : 'bg-white/30 border-white/40'}`}>
                    {/* User Info and ... button */}
                    <div className="flex items-center gap-3 mb-2 relative">
                      <Image 
                        src={entry.profiles?.avatar_url || "/default-avatar.png"} 
                        alt="Avatar" 
                        width={48} 
                        height={48} 
                        className="rounded-full border-2 border-[#E1D8E9] bg-white" 
                      />
                      <div className="flex-1">
                        <div className={`font-semibold ${darkMode ? 'text-[#A09ABC]' : 'text-[#A09ABC]'}`}>{entry.profiles?.full_name || "Anonymous"}</div>
                        {/* Journal Title and Mood on the same line */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-2xl font-bold font-serif text-[#6C63A6]">{entry.title}</div>
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-[#B6A6CA]' : 'text-[#B6A6CA]'}`}>{new Date(entry.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                      {/* ... button for entry owner */}
                      {currentUser && currentUser.id === entry.user_id && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenOptions(openOptions === entry.id ? null : entry.id)}
                            className="p-2 rounded-full hover:bg-[#A09ABC]/10 focus:outline-none"
                            title="More options"
                          >
                            <FaEllipsisH />
                          </button>
                          {openOptions === entry.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-[#A09ABC]/20 z-50">
                              <button className="block w-full text-left px-4 py-2 text-[#6C63A6] hover:bg-[#A09ABC]/10" onClick={() => handleEditEntry(entry)}>Edit</button>
                              <button className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-100" onClick={() => setDeleteEntryId(entry.id)}>Delete</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mood emoji and name on the left, replacing the 📝 icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{entry.mood ? entry.mood : '😐'}</span>
                      <span className="text-base font-medium text-[#B6A6CA]">{moodNameMap[entry.mood ? entry.mood : '😐']}</span>
                    </div>

                    {/* Content */}
                    <div className={`whitespace-pre-wrap text-lg leading-relaxed mb-4 ${darkMode ? 'text-[#E1D8E9]' : 'text-[#6C63A6]'}`}>{entry.content}</div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                      <button
                        onClick={() => handleLike(entry.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${entry.is_liked ? 'text-red-500 bg-red-50' : darkMode ? 'text-[#A09ABC] hover:bg-[#23234a]/50' : 'text-[#6C63A6] hover:bg-white/20'}`}
                      >
                        {entry.is_liked ? <FaHeart /> : <FaRegHeart />}
                        <span>{entry.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => handleShare(entry)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${darkMode ? 'text-[#A09ABC] hover:bg-[#23234a]/50' : 'text-[#6C63A6] hover:bg-white/20'}`}
                      >
                        <FaShare />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={() => setOpenComments(openComments === entry.id ? null : entry.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${darkMode ? 'text-[#A09ABC] hover:bg-[#23234a]/50' : 'text-[#6C63A6] hover:bg-white/20'}`}
                      >
                        <FaComment />
                        <span>Comment</span>
                        <span className="ml-1 text-xs font-semibold">{(comments[entry.id] || []).length}</span>
                      </button>
                    </div>

                    {/* Comments Section - only show if openComments === entry.id */}
                    {openComments === entry.id && (
                      <div className="mt-4 bg-white/80 rounded-lg p-4 border border-[#E1D8E9]">
                        <div className="font-semibold text-[#A09ABC] mb-2">Comments</div>
                        {commentErrors[entry.id] && (
                          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm">{commentErrors[entry.id]}</div>
                        )}
                        <div className="space-y-2 mb-2">
                          {(comments[entry.id] || []).length === 0 && (
                            <div className="text-[#B6A6CA] text-sm">No comments yet. Be the first to comment!</div>
                          )}
                          {(comments[entry.id] || []).map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#A09ABC]/20 flex items-center justify-center text-[#A09ABC] font-bold">
                                {comment.user?.full_name?.[0] || "U"}
                              </div>
                              <div className="flex-1">
                                <div className="text-[#6C63A6] text-sm font-semibold">
                                  {comment.user?.full_name || "User"}
                                  <span className="ml-2 text-xs text-[#B6A6CA]">{new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-[#6C63A6] text-base">{comment.content}</div>
                              </div>
                              {(currentUser && (currentUser.id === comment.user_id || currentUser.id === entry.user_id)) && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id, entry.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors ml-2"
                                  title="Delete comment"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            className="flex-1 rounded-full border border-[#A09ABC] px-4 py-2 text-[#6C63A6] bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#A09ABC]/30"
                            placeholder="Add a comment..."
                            value={commentInputs[entry.id] || ""}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddComment(entry.id);
                            }}
                            disabled={commentLoading[entry.id]}
                          />
                          <button
                            onClick={() => handleAddComment(entry.id)}
                            className="bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white px-4 py-2 rounded-full font-semibold shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition disabled:opacity-50"
                            disabled={commentLoading[entry.id] || !(commentInputs[entry.id] && commentInputs[entry.id].trim())}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs text-center border border-[#A09ABC]">
            <div className="text-[#A09ABC] font-semibold mb-4">
              Delete this comment?
            </div>
            <div className="mb-6 text-[#6C63A6] text-sm">
              Are you sure you want to delete this comment? This action cannot be undone.
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-[#6C63A6] font-semibold shadow hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editEntry && (
        <Modal isOpen={!!editEntry} onClose={() => setEditEntry(null)} title="Edit Journal Entry">
          <input
            type="text"
            placeholder="Entry Title"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            style={{ width: '100%', borderRadius: 8, padding: 12, border: '1px solid #D5CFE1', color: darkMode ? '#A09ABC' : '#6C63A6', marginBottom: 12, fontSize: 16, background: darkMode ? '#23234a' : '#f8f6fa' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              style={{ borderRadius: 6, border: '1px solid #D5CFE1', padding: '8px 12px', color: darkMode ? '#A09ABC' : '#6C63A6', background: darkMode ? '#23234a' : '#f8f6fa', fontSize: 15 }}
            />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
              {['😐', '😊', '😌', '😥', '🥰', '😪'].map(mood => (
                <span
                  key={mood}
                  style={{ fontSize: 28, cursor: 'pointer', filter: editMood === mood ? 'drop-shadow(0 0 4px #7c3aed)' : 'none', opacity: editMood === mood ? 1 : 0.6 }}
                  onClick={() => setEditMood(mood)}
                  title={moodNameMap[mood]}
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <button style={{ background: '#A09ABC', color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontWeight: 600, fontSize: 18, cursor: 'pointer' }}>A</button>
            <button
              style={{ background: darkMode ? '#23234a' : '#f8f6fa', color: '#A09ABC', border: 'none', borderRadius: 6, padding: 8, fontSize: 18, cursor: 'pointer' }}
              onClick={() => setEditEmojiModalOpen(true)}
              type="button"
            >😊</button>
            <button style={{ background: darkMode ? '#23234a' : '#f8f6fa', color: '#A09ABC', border: 'none', borderRadius: 6, padding: 8, fontSize: 18, cursor: 'pointer' }}>📝</button>
            <button
              style={{ background: darkMode ? '#23234a' : '#f8f6fa', color: '#A09ABC', border: 'none', borderRadius: 6, padding: 8, fontSize: 18, cursor: editUndoStack.length === 0 ? 'not-allowed' : 'pointer', opacity: editUndoStack.length === 0 ? 0.5 : 1 }}
              onClick={handleEditUndo}
              type="button"
              disabled={editUndoStack.length === 0}
            >↺</button>
            <button
              style={{ background: darkMode ? '#23234a' : '#f8f6fa', color: '#A09ABC', border: 'none', borderRadius: 6, padding: 8, fontSize: 18, cursor: editRedoStack.length === 0 ? 'not-allowed' : 'pointer', opacity: editRedoStack.length === 0 ? 0.5 : 1 }}
              onClick={handleEditRedo}
              type="button"
              disabled={editRedoStack.length === 0}
            >↻</button>
          </div>
          <textarea
            ref={editContentRef}
            value={editContent}
            onChange={handleEditContentChange}
            placeholder="Write your thoughts here..."
            rows={5}
            style={{ width: '100%', borderRadius: 8, padding: 12, border: '1px solid #D5CFE1', color: darkMode ? '#A09ABC' : '#6C63A6', marginBottom: 16, resize: 'none', fontSize: 16, background: darkMode ? '#23234a' : '#f8f6fa' }}
          />
          <button
            onClick={handleSaveEdit}
            style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'linear-gradient(90deg, #A09ABC 0%, #B6A6CA 100%)', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', boxShadow: '0 2px 8px #D5CFE1', cursor: 'pointer', opacity: editLoading ? 0.7 : 1 }}
            disabled={editLoading}
          >
            Save Changes
          </button>
        </Modal>
      )}

      {deleteEntryId && (
        <Modal isOpen={!!deleteEntryId} onClose={() => setDeleteEntryId(null)} title="Delete Entry?">
          <div className="mb-6 text-[#6C63A6] text-sm">
            Are you sure you want to delete this entry? This action cannot be undone.
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDeleteEntry}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteEntryId(null)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-[#6C63A6] font-semibold shadow hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {editEmojiModalOpen && (
        <Modal isOpen={editEmojiModalOpen} onClose={() => setEditEmojiModalOpen(false)} title="Pick an Emoji" style={{ minWidth: 400, maxWidth: 500, background: darkMode ? '#23234a' : undefined }} noBlur={true}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {emojiCategories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setEditActiveEmojiCategory(cat.name)}
                style={{
                  background: editActiveEmojiCategory === cat.name ? '#A09ABC' : (darkMode ? '#23234a' : '#f8f6fa'),
                  color: editActiveEmojiCategory === cat.name ? '#fff' : '#A09ABC',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: editActiveEmojiCategory === cat.name ? '0 2px 8px #D5CFE1' : 'none',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {emojiCategories.find(cat => cat.name === editActiveEmojiCategory)?.emojis.map(emoji => (
              <span
                key={emoji}
                style={{ fontSize: 28, cursor: 'pointer' }}
                onClick={() => { insertEditEmoji(emoji); setEditEmojiModalOpen(false); }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
} 