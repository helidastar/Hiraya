import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import Head from "next/head";
import { TransitionContext } from "../_app";
import { motion } from "framer-motion";
import LegalModal from "../../components/LegalModal";
import Terms from "../terms";
import PrivacyPolicy from "../privacy";

const palette = {
  nostalgia1: "#A09ABC",
  nostalgia2: "#B6A6CA",
  nostalgia3: "#D5CFE1",
  nostalgia4: "#E1D8E9",
  nostalgia5: "#D4BEBE",
  dark: "#6C63A6"
};

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  useContext(TransitionContext);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy before signing up.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone || null, // phone is optional
          }
        }
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          (msg.includes("email") && msg.includes("exists")) ||
          (msg.includes("user") && msg.includes("exists"))
        ) {
          setError("This email is already registered. Please use another email or sign in.");
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      // With email confirmation on, Supabase hides existing accounts by returning
      // a user with no identities instead of an error.
      if (data.user && data.user.identities?.length === 0) {
        setError("This email is already registered. Please use another email or sign in.");
        setLoading(false);
        return;
      }

      // Only create the profile now if we already have a session. Otherwise
      // login creates it after the email is confirmed.
      if (data.user && data.session) {
        await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: `${form.firstName} ${form.lastName}`,
              phone: form.phone || null,
            },
          ]);
      }

      // Show confirmation message for truly new users
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <Head>
        <title>{error ? `Error: ${error}` : "Sign Up | Reflectly"}</title>
      </Head>
      {/* Animated Background */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-bg"
        style={{
          background: `linear-gradient(120deg, ${palette.dark}, ${palette.nostalgia1}, ${palette.nostalgia2}, ${palette.nostalgia3}, ${palette.nostalgia4}, ${palette.nostalgia5})`,
          backgroundSize: "300% 300%"
        }}
      />
      {/* Animated Blob Behind Card */}
      <motion.div className="absolute left-1/4 top-1/4 w-[18rem] h-[18rem] rounded-full bg-[#B6A6CA]/40 blur-3xl z-0" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      {/* Glassmorphism Card */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-center w-full max-w-lg min-h-[auto] h-auto bg-white/25 border border-white/40 rounded-3xl shadow-2xl backdrop-blur-2xl mx-1 my-4 overflow-hidden" style={{ boxShadow: "0 8px 32px 0 #A09ABC33, 0 0 0 1.5px #fff3" }}>
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-6 md:px-10 md:py-10 min-w-[220px] max-w-[600px]">
          {/* REMOVE the error box above the form */}
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center mb-2">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              {/* SVG Icon */}
              <svg width="22" height="22" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="4" width="8" height="20" rx="4" fill="#A09ABC"/>
                <rect x="16" y="24" width="4" height="6" rx="2" fill="#D4BEBE"/>
                <rect x="16" y="2" width="4" height="6" rx="2" fill="#E1D8E9"/>
              </svg>
            </motion.div>
            <h1 className="text-lg md:text-xl font-bold text-[#6C63A6] mt-0.5 mb-0.5 text-center tracking-wide">Sign Up</h1>
            <div className="w-8 md:w-10 h-0.5 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] opacity-60 mb-0.5" />
          </motion.div>
          {/* Error box ABOVE the form for visibility */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
              {error}
            </div>
          )}
          <form className="flex flex-col gap-1 md:gap-2 w-full" onSubmit={handleSignup}>
            <div className="flex flex-row gap-2 w-full">
              <div className="flex-1 flex flex-col">
                <label htmlFor="firstName" className="text-[#6C63A6] font-semibold text-xs md:text-sm">First Name</label>
                <input id="firstName" name="firstName" type="text" required value={form.firstName} onChange={handleChange} className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
              </div>
              <div className="flex-1 flex flex-col">
                <label htmlFor="lastName" className="text-[#6C63A6] font-semibold text-xs md:text-sm">Last Name</label>
                <input id="lastName" name="lastName" type="text" required value={form.lastName} onChange={handleChange} className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
              </div>
            </div>
            <label htmlFor="email" className="text-[#6C63A6] font-semibold text-xs md:text-sm mt-1">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
            <label htmlFor="password" className="text-[#6C63A6] font-semibold text-xs md:text-sm mt-1">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
            <label htmlFor="confirm" className="text-[#6C63A6] font-semibold text-xs md:text-sm mt-1">Re-enter password</label>
            <input id="confirm" name="confirm" type="password" required value={form.confirm} onChange={handleChange} className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full" />
            <label htmlFor="phone" className="text-[#6C63A6] font-semibold text-xs md:text-sm mt-1">
              Phone Number <span className="font-normal text-[#A09ABC]">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="p-1 md:p-2 rounded-lg border border-[#D5CFE1] bg-white/80 text-[#6C63A6] text-xs md:text-sm placeholder-[#A09ABC] focus:outline-none focus:ring-2 focus:ring-[#A09ABC] transition-all duration-200 hover:shadow-lg w-full"
              placeholder="Phone Number (optional)"
            />
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#6C63A6] font-light mt-1">
              <input
                type="checkbox"
                id="terms"
                className="accent-[#A09ABC]"
                checked={agreedTerms}
                onChange={e => setAgreedTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I&apos;ve read and agree with <button type="button" className="underline text-[#6C63A6] hover:text-[#A09ABC]" style={{background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={() => setShowTerms(true)}>Terms of Service</button> and our <button type="button" className="underline text-[#6C63A6] hover:text-[#A09ABC]" style={{background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
              </label>
            </div>
            <button
              className="mt-2 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold text-base md:text-lg shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#A09ABC]/30 w-full"
              type="submit"
              disabled={success || loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
          <div className="text-center text-[#6C63A6] mt-1 text-xs md:text-sm">
            Already have an account? <span className="text-[#A09ABC] font-semibold cursor-pointer hover:underline" onClick={() => router.push("/auth/login")}>Sign in</span>
          </div>
          {/* After the form, show a confirmation message if success is true */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mt-2 text-center">
              Registration successful! Please check your email to confirm your account before signing in.
            </div>
          )}
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 min-w-[80px] max-w-[120px] relative">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="mb-1 md:mb-2">
            <svg width="40" height="40" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="60" cy="80" rx="40" ry="20" fill="#D5CFE1" />
              <ellipse cx="80" cy="70" rx="20" ry="10" fill="#B6A6CA" />
              <ellipse cx="45" cy="70" rx="15" ry="8" fill="#E1D8E9" />
              <rect x="50" y="50" width="20" height="24" rx="6" fill="#A09ABC" />
              <rect x="56" y="62" width="8" height="8" rx="2" fill="#fff" />
              <path d="M60 50v-8a8 8 0 1 1 16 0v8" stroke="#6C63A6" strokeWidth="2" fill="none" />
            </svg>
          </motion.div>
          {/* Sparkles */}
          <motion.div className="absolute left-2 top-2 text-[#A09ABC] text-xs md:text-lg opacity-70" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>✦</motion.div>
          <motion.div className="absolute right-2 bottom-2 text-[#B6A6CA] text-xs md:text-lg opacity-60" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>✧</motion.div>
        </div>
      </div>
      <LegalModal open={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <Terms />
      </LegalModal>
      <LegalModal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <PrivacyPolicy />
      </LegalModal>
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