/**
 * BuildDetailPage Component
 * Full view of a single build
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowUp, 
  FaBookmark, 
  FaRegBookmark,
  FaShare,
  FaFlag,
  FaTrash,
  FaEdit,
  FaSeedling,
  FaClock,
  FaUser,
  FaArrowLeft,
  FaBan,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { NightmareLoading } from '../../../components/ui/NightmareLoading';
import { useAuth } from '../../../hooks/useAuth';
import { 
  useBuildDetail, 
  useBuildTags, 
  useBuildItems, 
  useBuildMedia,
  useBuildComments,
  useToggleVote,
  useToggleSave,
  useDeleteBuild,
} from '../hooks';
import { 
  getBuildTypeInfo, 
  getDifficultyLabel, 
  getGameVersionLabel,
  getCharacterBySlug 
} from '../constants';
import { cn } from '../../../lib/utils';
import { CommentsList } from './CommentsList';
import { LoginRequiredModal } from './LoginRequiredModal';
import { ReportModal } from './ReportModal';
import { MediaGallery } from './MediaGallery';

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function BuildDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Queries
  const { data: build, isLoading, isError } = useBuildDetail(id);
  const { data: tags = [] } = useBuildTags(id);
  const { data: items = [] } = useBuildItems(id);
  const { data: media = [] } = useBuildMedia(id);
  const { data: comments = [] } = useBuildComments(id);

  // Mutations
  const voteMutation = useToggleVote();
  const saveMutation = useToggleSave();
  const deleteMutation = useDeleteBuild();

  // Loading
  if (isLoading) {
    return <NightmareLoading />;
  }

  // Error or not found
  if (isError || !build) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-4xl font-heading font-bold text-text-heading mb-4">
          Build Not Found
        </h2>
        <p className="text-text-dim mb-8 font-handwriting text-2xl">
          This build may have been deleted or hidden.
        </p>
        <Button onClick={() => navigate('/builds')}>
          <FaArrowLeft className="mr-2" /> Back to Builds
        </Button>
      </div>
    );
  }

  const buildType = getBuildTypeInfo(build.build_type);
  const character = getCharacterBySlug(build.character_slug);
  const isAuthor = user?.id === build.author_id;

  const handleVote = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    voteMutation.mutate({ postId: build.id, value: 1 });
  };

  const handleSave = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    saveMutation.mutate(build.id);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: build.title,
        text: build.description?.slice(0, 100),
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      // Could show a toast notification here
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(build.id);
    navigate('/builds');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg-paper text-text-ink pb-20"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-sm font-handwriting text-text-dim mb-8 text-lg">
          <Link to="/" className="hover:text-accent-blood transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/builds" className="hover:text-accent-blood transition-colors">{t('nav.builds')}</Link>
          <span>/</span>
          <span className="text-text-heading font-bold truncate max-w-[200px]">{build.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Header */}
            <header className="mb-8">
              {/* Build Type Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "px-3 py-1 font-pixel text-xs uppercase rounded-sm",
                  "bg-text-heading text-white"
                )}>
                  {buildType.icon} {buildType.label}
                </span>
                <span className="px-2 py-1 font-pixel text-xs text-text-dim border border-text-ink/30 rounded-sm">
                  {getDifficultyLabel(build.difficulty)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-heading text-text-heading leading-tight mb-4">
                {build.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-text-dim font-handwriting">
                <Link 
                  to={`/profile/${build.author_id}`}
                  className="flex items-center gap-2 hover:text-accent-blood transition-colors"
                >
                  <FaUser className="w-4 h-4" />
                  {build.author?.username || 'Anonymous'}
                </Link>
                <span className="flex items-center gap-2">
                  <FaClock className="w-4 h-4" />
                  {formatDate(build.created_at)}
                </span>
                {character && (
                  <span className="font-pixel text-sm">
                    {character.name}
                  </span>
                )}
                <span className="font-pixel text-xs text-text-dim/70">
                  {getGameVersionLabel(build.game_version)}
                </span>
              </div>

              {/* Seed */}
              {build.seed && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-bg-paper-dark border border-text-ink/30 rounded-sm">
                  <FaSeedling className="w-4 h-4 text-green-600" />
                  <span className="font-pixel text-sm">Seed: {build.seed}</span>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-pixel uppercase bg-bg-paper-dark text-text-dim rounded-sm border border-text-ink/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Media Gallery */}
            {media.length > 0 && (
              <section className="mb-8">
                <MediaGallery media={media} />
              </section>
            )}

            {/* Description */}
            <section className="mb-8">
              <h2 className="font-heading text-xl text-text-heading mb-3 border-b-2 border-dashed border-text-ink/30 pb-2">
                DESCRIPTION
              </h2>
              <div className="prose prose-lg max-w-none font-handwriting text-text-ink whitespace-pre-wrap">
                {build.description}
              </div>
            </section>

            {/* How to Execute */}
            <section className="mb-8">
              <h2 className="font-heading text-xl text-text-heading mb-3 border-b-2 border-dashed border-text-ink/30 pb-2">
                HOW TO EXECUTE
              </h2>
              <div className="prose prose-lg max-w-none font-handwriting text-text-ink whitespace-pre-wrap bg-bg-paper-dark/50 p-4 border-l-4 border-accent-gold">
                {build.how_to_execute}
              </div>
            </section>

            {/* Notes */}
            {build.notes && (
              <section className="mb-8">
                <h2 className="font-heading text-xl text-text-heading mb-3 border-b-2 border-dashed border-text-ink/30 pb-2">
                  NOTES
                </h2>
                <div className="prose prose-lg max-w-none font-handwriting text-text-dim italic whitespace-pre-wrap">
                  {build.notes}
                </div>
              </section>
            )}

            {/* Items Section */}
            {items.length > 0 && (
              <section className="mb-8">
                <h2 className="font-heading text-xl text-text-heading mb-3 border-b-2 border-dashed border-text-ink/30 pb-2">
                  ITEMS ({items.length})
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {items.map((buildItem) => (
                    <Link
                      key={buildItem.id}
                      to={buildItem.item?.slug ? `/items/${buildItem.item.slug}` : '#'}
                      className={cn(
                        "group relative aspect-square bg-[#1a1a1a] border-2 border-[#404040] flex items-center justify-center overflow-hidden",
                        "hover:border-white hover:z-10 transition-all",
                        buildItem.is_essential && "ring-2 ring-accent-gold"
                      )}
                      title={buildItem.item?.name || 'Unknown Item'}
                    >
                      {buildItem.item?.sprite_url ? (
                        <img
                          src={buildItem.item.sprite_url}
                          alt={buildItem.item.name}
                          className="w-full h-full object-contain p-1 pixelated"
                        />
                      ) : (
                        <span className="text-2xl">❓</span>
                      )}
                      
                      {/* Essential indicator */}
                      {buildItem.is_essential && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-accent-gold" title={t('builds.essential')} />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/90 p-1 translate-y-full group-hover:translate-y-0 transition-transform">
                        <span className="text-[10px] font-pixel text-white text-center block truncate">
                          {buildItem.item?.name || 'Unknown'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Comments Section */}
            <section className="mt-12">
              <h2 className="font-heading text-xl text-text-heading mb-4 border-b-2 border-dashed border-text-ink/30 pb-2">
                COMMENTS ({build.comments_count || 0})
              </h2>
              <CommentsList
                postId={build.id}
                comments={comments}
                onLoginRequired={() => setShowLoginModal(true)}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              
              {/* Actions Card */}
              <div className="bg-bg-paper border-2 border-text-ink p-4 shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-4">
                  {/* Vote */}
                  <button
                    onClick={handleVote}
                    disabled={voteMutation.isPending}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 font-pixel text-lg border-2 transition-all",
                      build.user_voted
                        ? "bg-accent-blood text-white border-accent-blood"
                        : "bg-bg-paper border-text-ink hover:border-accent-blood hover:text-accent-blood"
                    )}
                  >
                    <FaArrowUp className={build.user_voted ? "fill-current" : ""} />
                    <span className="font-bold">{build.score || 0}</span>
                  </button>

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 font-pixel border-2 transition-all",
                      build.user_saved
                        ? "text-accent-gold border-accent-gold"
                        : "border-text-ink/40 hover:border-accent-gold hover:text-accent-gold"
                    )}
                  >
                    {build.user_saved ? <FaBookmark /> : <FaRegBookmark />}
                    <span>{build.saves_count || 0}</span>
                  </button>
                </div>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 py-2 font-pixel text-sm border-2 border-text-ink/40 hover:border-text-ink transition-all mb-2"
                >
                  <FaShare /> Share
                </button>

                {/* Author Actions */}
                {isAuthor && (
                  <div className="pt-4 mt-4 border-t border-text-ink/20 space-y-2">
                    <Button
                      onClick={() => navigate(`/builds/${build.id}/edit`)}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      <FaEdit className="mr-2" /> Edit Build
                    </Button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 font-pixel text-sm text-accent-blood border-2 border-accent-blood/40 hover:border-accent-blood transition-all"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}

                {/* Report (non-author) */}
                {!isAuthor && user && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 font-pixel text-xs text-text-dim hover:text-accent-blood transition-all mt-2"
                  >
                    <FaFlag /> Report
                  </button>
                )}
              </div>

              {/* Author Info */}
              <div className="bg-bg-paper border-2 border-text-ink/40 p-4">
                <h3 className="font-heading text-sm text-text-dim mb-3">{t('builds.postedBy')}</h3>
                <Link 
                  to={`/profile/${build.author_id}`}
                  className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                >
                  {build.author?.avatar_url ? (
                    <img
                      src={build.author.avatar_url}
                      alt={build.author?.username || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-bg-paper-dark flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-text-dim" />
                    </div>
                  )}
                  <div>
                    <p className="font-pixel text-sm text-text-heading group-hover:text-accent-blood transition-colors">
                      {build.author?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-text-dim font-handwriting">Ver perfil →</p>
                  </div>
                </Link>
                
                {!isAuthor && user && (
                  <button
                    onClick={() => {/* block user */}}
                    className="mt-3 flex items-center gap-1 text-xs text-text-dim hover:text-accent-blood transition-colors"
                  >
                    <FaBan className="w-3 h-3" /> Block User
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={build.id}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-bg-paper border-2 border-text-ink p-6 shadow-[6px_6px_0_rgba(0,0,0,0.2)] max-w-md w-full">
            <h3 className="font-heading text-xl text-text-heading mb-4">
              DELETE BUILD?
            </h3>
            <p className="font-handwriting text-lg text-text-dim mb-6">
              This action cannot be undone. Your build and all its comments will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 px-4 font-pixel text-sm bg-accent-blood text-white border-2 border-accent-blood hover:bg-accent-blood/90 transition-all"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default BuildDetailPage;
