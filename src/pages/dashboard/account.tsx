import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { FaCamera, FaPen } from "react-icons/fa";
import Modal from "../../components/Modal";
import PageShell from "../../components/PageShell";
import { rise, ease } from "../../lib/motion";

const SOCIALS = [
  { key: 'facebook', label: 'Facebook', icon: '/pictures/facebook.png' },
  { key: 'instagram', label: 'Instagram', icon: '/pictures/instagram.png' },
  { key: 'twitter', label: 'X (Twitter)', icon: '/pictures/twitter.png' },
  { key: 'github', label: 'GitHub', icon: '/pictures/github.png' },
  { key: 'reflectly', label: 'Hiraya', icon: '/pictures/reflectly.png' },
] as const;

type JournalEntry = {
id: string;
created_at: string;
title?: string;
content?: string;
// Add other fields as needed from your journal table
[key: string]: unknown;
};

export default function Account() {
const [header, setHeader] = useState("/default-header.jpg");
const [avatar, setAvatar] = useState("/default-avatar.png");
const [name, setName] = useState("Your Name");
const [bio, setBio] = useState("Short bio goes here...");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [userId, setUserId] = useState<string | null>(null);
const [profileLoading, setProfileLoading] = useState(false);
const [profileSuccess, setProfileSuccess] = useState(false);
const [editMode, setEditMode] = useState(false);
const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
const [newHeaderFile, setNewHeaderFile] = useState<File | null>(null);
const [profileError, setProfileError] = useState<string | null>(null);
// Add state for social links
const [socialLinks, setSocialLinks] = useState({
  facebook: '',
  instagram: '',
  twitter: '',
  github: '',
  reflectly: ''
});
// Add state for delete modal
const [showDeleteModal, setShowDeleteModal] = useState(false);
const router = useRouter();



// Confirm saves and report errors as toasts
useEffect(() => {
  if (profileSuccess) toast.success('Profile saved');
  else if (profileError) toast.error(profileError);
}, [profileSuccess, profileError]);

// Fetch user info and profile images
useEffect(() => {
async function fetchProfile() {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
setUserId(user.id);
// Fetch profile from your 'profiles' table
const { data: profile } = await supabase
.from("profiles")
.select("avatar_url, header_url, full_name, bio, phone, facebook_url, instagram_url, twitter_url, github_url, reflectly_url, display_email")
.eq("id", user.id)
.single();
if (profile) {
setAvatar(profile.avatar_url || "/default-avatar.png");
setHeader(profile.header_url || "/default-header.jpg");
setName(profile.full_name || "Your Name");
setBio(profile.bio || "Short bio goes here...");
setPhone(profile.phone || "");
// Use display_email from profile if available, otherwise use auth email
setEmail(profile.display_email !== null ? profile.display_email : (user.email || ""));
// Set social links from database
setSocialLinks({
  facebook: profile.facebook_url || '',
  instagram: profile.instagram_url || '',
  twitter: profile.twitter_url || '',
  github: profile.github_url || '',
  reflectly: profile.reflectly_url || ''
});
} else {
// If no profile exists, use auth email
setEmail(user.email || "");
}

}
}
fetchProfile();
}, []);

// Remove friendsList state, fetchFriendsList useEffect, and Friends List section from the render block

async function handleProfileSave() {
if (!userId) return;
setProfileLoading(true);
setProfileError(null);
let avatarUrl = avatar;
let headerUrl = header;
// Upload avatar if changed
if (newAvatarFile) {
const { data, error } = await supabase.storage.from('avatars').upload(`${userId}/avatar-${uuidv4()}`, newAvatarFile, { upsert: true });
if (error) {
setProfileError('Failed to upload avatar: ' + error.message);
setProfileLoading(false);
return;
}
if (data) {
const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(data.path);
avatarUrl = publicUrl.publicUrl;
}
}
// Upload header if changed
if (newHeaderFile) {
const { data, error } = await supabase.storage.from('headers').upload(`${userId}/header-${uuidv4()}`, newHeaderFile, { upsert: true });
if (error) {
setProfileError('Failed to upload header: ' + error.message);
setProfileLoading(false);
return;
}
if (data) {
const { data: publicUrl } = supabase.storage.from('headers').getPublicUrl(data.path);

headerUrl = publicUrl.publicUrl;
}
}
const { error: updateError } = await supabase.from('profiles').update({
full_name: name,
bio,
phone,
display_email: email,
avatar_url: avatarUrl,
header_url: headerUrl,
facebook_url: socialLinks.facebook,
instagram_url: socialLinks.instagram,
twitter_url: socialLinks.twitter,
github_url: socialLinks.github,
reflectly_url: socialLinks.reflectly,
}).eq('id', userId);
if (updateError) {
setProfileError('Failed to update profile: ' + updateError.message);
setProfileLoading(false);
return;
}
setAvatar(avatarUrl);
setHeader(headerUrl);
setProfileLoading(false);
setProfileSuccess(true);
setEditMode(false);
setNewAvatarFile(null);
setNewHeaderFile(null);
setTimeout(() => setProfileSuccess(false), 3000);
}

  // Deletes the account and all its data (supabase/migrations/*_delete_own_account.sql).
  // The confirm modal below is the confirmation step.
  const handleDeleteAccount = async () => {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) {
      setProfileError('Failed to delete account: ' + error.message);
      return;
    }
    await supabase.auth.signOut();
    router.push('/auth/signup');
  };



function handleCancelEdit() {
  setEditMode(false);
  setNewAvatarFile(null);
  setNewHeaderFile(null);
  setProfileError(null);
}

