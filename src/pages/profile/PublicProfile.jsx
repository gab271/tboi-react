/**
 * PublicProfile Component
 * Displays a user's public profile with their stats and builds
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaStar,
  FaBookmark,
  FaTrophy,
  FaCalendarAlt,
  FaArrowLeft,
  FaUser
} from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import { NightmareLoading } from '../../components/ui/NightmareLoading';
import { BuildCard } from '../../features/builds/components/BuildCard';

// Avatar component for profile
function ProfileAvatar({ url, username, size = 120 }) {
  const [avatarUrl, setAvatarUrl] = useState(null);

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

  return (
    <div 
      className="relative bg-[#1a1a1a] border-4 border-black rounded-lg overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username || 'User avatar'}
          className="w-full h-full object-cover pixelated"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]">
          <FaUser className="w-1/2 h-1/2 text-gray-600" />
        </div>
      )}
      
      {/* Corner decorations */}
      <div className="absolute top-1 left-1 text-[8px] font-pixel text-white/30">♠</div>
      <div className="absolute top-1 right-1 text-[8px] font-pixel text-white/30">♠</div>
      <div className="absolute bottom-1 left-1 text-[8px] font-pixel text-white/30 rotate-180">♠</div>
      <div className="absolute bottom-1 right-1 text-[8px] font-pixel text-white/30 rotate-180">♠</div>
    </div>
  );
}

// Stat card component
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#f4f1ea] border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] flex items-center gap-3">
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <p className="font-pixel text-xl text-black">{value}</p>
        <p className="font-handwriting text-sm text-black/60">{label}</p>
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    buildsCount: 0,
    votesGiven: 0,
    savedBuilds: 0,
    totalScore: 0,
  });
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, created_at')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        if (!profileData) throw new Error('User not found');

        setProfile(profileData);

        // Fetch user's builds
        const { data: buildsData, error: buildsError } = await supabase
          .from('build_posts')
          .select('*')
          .eq('author_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!buildsError && buildsData) {
          // Get tags for builds
          const postIds = buildsData.map(b => b.id);
          const { data: allTags } = await supabase
            .from('build_post_tags')
            .select('post_id, tag')
            .in('post_id', postIds);

          const tagsMap = new Map();
          (allTags || []).forEach(t => {
            if (!tagsMap.has(t.post_id)) {
              tagsMap.set(t.post_id, []);
            }
            tagsMap.get(t.post_id).push(t.tag);
          });

          const buildsWithTags = buildsData.map(build => ({
            ...build,
            tags: tagsMap.get(build.id) || [],
            author: profileData,
          }));

          setBuilds(buildsWithTags);
        }

        // Calculate stats
        const buildsCount = buildsData?.length || 0;
        const totalScore = buildsData?.reduce((acc, b) => acc + (b.score || 0), 0) || 0;

        // Count votes given by user
        const { count: votesCount } = await supabase
          .from('build_votes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        // Count saved builds
        const { count: savesCount } = await supabase
          .from('build_saves')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        setStats({
          buildsCount,
          votesGiven: votesCount || 0,
          savedBuilds: savesCount || 0,
          totalScore,
        });

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return <NightmareLoading />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-floor">
        <div className="bg-[#fdfbf7] border-2 border-black p-8 shadow-[6px_6px_0_rgba(0,0,0,0.5)] text-center">
          <h2 className="font-heading text-2xl text-black mb-4">User Not Found</h2>
          <p className="font-handwriting text-black/70 mb-6">
            {error || "This user doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate('/builds')}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#1a1a1a] text-white font-pixel text-sm border-2 border-black hover:bg-accent-blood transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <FaArrowLeft /> Back to Builds
          </button>
        </div>
      </div>
    );
  }

  const memberSince = profile.created_at 
    ? new Date(profile.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #3a3632 0%, #2a2725 50%, #1a1918 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-stone-400 hover:text-white font-handwriting text-lg transition-colors"
        >
          <FaArrowLeft /> Volver
        </button>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#fdfbf7] border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <ProfileAvatar 
              url={profile.avatar_url} 
              username={profile.username}
              size={140}
            />

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-heading uppercase tracking-tight text-black">
                {profile.username || 'Anonymous'}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-black/60">
                <FaCalendarAlt className="w-4 h-4" />
                <span className="font-handwriting">Miembro desde {memberSince}</span>
              </div>

              {/* Reputation Badge */}
              {stats.totalScore > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border-2 border-yellow-600 text-yellow-800">
                  <FaStar className="w-4 h-4" />
                  <span className="font-pixel text-sm">{stats.totalScore} puntos totales</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <StatCard 
              icon={FaTrophy} 
              label="Builds creadas" 
              value={stats.buildsCount} 
              color="text-yellow-500"
            />
            <StatCard 
              icon={FaHeart} 
              label="Votos dados" 
              value={stats.votesGiven} 
              color="text-red-500"
            />
            <StatCard 
              icon={FaBookmark} 
              label="Builds guardadas" 
              value={stats.savedBuilds} 
              color="text-blue-500"
            />
            <StatCard 
              icon={FaStar} 
              label="Puntuación total" 
              value={stats.totalScore} 
              color="text-yellow-400"
            />
          </div>
        </motion.div>

        {/* User's Builds Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-heading uppercase text-stone-200 mb-4 border-b-2 border-dashed border-stone-600 pb-2">
            Builds de {profile.username || 'este usuario'}
          </h2>

          {builds.length === 0 ? (
            <div className="bg-[#fdfbf7] border-2 border-black p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
              <p className="font-handwriting text-xl text-black/60">
                Este usuario aún no ha compartido ninguna build.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {builds.map((build) => (
                <Link key={build.id} to={`/builds/${build.id}`}>
                  <div className="bg-[#fdfbf7] border-2 border-black p-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg text-black uppercase">{build.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-accent-blood text-white text-xs font-pixel">
                            {build.build_type}
                          </span>
                          <span className="px-2 py-0.5 bg-stone-200 text-black text-xs font-pixel">
                            {build.character_slug}
                          </span>
                          {build.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-stone-100 text-black/70 text-xs font-pixel">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-black/60">
                        <span className="flex items-center gap-1 font-pixel text-sm">
                          <FaStar className="text-yellow-500" /> {build.score || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
