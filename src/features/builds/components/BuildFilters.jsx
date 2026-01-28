/**
 * BuildFilters Component
 * Sidebar filters for the builds feed
 */
import { useState } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { cn } from '../../../lib/utils';
import { 
  GAME_VERSIONS, 
  DIFFICULTIES, 
  BUILD_TYPES, 
  CHARACTERS,
  SORT_OPTIONS,
  SUGGESTED_TAGS 
} from '../constants';

export function BuildFilters({ 
  filters, 
  onFiltersChange,
  onClose,
  className 
}) {
  const [tagInput, setTagInput] = useState('');
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  
  const displayedCharacters = showAllCharacters 
    ? CHARACTERS 
    : CHARACTERS.slice(0, 10);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleTagAdd = (tag) => {
    const currentTags = filters.tags || [];
    if (!currentTags.includes(tag) && currentTags.length < 8) {
      handleFilterChange('tags', [...currentTags, tag]);
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove) => {
    const currentTags = filters.tags || [];
    handleFilterChange('tags', currentTags.filter(t => t !== tagToRemove));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sort: 'new',
      character: null,
      gameVersion: null,
      difficulty: null,
      buildType: null,
      tags: [],
      search: '',
    });
  };

  const hasActiveFilters = 
    filters.character || 
    filters.gameVersion || 
    filters.difficulty || 
    filters.buildType ||
    (filters.tags && filters.tags.length > 0) ||
    filters.search;

  return (
    <div className={cn(
      "bg-bg-paper border-2 border-text-ink p-4 shadow-[5px_5px_0_rgba(0,0,0,0.1)]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-dashed border-text-ink/30">
        <h2 className="font-heading text-lg text-text-heading">FILTERS</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:text-accent-blood"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Sort By
        </label>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange('sort', option.value)}
              className={cn(
                "flex-1 py-2 px-3 text-center font-pixel text-sm border-2 transition-all",
                filters.sort === option.value
                  ? "bg-text-heading text-white border-text-heading"
                  : "bg-bg-paper border-text-ink/40 hover:border-text-ink"
              )}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Search
        </label>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim w-4 h-4" />
          <input
            type="text"
            placeholder="Search builds..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood"
          />
        </div>
      </div>

      {/* Build Type */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Build Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUILD_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleFilterChange('buildType', 
                filters.buildType === type.value ? null : type.value
              )}
              className={cn(
                "py-2 px-3 text-left font-pixel text-xs border-2 transition-all flex items-center gap-2",
                filters.buildType === type.value
                  ? "bg-text-heading text-white border-text-heading"
                  : "bg-bg-paper border-text-ink/40 hover:border-text-ink"
              )}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Difficulty
        </label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => handleFilterChange('difficulty',
                filters.difficulty === diff.value ? null : diff.value
              )}
              className={cn(
                "py-1.5 px-3 font-pixel text-xs border-2 transition-all",
                filters.difficulty === diff.value
                  ? "bg-text-heading text-white border-text-heading"
                  : "bg-bg-paper border-text-ink/40 hover:border-text-ink"
              )}
            >
              {diff.icon} {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Game Version */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Game Version
        </label>
        <select
          value={filters.gameVersion || ''}
          onChange={(e) => handleFilterChange('gameVersion', e.target.value || null)}
          className="w-full py-2 px-3 bg-bg-paper-dark border-2 border-text-ink/40 font-pixel text-sm focus:outline-none focus:border-accent-blood"
        >
          <option value="">All Versions</option>
          {GAME_VERSIONS.map((ver) => (
            <option key={ver.value} value={ver.value}>
              {ver.label}
            </option>
          ))}
        </select>
      </div>

      {/* Character */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Character
        </label>
        <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
          {displayedCharacters.map((char) => (
            <button
              key={char.slug}
              onClick={() => handleFilterChange('character',
                filters.character === char.slug ? null : char.slug
              )}
              className={cn(
                "w-full py-1.5 px-3 text-left font-pixel text-xs border-2 transition-all",
                filters.character === char.slug
                  ? "bg-text-heading text-white border-text-heading"
                  : "bg-bg-paper border-text-ink/20 hover:border-text-ink/60",
                char.tainted && "italic"
              )}
            >
              {char.name}
            </button>
          ))}
        </div>
        {!showAllCharacters && CHARACTERS.length > 10 && (
          <button
            onClick={() => setShowAllCharacters(true)}
            className="mt-2 text-sm font-handwriting text-accent-blood hover:underline"
          >
            Show all {CHARACTERS.length} characters...
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block font-handwriting text-lg font-bold text-text-dim mb-2">
          Tags
        </label>
        
        {/* Selected Tags */}
        {filters.tags && filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-accent-blood text-white text-xs font-pixel rounded-sm"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="hover:text-red-200"
                >
                  <FaTimes className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        <input
          type="text"
          placeholder="Add tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && tagInput.trim()) {
              e.preventDefault();
              handleTagAdd(tagInput.trim().toLowerCase());
            }
          }}
          className="w-full py-2 px-3 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood mb-2"
        />

        {/* Suggested Tags */}
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_TAGS.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagAdd(tag)}
              disabled={filters.tags?.includes(tag)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-pixel border transition-all",
                filters.tags?.includes(tag)
                  ? "bg-bg-paper-dark text-text-dim/50 border-text-ink/10 cursor-not-allowed"
                  : "bg-bg-paper border-text-ink/30 hover:border-accent-blood hover:text-accent-blood"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 px-4 font-pixel text-sm text-accent-blood border-2 border-accent-blood hover:bg-accent-blood hover:text-white transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default BuildFilters;
