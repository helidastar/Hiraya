import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
    <>
      <Head>
        <title>Reset Password | Hiraya</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E1D8E9] via-[#B6A6CA] to-[#D4BEBE]">
        <div className="bg-white/60 rounded-2xl shadow-lg p-8 w-full max-w-md border border-white/30">
          <h2 className="text-2xl font-bold text-[#A09ABC] mb-6 text-center">Reset Password</h2>
          {!tokenChecked ? (
            <div className="text-center text-[#A09ABC]">Loading...</div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="New Password"
                className="rounded-md px-4 py-2 border border-[#A09ABC]/30 focus:outline-none focus:ring-2 focus:ring-[#A09ABC] bg-white/80"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="rounded-md px-4 py-2 border border-[#A09ABC]/30 focus:outline-none focus:ring-2 focus:ring-[#A09ABC] bg-white/80"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="submit"
                className="mt-2 py-2 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold text-base shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 hover:shadow-xl w-full disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-[#A09ABC] hover:underline">Back to Login</a>
          </div>
        </div>
      </div>
    </>
  );
}
