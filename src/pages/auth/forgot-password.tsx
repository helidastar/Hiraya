import { useState } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <Head>
        <title>Forgot Password | Hiraya</title>
      </Head>
      <div className="fixed inset-0 -z-10 animate-gradient-bg" style={{ background: `linear-gradient(120deg, #6C63A6, #A09ABC, #B6A6CA, #D5CFE1, #E1D8E9, #D4BEBE)`, backgroundSize: "300% 300%" }} />
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md min-h-[300px] h-auto bg-white/25 border border-white/40 rounded-3xl shadow-2xl backdrop-blur-2xl mx-1 my-4 overflow-hidden" style={{ boxShadow: "0 8px 32px 0 #A09ABC33, 0 0 0 1.5px #fff3" }}>
        <h1 className="text-lg md:text-xl font-bold text-[#6C63A6] mt-6 mb-2 text-center tracking-wide">Forgot Password</h1>
        <form className="flex flex-col gap-2 w-full px-8" onSubmit={handleSubmit}>
          <label htmlFor="email" className="text-[#6C63A6] font-semibold text-xs md:text-sm">Email</label>
          <input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
          <button type="submit" disabled={loading} className="mt-2 py-2 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold text-base shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 hover:shadow-xl w-full disabled:opacity-60">{loading ? "Sending..." : "Send Reset Link"}</button>
        </form>
        {message && <div className="text-green-600 text-center mt-2 text-sm">{message}</div>}
        {error && <div className="text-red-500 text-center mt-2 text-sm">{error}</div>}
        <div className="text-center text-[#6C63A6] mt-4 mb-6 text-xs md:text-sm">
          <Link href="/auth/login" className="underline text-[#A09ABC] font-semibold">Back to Login</Link>
        </div>
      </div>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          animation: gradientBG 16s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 