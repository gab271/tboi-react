/**
 * BuildCard Component
 * Displays a single build in the feed
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowUp, 
  FaBookmark, 
  FaRegBookmark,
  FaComment,
  FaSeedling,
  FaGamepad,
  FaClock,
  FaUser
} from 'react-icons/fa';
import { cn } from '../../../lib/utils';
import { 
  getBuildTypeInfo, 
  getDifficultyLabel, 
  getCharacterBySlug 
} from '../constants';

// Format relative time
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

export function BuildCard({ 
  build, 
  index = 0,
  onVote,
  onSave,
  onLoginRequired,
  isAuthenticated = false,
  isVoting = false,
  isSaving = false,
}) {
  const [imageError, setImageError] = useState(false);
  
  const buildType = getBuildTypeInfo(build.build_type);
  const character = getCharacterBySlug(build.character_slug);
  const tags = build.tags || [];
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-bg-paper border-2 border-text-ink rounded-sm overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.15)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
    >
      {/* Top Section: Thumbnail & Info */}
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-bg-paper-dark relative overflow-hidden">
          {build.thumbnail_url && !imageError ? (
            <img
              src={build.thumbnail_url}
              alt={build.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">
              {buildType.icon}
            </div>
          )}
          
          {/* Build Type Badge */}
          <div className={cn(
            "absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-pixel uppercase rounded-sm",
            "bg-black/80 text-white"
          )}>
            {buildType.icon} {buildType.label}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 min-w-0">
          {/* Title */}
          <Link 
            to={`/builds/${build.id}`}
            className="block group/title"
          >
            <h3 className="font-heading text-sm sm:text-base text-text-heading leading-tight line-clamp-2 group-hover/title:text-accent-blood transition-colors">
              {build.title}
            </h3>
          </Link>
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-text-dim font-handwriting">
            {/* Author */}
            <span className="flex items-center gap-1">
              <FaUser className="w-3 h-3" />
              {build.author_username || 'Anonymous'}
            </span>
            
            {/* Character */}
            {character && (
              <span className="flex items-center gap-1">
                <FaGamepad className="w-3 h-3" />
                {character.name}
              </span>
            )}
            
            {/* Difficulty */}
            <span className="text-text-dim">
              {getDifficultyLabel(build.difficulty)}
            </span>
            
            {/* Time */}
            <span className="flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              {formatRelativeTime(build.created_at)}
            </span>
          </div>

          {/* Description preview */}
          <p className="mt-2 text-xs text-text-dim line-clamp-2 font-handwriting leading-relaxed">
            {build.description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] font-pixel uppercase bg-bg-paper-dark text-text-dim rounded-sm"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="px-1.5 py-0.5 text-[10px] font-pixel text-text-dim">
                  +{tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-t-2 border-dashed border-text-ink/20 bg-bg-paper-dark/50">
        {/* Vote Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              onLoginRequired?.();
              return;
            }
            onVote?.(build.id);
          }}
          disabled={isVoting}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-sm transition-all font-pixel text-sm",
            build.user_voted 
              ? "bg-accent-blood text-white" 
              : "bg-bg-paper border border-text-ink/30 text-text-dim hover:text-accent-blood hover:border-accent-blood",
            !isAuthenticated && "cursor-pointer"
          )}
          title={isAuthenticated ? (build.user_voted ? 'Remove vote' : 'Upvote') : 'Login to vote'}
        >
          <FaArrowUp className={cn("w-3 h-3", build.user_voted && "fill-current")} />
          <span>{build.score || 0}</span>
        </button>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-text-dim font-handwriting">
          <span className="flex items-center gap-1">
            <FaComment className="w-3 h-3" />
            {build.comments_count || 0}
          </span>
          
          {build.seed && (
            <span className="flex items-center gap-1 font-pixel text-[10px]">
              <FaSeedling className="w-3 h-3" />
              {build.seed}
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              onLoginRequired?.();
              return;
            }
            onSave?.(build.id);
          }}
          disabled={isSaving}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-sm transition-all font-pixel text-sm",
            build.user_saved
              ? "text-accent-gold"
              : "text-text-dim hover:text-accent-gold",
            !isAuthenticated && "cursor-pointer"
          )}
          title={isAuthenticated ? (build.user_saved ? 'Unsave' : 'Save') : 'Login to save'}
        >
          {build.user_saved ? (
            <FaBookmark className="w-3.5 h-3.5" />
          ) : (
            <FaRegBookmark className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{build.saves_count || 0}</span>
        </button>
      </div>

      {/* Hover effect - tape */}
      <div className="absolute -top-2 right-4 w-8 h-6 bg-[#e8e4d9] opacity-0 group-hover:opacity-90 rotate-12 transition-opacity pointer-events-none border border-black/10" />
    </motion.article>
  );
}

export default BuildCard;
