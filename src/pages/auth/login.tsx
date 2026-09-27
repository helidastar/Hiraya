import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Head from "next/head";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AuthLayout from "../../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check for confirmation in URL (Supabase may use hash or query)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('confirmed') === 'true' || window.location.hash.includes('access_token')) {
        // Optionally, clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // After successful login, ensure profile exists
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();
        if (!profile && !profileError) {
          // Insert new profile with id and email
          await supabase.from("profiles").insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.first_name && user.user_metadata?.last_name
                ? user.user_metadata.first_name + " " + user.user_metadata.last_name
                : "",
            },
          ]);
        }
      }
      router.push("/dashboard");
    }
  }



  return (
    <AuthLayout
      title="Welcome back"
      subtitle={<>New to Hiraya? <Link href="/auth/signup" className="font-semibold text-iris hover:underline">Create an account</Link></>}
    >
      <Head>
        <title>Log in | Hiraya</title>
      </Head>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/auth/forgot-password" className="text-sm font-medium text-iris hover:underline">Forgot password?</Link>
          </div>
          <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="field" />
        </div>
        <AnimatePresence initial={false}>{error && <motion.p key={error} role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">{error}</motion.p>}</AnimatePresence>
        <button type="submit" className="btn-primary w-full py-3.5 text-base">Log in</button>
      </form>
    </AuthLayout>
  );
}
