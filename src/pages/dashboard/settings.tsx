import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaMoon, FaLock, FaChevronRight,
  FaStar, FaShareAlt, FaFileAlt, FaFileContract, FaCookieBite, FaCommentDots, FaSignOutAlt
} from "react-icons/fa";
import { useDarkMode } from "../../components/DarkModeContext";
import LegalModal from "../../components/LegalModal";
import SharedModal from "../../components/Modal";
import PageShell from "../../components/PageShell";
import { rise } from "../../lib/motion";

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <SharedModal isOpen={open} onClose={onClose} title={title} style={{ maxWidth: 440 }}>
      {children}
    </SharedModal>
  );
}

const errorText = "rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300";
const successText = "rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300";

function FeedbackForm({ onSend }: { onSend: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
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
        if (error) setError("Your feedback didn't send. Try again in a moment.");
        else onSend();
      }}
    >
      <div>
        <label htmlFor="fb-name" className="label">Name</label>
        <input id="fb-name" ref={nameRef} type="text" autoComplete="name" className="field" required />
      </div>
      <div>
        <label htmlFor="fb-email" className="label">Email</label>
        <input id="fb-email" ref={emailRef} type="email" autoComplete="email" className="field" required />
      </div>
      <div>
        <label htmlFor="fb-message" className="label">Message</label>
        <textarea id="fb-message" ref={messageRef} className="field resize-y" rows={4} required />
      </div>
      {error && <p role="alert" className={errorText}>{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary w-full">{sending ? 'Sending...' : 'Send feedback'}</button>
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
      className="space-y-4"
      onSubmit={async e => {
        e.preventDefault();
        if (newPass !== confirm) {
          onError('The new passwords don\'t match.');
          return;
        }
        setLoading(true);
        // Supabase does not ask for the current password, so confirm it by signing in again
        const { data: { user } } = await supabase.auth.getUser();
        const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: current });
        if (verifyError) {
          setLoading(false);
          onError('Your current password is incorrect.');
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPass });
        setLoading(false);
        if (error) onError(error.message);
        else onSuccess();
      }}
    >
      <div>
        <label htmlFor="pw-current" className="label">Current password</label>
        <input id="pw-current" type="password" autoComplete="current-password" className="field" value={current} onChange={e => setCurrent(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="pw-new" className="label">New password</label>
        <input id="pw-new" type="password" autoComplete="new-password" className="field" value={newPass} onChange={e => setNewPass(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="pw-confirm" className="label">Confirm new password</label>
        <input id="pw-confirm" type="password" autoComplete="new-password" className="field" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Change password'}</button>
    </form>
  );
}

// One tappable row in a settings group
function Row({ icon, label, hint, onClick, children }: { icon: React.ReactNode, label: string, hint?: string, onClick?: () => void, children?: React.ReactNode }) {
  const inner = (
    <>
      <span className="icon-badge">{icon}</span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      {children ?? <FaChevronRight className="text-xs text-muted transition group-hover:translate-x-1 group-hover:text-iris" aria-hidden />}
    </>
  );
  return onClick ? (
    <li><button onClick={onClick} className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-iris-soft/60">{inner}</button></li>
  ) : (
    <li className="flex items-center gap-4 px-3 py-3">{inner}</li>
  );
}

function Group({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <motion.section variants={rise} className="mb-6">
      <h2 className="eyebrow mb-2 px-1">{title}</h2>
      <ul className="card divide-y divide-line p-2">{children}</ul>
    </motion.section>
  );
}

export default function Settings() {
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
    if (error) setRatingError("Your rating didn't send. Try again in a moment.");
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

  function shareApp() {
    if (navigator.share) {
      navigator.share({ title: 'Hiraya', text: 'Check out Hiraya!', url: window.location.origin }).catch(() => {});
    } else {
      setModal({ title: 'Share Hiraya', content: '' });
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <PageShell title="Settings" loading={loading} width="max-w-2xl">
      <Group title="Appearance">
        <Row icon={<FaMoon />} label="Dark mode" hint={darkMode ? 'On' : 'Off'}>
          <button
            role="switch"
            aria-checked={darkMode}
            aria-label="Dark mode"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${darkMode ? 'bg-iris' : 'bg-line'}`}
          >
            <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${darkMode ? 'right-1' : 'left-1'}`} />
          </button>
        </Row>
      </Group>

      <Group title="Account">
        <Row icon={<FaLock />} label="Change password" onClick={() => setChangePw(true)} />
        <Row icon={<FaSignOutAlt />} label="Log out" onClick={() => setShowLogoutConfirm(true)} />
      </Group>

      <Group title="Help improve Hiraya">
        <Row icon={<FaStar />} label="Rate Hiraya" onClick={() => setShowRateModal(true)} />
        <Row icon={<FaCommentDots />} label="Send feedback" onClick={() => setModal({ title: 'Send feedback', content: '' })} />
        <Row icon={<FaShareAlt />} label="Share Hiraya" onClick={shareApp} />
      </Group>

      <Group title="Legal">
        <Row icon={<FaFileAlt />} label="Privacy policy" onClick={() => setOpen("privacy")} />
        <Row icon={<FaFileContract />} label="Terms and conditions" onClick={() => setOpen("terms")} />
        <Row icon={<FaCookieBite />} label="Cookies policy" onClick={() => setOpen("cookies")} />
      </Group>

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); setFeedbackSent(false); }}
        title={modal?.title || ''}
      >
        {modal?.title === 'Share Hiraya' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <label htmlFor="share-link" className="sr-only">Link to Hiraya</label>
              <input id="share-link" type="text" value={origin} readOnly className="field" onFocus={e => e.target.select()} />
              <button
                className="btn-primary shrink-0"
                onClick={async () => { await navigator.clipboard.writeText(origin); toast.success('Link copied'); }}
              >Copy link</button>
            </div>
            <div className="flex gap-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(origin)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">Facebook</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(origin)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1">X (Twitter)</a>
            </div>
          </div>
        ) : modal?.title === 'Send feedback' ? (
          feedbackSent ? (
            <p role="status" className={successText}>Thanks. Your feedback was sent.</p>
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
        title="Change password"
      >
        {changePwSuccess ? (
          <p role="status" className={successText}>Your password was changed.</p>
        ) : (
          <>
            <ChangePasswordForm
              onSuccess={() => { setChangePwSuccess(true); setChangePwError(null); }}
              onError={msg => setChangePwError(msg)}
            />
            {changePwError && <p role="alert" className={`${errorText} mt-4`}>{changePwError}</p>}
          </>
        )}
      </Modal>
      <Modal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Log out of Hiraya?"
      >
        <p className="text-muted">You&apos;ll need your email and password to log back in.</p>
        <div className="mt-7 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleLogout}>Log out</button>
        </div>
      </Modal>
      <LegalModal open={open === "privacy"} onClose={() => setOpen(null)} title="Privacy Policy">
        <p><strong>Last updated:</strong> July 7, 2025</p>
        <p>Charity Ricabo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the Hiraya app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.</p>
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
        <p>By accessing or using the Hiraya app, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our Service.</p>
        <h3>Use of Service</h3>
        <p>You agree to use the app only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account information.</p>
        <h3>Intellectual Property</h3>
        <p>Hiraya was originally built by the ZAMDevs team. The app&apos;s name, design and code belong to its creators. You keep full ownership of the journal entries, comments and other content you create, and you can delete them or your account at any time.</p>
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
      <Modal open={showRateModal} onClose={() => { setShowRateModal(false); setRating(0); setRated(false); setRatingError(null); }} title="Rate Hiraya">
        {!rated ? (
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-1.5 text-4xl" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={rating === star}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  className={`transition-colors ${star <= rating ? 'text-mood-5' : 'text-line'}`}
                >
                  <FaStar />
                </motion.button>
              ))}
            </div>
            {ratingError && <p role="alert" className={errorText}>{ratingError}</p>}
            <button className="btn-primary w-full" disabled={rating === 0 || ratingSaving} onClick={submitRating}>
              {ratingSaving ? 'Sending...' : 'Send rating'}
            </button>
          </div>
        ) : (
          <p role="status" className={`${successText} text-center`}>Thanks for rating Hiraya.</p>
        )}
      </Modal>
    </PageShell>
  );
}
