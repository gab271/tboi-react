/**
 * BuildsPage Component
 * Main feed page for community builds
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaFilter, 
  FaTimes,
  FaSpinner 
} from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { NightmareLoading } from '../../../components/ui/NightmareLoading';
import { useAuth } from '../../../hooks/useAuth';
import { useBuildsFeed, useToggleVote, useToggleSave } from '../hooks';
import { BuildCard } from './BuildCard';
import { BuildFilters } from './BuildFilters';
import { LoginRequiredModal } from './LoginRequiredModal';

export function BuildsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // State
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'new',
    character: null,
    gameVersion: null,
    difficulty: null,
    buildType: null,
    tags: [],
    search: '',
  });
  
  // Debounced search filter
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const isFirstLoad = useRef(true);
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Queries - use debounced filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
  } = useBuildsFeed(debouncedFilters);
  
  // Track first load
  useEffect(() => {
    if (!isLoading && isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [isLoading]);

  // Mutations
  const voteMutation = useToggleVote();
  const saveMutation = useToggleSave();

  // Flatten pages into single array
  const builds = data?.pages?.flat() || [];

  // Handlers
  const handleLoginRequired = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleVote = useCallback((postId) => {
    voteMutation.mutate({ postId, value: 1 });
  }, [voteMutation]);

  const handleSave = useCallback((postId) => {
    saveMutation.mutate(postId);
  }, [saveMutation]);

  const handleCreateClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate('/builds/new');
  };

  // Loading state - only show full loading on first load
  if (isLoading && isFirstLoad.current) {
    return <NightmareLoading />;
  }

  return (
    <div className="min-h-full bg-transparent text-text-ink p-4 md:p-0">
      
      {/* Header Section */}
      <section className="relative pt-4 pb-8 md:pt-6 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 border-b-4 border-black border-dashed pb-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading tracking-tighter text-black drop-shadow-sm leading-none">
              COMMUNITY BUILDS
            </h1>
            <p className="font-handwriting text-xl text-text-dim mt-2">
              {t('builds.communityShared')}
            </p>
          </div>
          
          {/* Create Build Button */}
          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2 font-pixel text-sm bg-accent-blood text-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all px-4 py-3"
          >
            <FaPlus /> SHARE BUILD
          </Button>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-4">
            <BuildFilters 
              filters={filters} 
              onFiltersChange={setFilters}
            />
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <Button 
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 font-handwriting font-bold text-xl border-2 border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <FaFilter /> Filters
          </Button>
          
          {/* Active filter count badge */}
          {(filters.character || filters.buildType || filters.difficulty || filters.tags?.length > 0) && (
            <span className="ml-2 px-2 py-1 bg-accent-blood text-white text-xs font-pixel rounded-full">
              {[
                filters.character,
                filters.buildType,
                filters.difficulty,
                ...(filters.tags || [])
              ].filter(Boolean).length}
            </span>
          )}
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setShowMobileFilters(false)} 
              />
              
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 20 }}
                className="relative w-80 h-full overflow-y-auto"
              >
                <BuildFilters 
                  filters={filters} 
                  onFiltersChange={setFilters}
                  onClose={() => setShowMobileFilters(false)}
                  className="h-full min-h-screen"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          
          {/* Filtering indicator */}
          {isFetching && !isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-4 text-text-dim">
              <FaSpinner className="animate-spin" />
              <span className="font-handwriting">Filtering...</span>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="font-handwriting text-2xl text-accent-blood mb-4">
                Something went wrong loading builds
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isFetching && !isError && builds.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="font-heading text-2xl text-text-heading mb-2">
                No builds found
              </h2>
              <p className="font-handwriting text-xl text-text-dim mb-6">
                {filters.search || filters.character || filters.buildType 
                  ? "Try adjusting your filters"
                  : "Be the first to share a build!"}
              </p>
              <Button onClick={handleCreateClick}>
                <FaPlus className="mr-2" /> Share Your Build
              </Button>
            </div>
          )}

          {/* Builds Grid */}
          {builds.length > 0 && (
            <div className="space-y-4">
              {builds.map((build, index) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  index={index}
                  onVote={handleVote}
                  onSave={handleSave}
                  onLoginRequired={handleLoginRequired}
                  isAuthenticated={!!user}
                  isVoting={voteMutation.isPending}
                  isSaving={saveMutation.isPending}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 font-pixel border-2 border-text-ink bg-bg-paper hover:bg-bg-paper-dark transition-all px-6 py-3"
              >
                {isFetchingNextPage ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Builds'
                )}
              </Button>
            </div>
          )}

          {/* End of feed message */}
          {!hasNextPage && builds.length > 0 && (
            <div className="text-center py-8">
              <p className="font-handwriting text-lg text-text-dim">
                You've reached the end! ✨
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default BuildsPage;
