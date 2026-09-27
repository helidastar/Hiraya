import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);

  // On mount, if access_token is in the hash, set it as a cookie for Supabase
  useEffect(() => {
    // Supabase sends the access_token in the hash fragment
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        // Convert hash to query string for Supabase
        const params = new URLSearchParams(hash.replace('#', '?'));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          supabase.auth.setSession({ access_token, refresh_token });
        }
      }
      setTokenChecked(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Your password has been reset! You can now log in.');
      setTimeout(() => router.push('/auth/login'), 2000);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Pick something you haven't used before.">
      <Head>
        <title>Reset Password | Hiraya</title>
      </Head>
      {!tokenChecked ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="label">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" className="field" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" className="field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
          {success && <p role="status" className="rounded-xl border border-mood-5/60 bg-mood-5/15 px-4 py-3 text-sm">{success}</p>}
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <p className="text-center text-sm text-muted">
            <Link href="/auth/login" className="font-semibold text-iris hover:underline">Back to log in</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
