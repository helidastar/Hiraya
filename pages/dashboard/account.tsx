import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Head from "next/head";
import { useDarkMode } from "../../components/DarkModeContext";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

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
const [collapsed, setCollapsed] = useState(false);
const [profileLoading, setProfileLoading] = useState(false);
const [profileSuccess, setProfileSuccess] = useState(false);
const { darkMode } = useDarkMode();
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
const [showNotification, setShowNotification] = useState(false);
const [notificationType, setNotificationType] = useState<'success' | 'error' | null>(null);
const [notificationMsg, setNotificationMsg] = useState('');



// Show notification when profileSuccess or profileError changes
useEffect(() => {
  if (profileSuccess) {
    setNotificationType('success');
    setNotificationMsg('Profile updated successfully!');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  } else if (profileError) {
    setNotificationType('error');
    setNotificationMsg(profileError);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3500);
  }
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

  // Handler for Delete Account (placeholder)
  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // TODO: Add backend logic for account deletion
      alert("Account deletion is not implemented yet.");
    }
  };



function handleCancelEdit() {
  setEditMode(false);
  setNewAvatarFile(null);
  setNewHeaderFile(null);
  setProfileError(null);
}

return (
<div className={`relative min-h-screen w-full flex animate-gradient-bg overflow-hidden ${darkMode ? 'bg-[#1a1a2e]' : ''}`}>
<Head>
<title>Account | Muni</title>
</Head>
{/* Sidebar */}
<Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
{/* Animated Clouds */}
<div className="absolute left-0 top-24 w-1/2 z-10 animate-cloud-left pointer-events-none">
<svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="60" cy="60" rx="60" ry="20" fill="#D5CFE1" />
<ellipse cx="140" cy="50" rx="50" ry="18" fill="#E1D8E9" />
<ellipse cx="220" cy="65" rx="70" ry="22" fill="#B6A6CA" />
</svg>
</div>
<div className="absolute right-0 top-40 w-1/3 z-10 animate-cloud-right pointer-events-none">
<svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="50" cy="40" rx="50" ry="15" fill="#E1D8E9" />
<ellipse cx="120" cy="30" rx="40" ry="12" fill="#D5CFE1" />
</svg>
</div>
{/* Main Content */}
<main className={`flex min-h-screen w-full items-center justify-center ${darkMode ? 'bg-gradient-to-br from-[#1a1a2e] via-[#23234a] to-[#23234a]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#B6A6CA] to-[#B6A6CA]'} ${darkMode ? 'dark' : ''}`}>
  <div className={`max-w-xl w-full rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center relative mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-gradient-to-b from-orange-100 to-purple-200 text-gray-800'}`}>
    {/* Header Banner */}
    <div className="w-full h-56 rounded-t-3xl overflow-hidden relative flex items-center justify-center">
      <Image
        src={newHeaderFile ? URL.createObjectURL(newHeaderFile) : header}
        alt="Header"
        fill
        style={{ objectFit: "cover" }}
        className="rounded-t-3xl"
        onError={(e) => (e.currentTarget.src = "/default-header.jpg")}
      />
      {editMode && (
        <>
          <label className="absolute top-3 right-4 flex items-center gap-2 cursor-pointer bg-white/80 hover:bg-white/90 px-4 py-2 rounded-full shadow transition-all">
            <span className="font-medium text-[#6C63A6] text-xs">Change Header</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setNewHeaderFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="button"
            className="absolute top-3 left-4 bg-white/80 hover:bg-red-200 text-red-600 px-4 py-2 rounded-full shadow text-xs font-semibold transition-all"
            onClick={() => {
              setNewHeaderFile(null);
              setHeader('/default-header.jpg');
            }}
          >
            Remove Header
          </button>
        </>
      )}
    </div>
    {/* Edit Profile Button */}
    {!editMode && (
      <button
        onClick={() => setEditMode(true)}
        className={`absolute top-6 right-6 px-5 py-2 rounded-full font-semibold shadow hover:bg-white text-base transition-colors duration-300 ${darkMode ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80' : 'bg-white/80 text-gray-700'}`}
      >
        Edit Profile
      </button>
    )}
    {/* Avatar */}
    <div className={`w-36 h-36 rounded-full shadow-lg flex items-center justify-center mb-8 -mt-16 overflow-hidden relative z-10 border-4 border-white ${darkMode ? 'bg-[#1a1a2e] border-[#23234a]' : 'bg-white border-white'}`}>
      <Image
        src={newAvatarFile ? URL.createObjectURL(newAvatarFile) : avatar}
        alt="Avatar"
        width={144}
        height={144}
        style={{ objectFit: "cover" }}
        onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
      />
      {editMode && (
        <>
          <label className={`absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 cursor-pointer px-3 py-2 rounded-full shadow transition-all border border-[#A09ABC]/30 ${darkMode ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80' : 'bg-white/90 text-[#6C63A6] hover:bg-white'}`}>
            <span className="font-medium text-xs">Change</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setNewAvatarFile(e.target.files?.[0] || null)}
            />
          </label>
          <button
            type="button"
            className={`absolute top-2 right-2 px-3 py-1 rounded-full shadow text-xs font-semibold transition-all z-20 ${darkMode ? 'bg-[#23234a] text-red-400 hover:bg-red-900' : 'bg-white/80 text-red-600 hover:bg-red-200'}`}
            onClick={() => {
              setNewAvatarFile(null);
              setAvatar('/default-avatar.png');
            }}
          >
            Remove
          </button>
        </>
      )}
    </div>
    {/* Name, Email, Phone */}
    {editMode ? (
      <>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className={`text-3xl font-bold mb-3 text-center w-full rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'text-gray-800'}`}
        />
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`text-lg text-center mb-2 w-full rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'text-gray-600'}`}
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className={`text-base text-center mb-5 w-full rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'text-gray-500'}`}
        />
      </>
    ) : (
      <>
        <div className="text-3xl font-bold mb-3 text-center">{name}</div>
        <div className="text-lg text-center mb-2">{email}</div>
        <div className="text-base text-center mb-5">{phone}</div>
      </>
    )}
    {/* Bio/Quote */}
    {editMode ? (
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        className={`rounded-xl px-5 py-3 text-center italic text-base mb-8 w-full max-w-xs mx-auto shadow focus:outline-none border border-[#A09ABC]/30 ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-orange-100/80 text-gray-700'}`}
        rows={2}
      />
    ) : (
      <div className={`rounded-xl px-5 py-3 text-center italic text-base mb-8 w-full max-w-xs mx-auto shadow ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-orange-100/80 text-gray-700'}`}>{bio}</div>
    )}
    {/* Social Links */}
    <div className="w-full flex flex-col items-center mb-8">
      <div className={`text-lg font-bold mb-4 ${darkMode ? 'text-[#A09ABC]' : 'text-gray-700'}`}>Social Links</div>
      {editMode ? (
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-4">
          <input type="text" placeholder="Facebook URL" value={socialLinks.facebook} onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })} className={`rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : ''}`} />
          <input type="text" placeholder="Instagram URL" value={socialLinks.instagram} onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })} className={`rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : ''}`} />
          <input type="text" placeholder="Twitter URL" value={socialLinks.twitter} onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })} className={`rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : ''}`} />
          <input type="text" placeholder="GitHub URL" value={socialLinks.github} onChange={e => setSocialLinks({ ...socialLinks, github: e.target.value })} className={`rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : ''}`} />
          <input type="text" placeholder="Muni URL" value={socialLinks.reflectly} onChange={e => setSocialLinks({ ...socialLinks, reflectly: e.target.value })} className={`rounded px-3 py-2 border border-[#A09ABC]/30 focus:outline-none ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : ''}`} />
        </div>
      ) : null}
      <div className="flex flex-row gap-6 justify-center">
        <a href={socialLinks.facebook || '#'} title="Facebook" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition${!socialLinks.facebook ? ' opacity-40 pointer-events-none' : ''}`}> <img src="/pictures/facebook.png" alt="Facebook" className="w-9 h-9 rounded-full shadow-md object-cover" /> </a>
        <a href={socialLinks.instagram || '#'} title="Instagram" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition${!socialLinks.instagram ? ' opacity-40 pointer-events-none' : ''}`}> <img src="/pictures/instagram.png" alt="Instagram" className="w-9 h-9 rounded-full shadow-md object-cover" /> </a>
        <a href={socialLinks.reflectly || '#'} title="Muni" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition${!socialLinks.reflectly ? ' opacity-40 pointer-events-none' : ''}`}> <img src="/pictures/reflectly.png" alt="Muni" className="w-9 h-9 rounded-full shadow-md object-cover" /> </a>
        <a href={socialLinks.github || '#'} title="GitHub" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition${!socialLinks.github ? ' opacity-40 pointer-events-none' : ''}`}> <img src="/pictures/github.png" alt="GitHub" className="w-9 h-9 rounded-full shadow-md object-cover bg-white p-1" /> </a>
        <a href={socialLinks.twitter || '#'} title="Twitter" target="_blank" rel="noopener noreferrer" className={`hover:scale-110 transition${!socialLinks.twitter ? ' opacity-40 pointer-events-none' : ''}`}> <img src="/pictures/twitter.png" alt="Twitter" className="w-9 h-9 rounded-full shadow-md object-cover" /> </a>
      </div>
    </div>
    {/* Save/Cancel Buttons in Edit Mode */}
    {editMode && (
      <div className="flex flex-col gap-4 mt-4">
        {/* Error/Success Messages */}
        {profileError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center text-sm">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center text-sm">
            Profile updated successfully!
          </div>
        )}
        <div className="flex gap-4">
          <button
            onClick={handleCancelEdit}
            className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-300 ${darkMode ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-300 ${darkMode ? 'bg-gradient-to-r from-[#A09ABC] to-[#6C63A6] text-white hover:from-[#6C63A6] hover:to-[#A09ABC]' : 'bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white hover:from-[#B6A6CA] hover:to-[#A09ABC]'}`}
          >
            {profileLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    )}
    {/* Delete Account Section */}
    <div className="w-full flex flex-col items-center border-t border-gray-300 pt-6 mt-2">
      <button
        onClick={() => setShowDeleteModal(true)}
        className={`px-7 py-3 rounded-full font-bold shadow transition text-base mb-2 ${darkMode ? 'bg-gradient-to-r from-red-700 to-red-900 text-white hover:from-red-900 hover:to-red-700' : 'bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-600 hover:to-red-400'}`}
      >
        Delete My Account
      </button>
    </div>
    {/* Delete Account Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className={`rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center relative ${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-white'}` }>
          <button
            className={`absolute top-3 right-4 text-2xl focus:outline-none ${darkMode ? 'text-[#A09ABC] hover:text-[#6C63A6]' : 'text-[#A09ABC] hover:text-[#6C63A6]'}`}
            onClick={() => setShowDeleteModal(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="text-xl font-bold mb-2">Confirm Delete</div>
          <div className="mb-6 text-center">Are you sure you want to delete your account?<br/>This action cannot be undone.</div>
          <div className="flex gap-4 w-full justify-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className={`px-6 py-2 rounded-lg font-bold shadow w-1/2 ${darkMode ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80' : 'bg-gray-200 text-[#6C63A6] hover:bg-gray-300'}`}
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowDeleteModal(false); handleDeleteAccount(); }}
              className={`px-6 py-2 rounded-lg font-bold shadow w-1/2 ${darkMode ? 'bg-gradient-to-r from-red-700 to-red-900 text-white hover:from-red-900 hover:to-red-700' : 'bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-600 hover:to-red-400'}`}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  {/* Aesthetic Notification */}
  {showNotification && (
    <div className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-4 min-w-[280px] max-w-xs flex items-center gap-3 rounded-xl shadow-lg transition-all duration-500
      ${notificationType === 'success' ? 'bg-green-50 border border-green-300 text-green-800' : 'bg-red-50 border border-red-300 text-red-800'}
      animate-fade-in-out`}
      style={{animation: 'fadeInOut 2.5s'}}
    >
      <span className="text-2xl">
        {notificationType === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
      </span>
      <span className="font-medium text-sm break-words">{notificationMsg}</span>
    </div>
  )}
</main>
</div>
);
}