const headerSrc = newHeaderFile ? URL.createObjectURL(newHeaderFile) : header;
const avatarSrc = newAvatarFile ? URL.createObjectURL(newAvatarFile) : avatar;
const chipBtn = "inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70";

return (
  <PageShell
    title="Account"
    width="max-w-3xl"
    actions={!editMode && <button onClick={() => setEditMode(true)} className="btn-ghost"><FaPen aria-hidden className="text-xs" /> Edit profile</button>}
  >
    <motion.section variants={rise} className="card overflow-hidden">
      <div className="relative h-44 bg-[linear-gradient(135deg,rgb(var(--iris)),rgb(var(--blush)))] sm:h-56">
        <Image src={headerSrc} alt="" fill style={{ objectFit: "cover" }} onError={(e) => (e.currentTarget.src = "/default-header.jpg")} />
        {editMode && (
          <div className="absolute right-3 top-3 flex gap-2">
            <label className={`${chipBtn} cursor-pointer`}>
              <FaCamera aria-hidden /> Change cover
              <input type="file" accept="image/*" className="sr-only" onChange={e => setNewHeaderFile(e.target.files?.[0] || null)} />
            </label>
            <button type="button" className={chipBtn} onClick={() => { setNewHeaderFile(null); setHeader('/default-header.jpg'); }}>Remove</button>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 sm:px-8">
        <div className="-mt-14 flex items-end gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-surface bg-paper shadow-glow ring-2 ring-iris/60 ring-offset-2 ring-offset-surface">
            <Image src={avatarSrc} alt="" width={112} height={112} className="h-full w-full object-cover" onError={(e) => (e.currentTarget.src = "/default-avatar.png")} />
            {editMode && (
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-white opacity-0 transition hover:opacity-100 focus-within:opacity-100">
                <FaCamera aria-hidden />
                <span className="sr-only">Change profile photo</span>
                <input type="file" accept="image/*" className="sr-only" onChange={e => setNewAvatarFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
          {editMode && (
            <button type="button" className="mb-2 text-sm font-semibold text-muted hover:text-red-600" onClick={() => { setNewAvatarFile(null); setAvatar('/default-avatar.png'); }}>
              Remove photo
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {editMode ? (
            <motion.form
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              className="mt-6 space-y-5"
              onSubmit={(e) => { e.preventDefault(); handleProfileSave(); }}
            >
              <div>
                <label htmlFor="acc-name" className="label">Name</label>
                <input id="acc-name" value={name} onChange={e => setName(e.target.value)} className="field" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="acc-email" className="label">Email shown on your profile</label>
                  <input id="acc-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="field" />
                </div>
                <div>
                  <label htmlFor="acc-phone" className="label">Phone</label>
                  <input id="acc-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="field" />
                </div>
              </div>
              <div>
                <label htmlFor="acc-bio" className="label">Bio</label>
                <textarea id="acc-bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} className="field resize-y" />
              </div>
              <fieldset>
                <legend className="label">Links</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SOCIALS.map(({ key, label, icon }) => (
                    <div key={key} className="relative">
                      <img src={icon} alt="" className="pointer-events-none absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full object-cover" />
                      <label htmlFor={`acc-${key}`} className="sr-only">{label} link</label>
                      <input
                        id={`acc-${key}`}
                        type="url"
                        placeholder={`${label} link`}
                        value={socialLinks[key]}
                        onChange={e => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                        className="field pl-12"
                      />
                    </div>
                  ))}
                </div>
              </fieldset>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleCancelEdit} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={profileLoading} className="btn-primary">{profileLoading ? 'Saving...' : 'Save profile'}</button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              className="mt-5"
            >
              <h2 className="font-display text-3xl">{name}</h2>
              <p className="mt-1 text-muted">{[email, phone].filter(Boolean).join(' · ')}</p>
              {bio && <p className="mt-5 max-w-xl whitespace-pre-wrap leading-relaxed">{bio}</p>}
              <div className="mt-6 flex flex-wrap gap-2">
                {SOCIALS.filter(({ key }) => socialLinks[key]).map(({ key, label, icon }) => (
                  <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer" className="btn-ghost py-2 pl-2 pr-4 text-sm">
                    <img src={icon} alt="" className="h-6 w-6 rounded-full object-cover" /> {label}
                  </a>
                ))}
                {SOCIALS.every(({ key }) => !socialLinks[key]) && (
                  <button onClick={() => setEditMode(true)} className="text-sm font-semibold text-iris hover:underline">Add links to your profile</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>

    <motion.section variants={rise} className="mt-6 rounded-3xl border border-red-200 p-6 dark:border-red-900/60 sm:p-8">
      <h2 className="font-semibold">Delete account</h2>
      <p className="mt-1 text-sm text-muted">Permanently removes your account, journal entries, moods, tasks, comments and likes.</p>
      <button onClick={() => setShowDeleteModal(true)} className="mt-4 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white dark:border-red-800 dark:text-red-400">
        Delete my account
      </button>
    </motion.section>

    <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete your account?" style={{ maxWidth: 440 }}>
      <p className="text-muted">Everything you&apos;ve written in Hiraya is deleted for good. This can&apos;t be undone.</p>
      <div className="mt-7 flex justify-end gap-2">
        <button onClick={() => setShowDeleteModal(false)} className="btn-ghost">Cancel</button>
        <button onClick={() => { setShowDeleteModal(false); handleDeleteAccount(); }} className="btn-primary !bg-red-600 !text-white">Delete account</button>
      </div>
    </Modal>
  </PageShell>
);
}
