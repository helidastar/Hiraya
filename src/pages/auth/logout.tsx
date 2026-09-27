import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { ease } from '../../lib/motion';

// The week in reverse: sunrise fading back to night
const SUNSET = ["bg-mood-5", "bg-mood-4", "bg-mood-4", "bg-mood-3", "bg-mood-3", "bg-mood-2", "bg-mood-1"];

export default function Logout() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const handleCancel = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <Head>
        <title>Log out | Hiraya</title>
      </Head>
      <motion.div
        className="card w-full max-w-md p-8 text-center sm:p-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="mx-auto mb-8 flex h-10 max-w-[220px] items-end gap-1.5" aria-hidden>
          {SUNSET.map((tone, i) => (
            <motion.div
              key={i}
              className={`flex-1 origin-bottom rounded-lg ${tone}`}
              initial={{ height: '100%' }}
              animate={{ height: `${100 - i * 11}%` }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease }}
            />
          ))}
        </div>
        <h1 className="font-display text-3xl">Log out of Hiraya?</h1>
        <p className="mt-3 text-muted">Your entries and moods are saved. Log back in any time with your email and password.</p>
        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <button className="btn-ghost" onClick={handleCancel}>Stay logged in</button>
          <button className="btn-primary" onClick={handleLogout} disabled={leaving}>
            {leaving ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
