import { useState } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("If your email is registered, you'll receive a password reset link.");
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle={<>Enter your email and we&apos;ll send you a reset link.</>}
    >
      <Head>
        <title>Forgot Password | Hiraya</title>
      </Head>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="field" />
        </div>
        {message && <p role="status" className="rounded-xl border border-mood-5/60 bg-mood-5/15 px-4 py-3 text-sm">{message}</p>}
        {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? "Sending..." : "Send reset link"}</button>
        <p className="text-center text-sm text-muted">
          Remembered it? <Link href="/auth/login" className="font-semibold text-iris hover:underline">Back to log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
