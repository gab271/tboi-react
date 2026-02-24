import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, 
  FaKey, 
  FaUser, 
  FaHeart, 
  FaStar,
  FaBomb,
  FaUpload,
  FaSkull,
  FaExclamationTriangle,
  FaTrophy,
  FaBookmark
} from 'react-icons/fa';

// ═══════════════════════════════════════════════════════════════
// TBOI-STYLED AVATAR COMPONENT (Character Portrait Frame)
// ═══════════════════════════════════════════════════════════════
function IsaacAvatar({ url, size = 120, onUpload, uploading, t }) {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      setAvatarUrl(URL.createObjectURL(data));
    } catch (error) {
      console.log('Error downloading image:', error.message);
    }
  }

  const uploadAvatar = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (error) throw error;
      onUpload(filePath);
      
      const { data } = await supabase.storage.from('avatars').download(filePath);
      setAvatarUrl(URL.createObjectURL(data));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Character Portrait Frame - Playing Card Style */}
      <div 
        className="relative bg-[#1a1a1a] border-4 border-black rounded-lg overflow-hidden"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
        }}
      >
        {/* Tape effect - holding the photo */}
        <div 
          className="absolute -top-1 -right-1 w-10 h-6 bg-white/30 rotate-[35deg] z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover pixelated"
          />
        ) : (
          /* Isaac Silhouette Placeholder - "Curse of the Unknown" style */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]">
            <svg viewBox="0 0 64 64" className="w-3/4 h-3/4 opacity-40">
              {/* Simplified Isaac head shape */}
              <ellipse cx="32" cy="32" rx="24" ry="26" fill="#444" />
              {/* Eyes */}
              <ellipse cx="24" cy="30" rx="4" ry="5" fill="#222" />
              <ellipse cx="40" cy="30" rx="4" ry="5" fill="#222" />
              {/* Tear */}
              <ellipse cx="24" cy="38" rx="2" ry="3" fill="#5588cc" opacity="0.7" />
              {/* Mouth */}
              <ellipse cx="32" cy="42" rx="4" ry="2" fill="#222" />
              {/* Question mark */}
              <text x="32" y="56" textAnchor="middle" fill="#666" fontSize="10" fontFamily="monospace">?</text>
            </svg>
          </div>
        )}
        
        {/* Corner decorations - like a playing card */}
        <div className="absolute top-1 left-1 text-[8px] font-pixel text-white/30">♠</div>
        <div className="absolute top-1 right-1 text-[8px] font-pixel text-white/30">♠</div>
        <div className="absolute bottom-1 left-1 text-[8px] font-pixel text-white/30 rotate-180">♠</div>
        <div className="absolute bottom-1 right-1 text-[8px] font-pixel text-white/30 rotate-180">♠</div>
      </div>
      
      {/* Upload Button - Retro style */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white font-pixel text-sm border-2 border-black hover:bg-[#2a2a2a] transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
      >
        <FaUpload className="w-3 h-3" />
        {uploading ? t('account.uploading') : t('account.change')}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TBOI-STYLED INPUT (Cardboard/Paper Box Style)
// ═══════════════════════════════════════════════════════════════
function IsaacInput({ icon: Icon, label, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 font-heading text-sm uppercase tracking-wide text-black">
        {Icon && <Icon className="w-4 h-4 text-accent-blood" />}
        {label}
      </label>
      <input
        {...props}
        className={`
          w-full px-4 py-3 
          bg-[#EBE1CE] 
          border-2 border-black 
          font-handwriting text-lg text-black
          placeholder:text-black/40
          focus:outline-none focus:border-[#5a1b1b] focus:ring-0
          transition-colors
          shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]
          ${props.disabled ? 'opacity-60 cursor-not-allowed bg-[#d4cfc2]' : ''}
          ${error ? 'border-accent-blood' : ''}
        `}
      />
      {error && <p className="text-sm text-accent-blood font-handwriting">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TBOI-STYLED BUTTON (Game Menu Style)
// ═══════════════════════════════════════════════════════════════
function IsaacButton({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-[#1a1a1a] text-white hover:bg-accent-blood border-black',
    danger: 'bg-[#5a1b1b] text-white hover:bg-red-800 border-[#3a0a0a]',
    ghost: 'bg-transparent text-black hover:bg-black/10 border-black/50',
  };

  return (
    <button
      {...props}
      className={`
        px-6 py-3 
        font-pixel text-sm uppercase tracking-wider
        border-2 
        transition-all duration-150
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0
        flex items-center justify-center
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLAYER STATS PANEL (Gamification with TBOI icons) - IMPROVED GRID
// ═══════════════════════════════════════════════════════════════
function PlayerStats({ memberSince, buildsCount = 0, votesGiven = 0, savedBuilds = 0, t }) {
  const stats = [
    { icon: FaHeart, label: t('account.memberSince'), value: memberSince, color: 'text-red-500' },
    { icon: FaTrophy, label: t('account.builds'), value: buildsCount, color: 'text-yellow-500' },
    { icon: FaStar, label: t('account.votesGiven'), value: votesGiven, color: 'text-yellow-400' },
    { icon: FaBookmark, label: t('account.saved'), value: savedBuilds, color: 'text-blue-400' },
  ];

  return (
    <div className="bg-[#f4f1ea] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transform rotate-1">
      <h3 className="font-heading text-lg uppercase mb-4 pb-2 border-b-2 border-dashed border-black/40 flex items-center gap-2">
        <FaBomb className="text-black/60" />
        {t('account.playerStats')}
      </h3>
      {/* Grid layout for better alignment */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 items-center">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="contents">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="font-handwriting text-black/70">{label}</span>
            <span className="font-pixel text-sm text-black text-right tabular-nums">{value}</span>
          </div>
        ))}
      </div>
      
      {/* Doodle decoration */}
      <div className="mt-4 pt-3 border-t border-dashed border-black/20">
        <p className="font-handwriting text-xs text-black/40 italic text-center">
          "{t('account.statsQuote')}"
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB BUTTON (Notebook Tab Style) - FIXED VISIBILITY
// ═══════════════════════════════════════════════════════════════
function TabButton({ active, onClick, children, icon: Icon, variant = 'default' }) {
  // Prevent scroll on click
  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  };

  // Different styles for danger tab when inactive
  const inactiveStyles = variant === 'danger'
    ? 'bg-red-900/60 text-red-100 hover:bg-red-800/70 hover:text-white'
    : 'bg-stone-500 text-stone-100 hover:bg-stone-400 hover:text-white';

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`
        flex items-center gap-2 px-4 py-2 
        font-heading text-sm uppercase tracking-wide
        border-2 border-black border-b-0
        transition-all cursor-pointer
        ${active 
          ? 'bg-[#fdfbf7] text-black -mb-[2px] z-10 relative' 
          : inactiveStyles
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// ALERT MESSAGE
// ═══════════════════════════════════════════════════════════════
function Alert({ type, message }) {
  if (!message) return null;
  
  const styles = {
    error: 'bg-red-900/20 border-red-800 text-red-300',
    success: 'bg-green-900/20 border-green-800 text-green-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 border-2 font-handwriting text-sm ${styles[type]}`}
    >
      {message}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ACCOUNT PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Account() {
  const { user: _user, session, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Profile State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [profileMessage, setProfileMessage] = useState(null);
  const [memberSince, setMemberSince] = useState('');

  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // User Stats
  const [userStats, setUserStats] = useState({
    buildsCount: 0,
    votesGiven: 0,
    savedBuilds: 0,
  });

  // Initial Fetch
  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session || {};
      if (!user) return;

      const { data, error: _error } = await supabase
        .from('profiles')
        .select(`username, avatar_url, created_at`)
        .eq('id', user.id)
        .single();

      if (!ignore && data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url);
        if (data.created_at) {
          setMemberSince(new Date(data.created_at).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'short'
          }));
        }
      }
      setLoading(false);
    }

    getProfile();
    return () => { ignore = true; };
  }, [session]);

  // Fetch User Stats
  useEffect(() => {
    let ignore = false;
    async function getUserStats() {
      const { user } = session || {};
      if (!user) return;

      try {
        // Get builds count
        const { count: buildsCount } = await supabase
          .from('build_posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id);

        // Get votes given count
        const { count: votesGiven } = await supabase
          .from('build_votes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get saved builds count
        const { count: savedBuilds } = await supabase
          .from('build_saves')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!ignore) {
          setUserStats({
            buildsCount: buildsCount || 0,
            votesGiven: votesGiven || 0,
            savedBuilds: savedBuilds || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    }

    getUserStats();
    return () => { ignore = true; };
  }, [session]);

  // Handle Profile Update
  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    setProfileMessage(null);
    
    const { user } = session;
    const updates = {
      id: user.id,
      username,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      setProfileMessage({ type: 'error', text: error.message });
    } else {
      setProfileMessage({ type: 'success', text: t('account.profileUpdated') });
    }
    setLoading(false);
  }

  // Handle Avatar Upload
  const handleAvatarUpload = (filePath) => {
    setAvatarUrl(filePath);
  };

  // Handle Password Update
  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setSecurityMessage(null);

    if (password !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: t('account.passwordsNotMatch') });
      return;
    }

    if (password.length < 6) {
      setSecurityMessage({ type: 'error', text: t('account.passwordTooShort') });
      return;
    }

    const { error } = await updatePassword(password);
    if (error) {
      setSecurityMessage({ type: 'error', text: error.message });
    } else {
      setSecurityMessage({ type: 'success', text: t('account.passwordUpdated') });
      setPassword('');
      setConfirmPassword('');
    }
  }

  // Handle Account Deletion
  async function handleDeleteAccount() {
    if (!window.confirm(t('account.deleteConfirmation'))) {
      return;
    }

    const { error } = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    }).then(res => res.json());

    if (error) {
      alert(t('account.deleteError') + ': ' + error);
    } else {
      await signOut();
      navigate('/');
    }
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #3a3632 0%, #2a2725 50%, #1a1918 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* ═══ PAGE HEADER - Sketchy Style ═══ */}
        <header className="mb-8 border-b-4 border-dashed border-stone-600 pb-4">
          <h1 className="text-4xl md:text-5xl font-heading uppercase tracking-tight text-stone-200 flex items-center gap-3">
            <FaUser className="text-accent-blood" />
            {t('account.title')}
          </h1>
          <p className="font-handwriting text-xl text-stone-400 mt-2 transform -rotate-1">
            {t('account.subtitle')}
          </p>
        </header>

        {/* ═══ TABS ═══ */}
        <div className="flex gap-1 mb-0 relative z-10">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={FaUser}
          >
            {t('account.profile')}
          </TabButton>
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={FaKey}
          >
            {t('account.security')}
          </TabButton>
          <TabButton 
            active={activeTab === 'danger'} 
            onClick={() => setActiveTab('danger')}
            icon={FaSkull}
            variant="danger"
          >
            {t('account.danger')}
          </TabButton>
        </div>

        {/* ═══ TAB CONTENT CONTAINER - Paper Style ═══ */}
        <div className="bg-[#fdfbf7] border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] relative">
          
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
          
          {/* ─── PROFILE TAB ─── */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left: Avatar + Stats */}
                <div className="flex flex-col gap-6 items-center lg:items-start">
                  <IsaacAvatar
                    url={avatarUrl}
                    size={140}
                    onUpload={handleAvatarUpload}
                    uploading={uploading}
                    t={t}
                  />
                  
                  {/* Stats Panel - Desktop only */}
                  <div className="hidden lg:block w-full">
                    <PlayerStats 
                      memberSince={memberSince || '???'}
                      buildsCount={userStats.buildsCount}
                      votesGiven={userStats.votesGiven}
                      savedBuilds={userStats.savedBuilds}
                      t={t}
                    />
                  </div>
                </div>

                {/* Right: Form */}
                <form onSubmit={updateProfile} className="flex-1 space-y-6">
                  <IsaacInput
                    icon={FaEnvelope}
                    label={t('account.emailLabel')}
                    type="email"
                    value={session?.user.email || ''}
                    disabled
                  />
                  <p className="text-xs font-handwriting text-black/50 -mt-4 ml-6">
                    {t('account.emailCannotChange')}
                  </p>
                  
                  <IsaacInput
                    icon={FaUser}
                    label={t('account.usernameLabel')}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('account.usernamePlaceholder')}
                  />

                  <Alert type={profileMessage?.type} message={profileMessage?.text} />

                  <IsaacButton type="submit" disabled={loading}>
                    {loading ? t('account.saving') : t('account.saveChanges')}
                  </IsaacButton>
                </form>
              </div>
              
              {/* Stats Panel - Mobile */}
              <div className="lg:hidden mt-8">
                <PlayerStats 
                  memberSince={memberSince || '???'}
                  buildsCount={userStats.buildsCount}
                  votesGiven={userStats.votesGiven}
                  savedBuilds={userStats.savedBuilds}
                  t={t}
                />
              </div>
            </motion.div>
          )}

          {/* ─── SECURITY TAB ─── */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10 max-w-md"
            >
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-dashed border-black/30">
                <FaKey className="w-6 h-6 text-accent-blood" />
                <h2 className="font-heading text-xl uppercase">{t('account.changePassword')}</h2>
              </div>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <IsaacInput
                  icon={FaKey}
                  label={t('account.newPassword')}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                
                <IsaacInput
                  icon={FaKey}
                  label={t('account.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Alert type={securityMessage?.type} message={securityMessage?.text} />

                <IsaacButton type="submit" disabled={loading}>
                  {t('account.updatePassword')}
                </IsaacButton>
              </form>
            </motion.div>
          )}

          {/* ─── DANGER ZONE TAB ─── */}
          {activeTab === 'danger' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-10"
            >
              {/* Warning Banner */}
              <div className="bg-red-900/20 border-2 border-red-800 p-4 mb-6 flex items-start gap-3">
                <FaExclamationTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg text-red-400 uppercase">{t('account.dangerZone')}</h3>
                  <p className="font-handwriting text-red-300/80 mt-1">
                    {t('account.dangerZoneDescription')}
                  </p>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="bg-[#2a1a1a] border-2 border-red-900/50 p-6 transform -rotate-[0.5deg]">
                <div className="flex items-center gap-3 mb-4">
                  <FaSkull className="w-6 h-6 text-red-500" />
                  <h3 className="font-heading text-lg text-red-400 uppercase">{t('account.deleteAccount')}</h3>
                </div>
                
                <p className="font-handwriting text-gray-400 mb-4 leading-relaxed">
                  {t('account.deleteDescription')} <span className="text-red-400 font-bold">{t('account.deleteWarning')}</span>. 
                  {t('account.deleteWillRemove')}
                </p>
                
                <ul className="font-pixel text-sm text-gray-500 space-y-1 mb-6 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span> {t('account.deleteProfileAvatar')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span> {t('account.deleteAllBuilds')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span> {t('account.deleteFavoritesVotes')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-500">×</span> {t('account.deleteAllComments')}
                  </li>
                </ul>

                <IsaacButton 
                  variant="danger"
                  onClick={handleDeleteAccount}
                >
                  <FaSkull className="w-4 h-4 mr-2" />
                  {t('account.deleteAccountButton')}
                </IsaacButton>
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══ BOTTOM DECORATION - Hand drawn doodles ═══ */}
        <div className="mt-8 flex justify-center opacity-30">
          <svg viewBox="0 0 200 40" className="w-48 h-10">
            {/* Sketchy line */}
            <path 
              d="M 10 20 Q 30 15, 50 20 T 90 20 T 130 20 T 170 20 T 190 20" 
              stroke="#a8a29e" 
              strokeWidth="2" 
              fill="none"
              strokeLinecap="round"
            />
            {/* Small hearts/items doodles */}
            <text x="100" y="35" textAnchor="middle" fontSize="12" fill="#a8a29e">♥ ♦ ♠ ♣</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
