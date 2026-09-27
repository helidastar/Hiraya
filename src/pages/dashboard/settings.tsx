// pages/settings/index.tsx
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FaMoon, FaLock,
  FaStar, FaShareAlt, FaFileAlt, FaFileContract, FaCookieBite, FaCommentDots, FaSignOutAlt
} from "react-icons/fa";
import { useDarkMode } from "../../components/DarkModeContext";
import LegalModal from "../../components/LegalModal";

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xs w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-[#A09ABC] text-xl font-bold">×</button>
        <h3 className="text-lg font-bold mb-2 text-[#6C63A6]">{title}</h3>
        <div className="text-[#6C63A6]">{children}</div>
      </div>
    </div>
  );
}

function FeedbackForm({ onSend }: { onSend: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async e => {
        e.preventDefault();
        setSending(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('feedback').insert([{
          user_id: user?.id,
          name: nameRef.current?.value,
          email: emailRef.current?.value,
          message: messageRef.current?.value,
        }]);
        setSending(false);
        if (error) setError('Could not send your feedback. Please try again.');
        else onSend();
      }}
    >
      <input ref={nameRef} type="text" placeholder="Name" className="p-2 rounded border border-[#A09ABC]/30" required />
      <input ref={emailRef} type="email" placeholder="Email" className="p-2 rounded border border-[#A09ABC]/30" required />
      <textarea ref={messageRef} placeholder="Message" className="p-2 rounded border border-[#A09ABC]/30" rows={3} required />
      <button type="submit" disabled={sending} className="mt-2 px-4 py-2 rounded bg-[#A09ABC] text-white font-semibold disabled:opacity-60">{sending ? 'Sending...' : 'Send'}</button>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}

function ChangePasswordForm({ onSuccess, onError }: { onSuccess: () => void, onError: (msg: string) => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async e => {
        e.preventDefault();
        if (newPass !== confirm) {
          onError('New passwords do not match.');
          return;
        }
        setLoading(true);
        // Supabase does not ask for the current password, so confirm it by signing in again
        const { data: { user } } = await supabase.auth.getUser();
        const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: current });
        if (verifyError) {
          setLoading(false);
          onError('Current password is incorrect.');
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPass });
        setLoading(false);
        if (error) onError(error.message);
        else onSuccess();
      }}
    >
      <input type="password" placeholder="Current Password" className="p-2 rounded border border-[#A09ABC]/30" value={current} onChange={e => setCurrent(e.target.value)} required />
      <input type="password" placeholder="New Password" className="p-2 rounded border border-[#A09ABC]/30" value={newPass} onChange={e => setNewPass(e.target.value)} required />
      <input type="password" placeholder="Confirm New Password" className="p-2 rounded border border-[#A09ABC]/30" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      <button type="submit" className="mt-2 px-4 py-2 rounded bg-[#A09ABC] text-white font-semibold" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
    </form>
  );
}

