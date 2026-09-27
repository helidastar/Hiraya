import { useState, useContext } from "react";
import { supabase } from "../../lib/supabaseClient";
import Head from "next/head";
import { TransitionContext } from "../_app";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import AuthLayout from "../../components/AuthLayout";
import LegalModal from "../../components/LegalModal";
import Terms from "../terms";
import PrivacyPolicy from "../privacy";

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

  const alertClass = "rounded-xl border px-4 py-3 text-sm";

  return (
    <AuthLayout
      title="Create your journal"
      subtitle={<>Already have an account? <Link href="/auth/login" className="font-semibold text-iris hover:underline">Log in</Link></>}
    >
      <Head>
        <title>Sign up | Hiraya</title>
      </Head>
      {success ? (
        <div role="status" className={`${alertClass} border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300`}>
          <p className="font-semibold">Check your email</p>
          <p className="mt-1">We sent a confirmation link to {form.email}. Open it, then log in.</p>
        </div>
      ) : (
      <form className="space-y-5" onSubmit={handleSignup}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="label">First name</label>
            <input id="firstName" name="firstName" type="text" autoComplete="given-name" required value={form.firstName} onChange={handleChange} className="field" />
          </div>
          <div>
            <label htmlFor="lastName" className="label">Last name</label>
            <input id="lastName" name="lastName" type="text" autoComplete="family-name" required value={form.lastName} onChange={handleChange} className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} className="field" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} className="field" />
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm password</label>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={handleChange} className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone number <span className="font-normal text-muted">(optional)</span></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} className="field" />
        </div>
        <div className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 h-4 w-4 shrink-0 accent-iris"
            checked={agreedTerms}
            onChange={e => setAgreedTerms(e.target.checked)}
            required
          />
          <label htmlFor="terms">
            I agree to the <button type="button" className="font-semibold text-iris hover:underline" onClick={() => setShowTerms(true)}>Terms of Service</button> and <button type="button" className="font-semibold text-iris hover:underline" onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
          </label>
        </div>
        <AnimatePresence initial={false}>{error && <motion.p key={error} role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className={`${alertClass} border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300`}>{error}</motion.p>}</AnimatePresence>
        <button className="btn-primary w-full py-3.5 text-base" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      )}
      <LegalModal open={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <Terms />
      </LegalModal>
      <LegalModal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <PrivacyPolicy />
      </LegalModal>
    </AuthLayout>
  );
}