export default function Settings() {
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const { darkMode, setDarkMode } = useDarkMode();
  
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [changePw, setChangePw] = useState(false);
  const [changePwSuccess, setChangePwSuccess] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  async function submitRating() {
    setRatingSaving(true);
    setRatingError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('feedback').insert([{ user_id: user?.id, rating }]);
    setRatingSaving(false);
    if (error) setRatingError('Could not send your rating. Please try again.');
    else setRated(true);
  }

  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/auth/login");
        return;
      }
      setLoading(false);
    }
    fetchUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A09ABC]" />
      </div>
    );
  }



  return (
    <>
      <Head>
        <title>Settings - Muni</title>
      </Head>
      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setFeedbackSent(false); }}
        title={modal?.title || ''}
      >
        {modal?.title === 'Share App' ? (
          <div className="flex flex-col gap-2 items-center">
            <input
              type="text"
              value={typeof window !== 'undefined' ? window.location.origin : ''}
              readOnly
              className="p-2 rounded border border-[#A09ABC]/30 w-full text-center"
              onFocus={e => e.target.select()}
            />
            <button
              className="px-4 py-2 rounded bg-[#A09ABC] text-white font-semibold"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
              }}
            >Copy Link</button>
            <div className="flex gap-2 mt-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-[#4267B2] underline">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] underline">Twitter</a>
            </div>
          </div>
        ) : modal?.title === 'Feedback' ? (
          feedbackSent ? (
            <div className="text-green-600 font-semibold">Thank you for your feedback!</div>
          ) : (
            <FeedbackForm onSend={() => setFeedbackSent(true)} />
          )
        ) : (
          modal?.content
        )}
      </Modal>
      <Modal
        open={changePw}
        onClose={() => { setChangePw(false); setChangePwSuccess(false); setChangePwError(null); }}
        title="Change Password"
      >
        {changePwSuccess ? (
          <div className="text-green-600 font-semibold">Password changed successfully!</div>
        ) : (
          <>
            <ChangePasswordForm
              onSuccess={() => { setChangePwSuccess(true); setChangePwError(null); }}
              onError={msg => setChangePwError(msg)}
            />
            {changePwError && <div className="text-red-600 text-sm mt-2">{changePwError}</div>}
          </>
        )}
      </Modal>
      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
      >
        <div className="mb-4">Are you sure you want to log out?</div>
        <div className="flex gap-4 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-[#6C63A6] font-semibold"
            onClick={() => setShowLogoutConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </Modal>
      <LegalModal open={open === "privacy"} onClose={() => setOpen(null)} title="Privacy Policy">
        <p><strong>Last updated:</strong> July 7, 2025</p>
        <p>Charity Ricabo ("we", "our", or "us") operates the Muni app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
        <h3>Information We Collect</h3>
        <p>We may collect personal information such as your name, email address, and usage data to provide and improve our services. We do not sell your personal information to third parties.</p>
        <h3>How We Use Your Information</h3>
        <p>Your information is used to operate, maintain, and enhance the features of our app, to communicate with you, and to comply with legal obligations.</p>
        <h3>Cookies and Tracking</h3>
        <p>We use cookies and similar technologies to personalize your experience and analyze usage. You can control cookies through your browser settings.</p>
        <h3>Data Security</h3>
        <p>We implement reasonable security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        <h3>Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.</p>
        <h3>Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:chrdy.4u@gmail.com">chrdy.4u@gmail.com</a>.</p>
      </LegalModal>
      <LegalModal open={open === "terms"} onClose={() => setOpen(null)} title="Terms & Conditions">
        <p><strong>Last updated:</strong> July 7, 2025</p>
        <p>By accessing or using the Muni app, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our Service.</p>
        <h3>Use of Service</h3>
        <p>You agree to use the app only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account information.</p>
        <h3>Intellectual Property</h3>
        <p>All content, features, and functionality of the app are the exclusive property of Charity Ricabo and are protected by intellectual property laws.</p>
        <h3>Limitation of Liability</h3>
        <p>Charity Ricabo is not liable for any indirect, incidental, or consequential damages arising from your use of the app.</p>
        <h3>Changes to Terms</h3>
        <p>We reserve the right to modify these Terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.</p>
        <h3>Contact Us</h3>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:chrdy.4u@gmail.com">chrdy.4u@gmail.com</a>.</p>
      </LegalModal>
      <LegalModal open={open === "cookies"} onClose={() => setOpen(null)} title="Cookies Policy">
        <p><strong>Last updated:</strong> July 7, 2025</p>
        <p>This Cookies Policy explains how Charity Ricabo uses cookies and similar technologies when you use our app.</p>
        <h3>What Are Cookies?</h3>
        <p>Cookies are small text files stored on your device to help us improve your experience and analyze usage of our app.</p>
        <h3>How We Use Cookies</h3>
        <p>We use cookies to remember your preferences, enable certain features, and gather analytics data. You can manage cookies through your browser settings.</p>
        <h3>Managing Cookies</h3>
        <p>You can choose to disable cookies through your browser, but some features of the app may not function properly as a result.</p>
        <h3>Changes to This Policy</h3>
        <p>We may update our Cookies Policy from time to time. Updates will be posted on this page with a new effective date.</p>
        <h3>Contact Us</h3>
        <p>If you have any questions about this Cookies Policy, please contact us at <a href="mailto:chrdy.4u@gmail.com">chrdy.4u@gmail.com</a>.</p>
      </LegalModal>
      <div className={`flex min-h-screen transition-colors duration-300 items-center justify-center ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Glowing background for dark mode */}
        {darkMode && (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 520,
              height: 520,
              transform: 'translate(-50%, -50%)',
              zIndex: 0,
              pointerEvents: 'none',
              filter: 'blur(60px)',
              opacity: 0.7,
              background: 'radial-gradient(circle at 60% 40%, #A09ABC 0%, #6C63A6 60%, transparent 100%)',
              animation: 'glowPulse 6s ease-in-out infinite',
            }} />
          </>
        )}
        <main className={`flex-1 flex items-center justify-center p-6 transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`w-full max-w-sm mx-auto rounded-3xl shadow-2xl ${darkMode ? 'bg-[#23234a]' : 'bg-white/90'} p-0 overflow-hidden`}>
            <div className="px-6 pt-8 pb-2">
              <h2 className="text-2xl font-bold text-center text-[#A09ABC] mb-6">Settings</h2>
              <ul className="space-y-1">
                <li className="flex items-center justify-between py-3 border-b border-[#E1D8E9]">
                  <div className="flex items-center gap-4 text-[#6C63A6]">
                    <FaMoon className="text-lg" />
                    <span className="font-medium">Dark Mode</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${darkMode ? 'bg-[#A09ABC]' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${darkMode ? 'translate-x-6' : ''}`}
                    />
                  </button>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => setShowRateModal(true)}>
                  <FaStar className="text-lg" />
                  <span className="font-medium">Rate the Website</span>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Muni',
                        text: 'Check out Muni!',
                        url: window.location.origin,
                      });
                    } else {
                      setModal({title: 'Share App', content: ''});
                    }
                  }}>
                  <FaShareAlt className="text-lg" />
                  <span className="font-medium">Share App</span>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => setOpen("privacy")}>
                  <FaFileAlt className="text-lg" />
                  <span className="font-medium">Privacy Policy</span>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => setOpen("terms")}>
                  <FaFileContract className="text-lg" />
                  <span className="font-medium">Terms and Conditions</span>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => setOpen("cookies")}>
                  <FaCookieBite className="text-lg" />
                  <span className="font-medium">Cookies Policy</span>
                </li>
                <li className="flex items-center gap-4 py-3 border-b border-[#E1D8E9] text-[#6C63A6] cursor-pointer hover:bg-[#f0edf6] rounded transition-all"
                  onClick={() => setModal({title: 'Feedback', content: ''})}>
                  <FaCommentDots className="text-lg" />
                  <span className="font-medium">Feedback</span>
                </li>
              </ul>
            </div>
            <div className="px-6 pb-8 pt-2 space-y-3">
              <button
                onClick={() => setChangePw(true)}
                className={`w-full px-6 py-3 rounded-full ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-white text-[#6C63A6]'} font-semibold shadow hover:bg-[#f0edf6] transition-all duration-300 border border-[#A09ABC]/20`}
              >
                <span className="flex items-center justify-center gap-2"><FaLock aria-hidden /> Change Password</span>
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </main>
      </div>
      <Modal open={showRateModal} onClose={() => { setShowRateModal(false); setRating(0); setRated(false); setRatingError(null); }} title="Rate the Website">
        {!rated ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1 text-3xl">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  style={{ cursor: 'pointer', color: star <= rating ? '#FFD700' : '#A09ABC', background: 'none', border: 'none', padding: 0 }}
                  onClick={() => setRating(star)}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <button
              className="px-4 py-2 rounded bg-[#A09ABC] text-white font-semibold mt-2 disabled:opacity-60"
              disabled={rating === 0 || ratingSaving}
              onClick={submitRating}
            >
              {ratingSaving ? 'Sending...' : 'Submit'}
            </button>
            {ratingError && <div className="text-red-600 text-sm">{ratingError}</div>}
          </div>
        ) : (
          <div className="text-center text-[#6C63A6] font-semibold">Thank you for rating our website!</div>
        )}
      </Modal>
      <style jsx global>{`
        @keyframes glowPulse {
          0% { opacity: 0.7; filter: blur(60px); }
          50% { opacity: 1; filter: blur(80px); }
          100% { opacity: 0.7; filter: blur(60px); }
        }
      `}</style>
    </>
  );
}
