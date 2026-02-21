/**
 * CreateBuildPage Component
 * Form for creating a new build
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaTimes, 
  FaUpload, 
  FaSpinner,
  FaArrowLeft,
  FaSearch,
  FaGripVertical,
  FaStar,
  FaExternalLinkAlt,
  FaTrash
} from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useCreateBuild, useSearchItems, useUploadMedia, usePopularTags } from '../hooks';
import { 
  GAME_VERSIONS, 
  DIFFICULTIES, 
  BUILD_TYPES, 
  CHARACTERS,
  VALIDATION,
  SUGGESTED_TAGS
} from '../constants';
import { cn } from '../../../lib/utils';

// Debounce hook
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Item Search Autocomplete
function ItemAutocomplete({ onSelect, selectedItems }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results = [], isLoading } = useSearchItems(debouncedQuery, debouncedQuery.length >= 2);

  const filteredResults = results.filter(
    item => !selectedItems.some(s => s.externalId === item.external_id)
  );

  return (
    <div className="relative">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search items..."
          className="w-full pl-10 pr-4 py-2 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood"
        />
        {isLoading && (
          <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-dim" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && filteredResults.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-bg-paper border-2 border-text-ink shadow-[4px_4px_0_rgba(0,0,0,0.2)] max-h-64 overflow-y-auto">
          {filteredResults.map((item) => (
            <button
              key={item.external_id}
              type="button"
              onClick={() => {
                onSelect({
                  externalId: item.external_id,
                  name: item.name,
                  spriteUrl: item.sprite_url,
                  isEssential: false,
                  notes: '',
                });
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2 hover:bg-bg-paper-dark transition-colors text-left"
            >
              {item.sprite_url ? (
                <img 
                  src={item.sprite_url} 
                  alt={item.name}
                  className="w-8 h-8 object-contain pixelated bg-[#1a1a1a]"
                />
              ) : (
                <div className="w-8 h-8 bg-bg-paper-dark flex items-center justify-center">
                  ❓
                </div>
              )}
              <div>
                <span className="font-pixel text-sm">{item.name}</span>
                <span className="text-xs text-text-dim ml-2">{item.item_type}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Media Upload Component
function MediaUploader({ media, setMedia, postId }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const uploadMutation = useUploadMedia();

  const handleFiles = useCallback(async (files) => {
    setUploadError('');
    
    const fileArray = Array.from(files);
    const remainingSlots = VALIDATION.media.max - media.length;
    
    if (fileArray.length > remainingSlots) {
      setUploadError(`Maximum ${VALIDATION.media.max} files allowed`);
      return;
    }

    for (const file of fileArray.slice(0, remainingSlots)) {
      // Validate type
      if (!VALIDATION.media.allowedTypes.includes(file.type)) {
        setUploadError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP');
        continue;
      }
      
      // Validate size
      if (file.size > VALIDATION.media.maxFileSize) {
        setUploadError('File too large. Maximum size is 10MB');
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      const newMedia = {
        id: crypto.randomUUID(),
        file,
        preview,
        type: file.type === 'image/gif' ? 'gif' : 'image',
        uploading: false,
        uploaded: false,
      };
      
      setMedia(prev => [...prev, newMedia]);
    }
  }, [media.length, setMedia]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeMedia = (id) => {
    setMedia(prev => {
      const item = prev.find(m => m.id === id);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(m => m.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {media.length < VALIDATION.media.max && (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center p-6 border-2 border-dashed cursor-pointer transition-all",
            dragActive 
              ? "border-accent-blood bg-accent-blood/5" 
              : "border-text-ink/30 hover:border-text-ink/60"
          )}
        >
          <FaUpload className="w-8 h-8 text-text-dim mb-2" />
          <span className="font-handwriting text-lg text-text-dim">
            Drop images here or click to upload
          </span>
          <span className="font-pixel text-xs text-text-dim/70 mt-1">
            Max {VALIDATION.media.max} files, 10MB each (JPEG, PNG, GIF, WebP)
          </span>
          <input
            type="file"
            accept={VALIDATION.media.allowedTypes.join(',')}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
      )}

      {/* Error */}
      {uploadError && (
        <div className="p-2 bg-accent-blood/10 text-accent-blood font-handwriting text-sm">
          {uploadError}
        </div>
      )}

      {/* Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item) => (
            <div 
              key={item.id}
              className="relative aspect-video bg-[#1a1a1a] border border-text-ink/30 overflow-hidden group"
            >
              <img
                src={item.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 p-1 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes className="w-3 h-3" />
              </button>

              {/* Type badge */}
              {item.type === 'gif' && (
                <div className="absolute bottom-1 left-1 px-1 bg-black/70 text-white text-[10px] font-pixel">
                  GIF
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* External URL Input (optional) */}
      <div className="flex items-center gap-2 text-xs text-text-dim">
        <FaExternalLinkAlt className="w-3 h-3" />
        <span className="font-handwriting">External links (YouTube, etc.) can be added after creating the build</span>
      </div>
    </div>
  );
}

// Main CreateBuildPage Component
export function CreateBuildPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const createBuildMutation = useCreateBuild();
  const uploadMutation = useUploadMedia();
  const { data: popularTags = [] } = usePopularTags();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    howToExecute: '',
    notes: '',
    characterSlug: '',
    gameVersion: 'repentance_plus',
    seed: '',
    difficulty: 'normal',
    buildType: 'damage',
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [items, setItems] = useState([]);
  const [media, setMedia] = useState([]);
  const [errors, setErrors] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/builds/new' } });
    }
  }, [user, authLoading, navigate]);

  // Validation
  const validate = () => {
    const newErrors = {};

    if (formData.title.length < VALIDATION.title.min) {
      newErrors.title = `Title must be at least ${VALIDATION.title.min} characters`;
    }
    if (formData.title.length > VALIDATION.title.max) {
      newErrors.title = `Title must be at most ${VALIDATION.title.max} characters`;
    }

    if (formData.description.length < VALIDATION.description.min) {
      newErrors.description = `Description must be at least ${VALIDATION.description.min} characters`;
    }
    if (formData.description.length > VALIDATION.description.max) {
      newErrors.description = `Description must be at most ${VALIDATION.description.max} characters`;
    }

    if (formData.howToExecute.length < VALIDATION.howToExecute.min) {
      newErrors.howToExecute = `Instructions must be at least ${VALIDATION.howToExecute.min} characters`;
    }

    if (!formData.characterSlug) {
      newErrors.characterSlug = 'Please select a character';
    }

    if (tags.length < VALIDATION.tags.min) {
      newErrors.tags = `Please add at least ${VALIDATION.tags.min} tags`;
    }

    if (items.length < VALIDATION.items.min) {
      newErrors.items = `Please add at least ${VALIDATION.items.min} item`;
    }

    if (formData.seed && !VALIDATION.seed.pattern.test(formData.seed.toUpperCase())) {
      newErrors.seed = 'Seed must be 8 alphanumeric characters (e.g., ABCD1234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const post = await createBuildMutation.mutateAsync({
        ...formData,
        tags,
        items,
      });

      // Upload media files after post creation
      if (media.length > 0) {
        for (const mediaItem of media) {
          if (mediaItem.file) {
            try {
              await uploadMutation.mutateAsync({
                postId: post.id,
                file: mediaItem.file,
              });
            } catch (mediaError) {
              console.error('Error uploading media:', mediaError);
              // Continue with other uploads even if one fails
            }
          }
        }
      }

      navigate(`/builds/${post.id}`);
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create build' });
    }
  };

  // Handle tag addition
  const addTag = (tag) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (
      normalizedTag.length >= VALIDATION.tags.tagMinLength &&
      normalizedTag.length <= VALIDATION.tags.tagMaxLength &&
      !tags.includes(normalizedTag) &&
      tags.length < VALIDATION.tags.max
    ) {
      setTags([...tags, normalizedTag]);
    }
    setTagInput('');
  };

  // Handle item reorder
  const moveItem = (fromIndex, toIndex) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
  };

  // Toggle item essential status
  const toggleEssential = (index) => {
    const newItems = [...items];
    newItems[index].isEssential = !newItems[index].isEssential;
    setItems(newItems);
  };

  // Remove item
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><FaSpinner className="animate-spin w-8 h-8" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-bg-paper text-text-ink pb-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/builds')}
            variant="ghost"
            className="p-2"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading text-text-heading">
              SHARE YOUR BUILD
            </h1>
            <p className="font-handwriting text-lg text-text-dim">
              Help the community discover new synergies
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-accent-blood/10 border border-accent-blood text-accent-blood font-handwriting">
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              TITLE *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give your build a catchy name..."
              maxLength={VALIDATION.title.max}
              className={cn(
                "w-full p-3 bg-bg-paper-dark border-2 font-handwriting text-xl focus:outline-none",
                errors.title ? "border-accent-blood" : "border-text-ink/40 focus:border-accent-blood"
              )}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <span className="text-sm text-accent-blood">{errors.title}</span>
              )}
              <span className="text-xs text-text-dim font-pixel ml-auto">
                {formData.title.length}/{VALIDATION.title.max}
              </span>
            </div>
          </div>

          {/* Character & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Character */}
            <div>
              <label className="block font-heading text-sm text-text-heading mb-2">
                CHARACTER *
              </label>
              <select
                value={formData.characterSlug}
                onChange={(e) => setFormData({ ...formData, characterSlug: e.target.value })}
                className={cn(
                  "w-full p-3 bg-bg-paper-dark border-2 font-pixel text-sm focus:outline-none",
                  errors.characterSlug ? "border-accent-blood" : "border-text-ink/40 focus:border-accent-blood"
                )}
              >
                <option value="">Select a character...</option>
                <optgroup label="Vanilla">
                  {CHARACTERS.filter(c => !c.tainted).map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Tainted">
                  {CHARACTERS.filter(c => c.tainted).map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </optgroup>
              </select>
              {errors.characterSlug && (
                <span className="text-sm text-accent-blood">{errors.characterSlug}</span>
              )}
            </div>

            {/* Difficulty */}
            <div>
              <label className="block font-heading text-sm text-text-heading mb-2">
                DIFFICULTY
              </label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                    className={cn(
                      "flex-1 py-2 px-3 font-pixel text-xs border-2 transition-all",
                      formData.difficulty === diff.value
                        ? "bg-text-heading text-white border-text-heading"
                        : "bg-bg-paper border-text-ink/40 hover:border-text-ink"
                    )}
                  >
                    {diff.icon} {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Game Version & Build Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Version */}
            <div>
              <label className="block font-heading text-sm text-text-heading mb-2">
                GAME VERSION
              </label>
              <select
                value={formData.gameVersion}
                onChange={(e) => setFormData({ ...formData, gameVersion: e.target.value })}
                className="w-full p-3 bg-bg-paper-dark border-2 border-text-ink/40 font-pixel text-sm focus:outline-none focus:border-accent-blood"
              >
                {GAME_VERSIONS.map(v => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Build Type */}
            <div>
              <label className="block font-heading text-sm text-text-heading mb-2">
                BUILD TYPE
              </label>
              <select
                value={formData.buildType}
                onChange={(e) => setFormData({ ...formData, buildType: e.target.value })}
                className="w-full p-3 bg-bg-paper-dark border-2 border-text-ink/40 font-pixel text-sm focus:outline-none focus:border-accent-blood"
              >
                {BUILD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seed (optional) */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              SEED <span className="text-text-dim">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.seed}
              onChange={(e) => setFormData({ ...formData, seed: e.target.value.toUpperCase() })}
              placeholder="ABCD1234"
              maxLength={8}
              className={cn(
                "w-full md:w-48 p-3 bg-bg-paper-dark border-2 font-pixel text-lg tracking-widest focus:outline-none",
                errors.seed ? "border-accent-blood" : "border-text-ink/40 focus:border-accent-blood"
              )}
            />
            {errors.seed && (
              <span className="text-sm text-accent-blood block mt-1">{errors.seed}</span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              DESCRIPTION *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your build, what makes it special..."
              rows={5}
              maxLength={VALIDATION.description.max}
              className={cn(
                "w-full p-3 bg-bg-paper-dark border-2 font-handwriting text-lg focus:outline-none resize-none",
                errors.description ? "border-accent-blood" : "border-text-ink/40 focus:border-accent-blood"
              )}
            />
            <div className="flex justify-between mt-1">
              {errors.description && (
                <span className="text-sm text-accent-blood">{errors.description}</span>
              )}
              <span className="text-xs text-text-dim font-pixel ml-auto">
                {formData.description.length}/{VALIDATION.description.max}
              </span>
            </div>
          </div>

          {/* How to Execute */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              HOW TO EXECUTE *
            </label>
            <textarea
              value={formData.howToExecute}
              onChange={(e) => setFormData({ ...formData, howToExecute: e.target.value })}
              placeholder="Step-by-step instructions to achieve this build..."
              rows={5}
              maxLength={VALIDATION.howToExecute.max}
              className={cn(
                "w-full p-3 bg-bg-paper-dark border-2 font-handwriting text-lg focus:outline-none resize-none",
                errors.howToExecute ? "border-accent-blood" : "border-text-ink/40 focus:border-accent-blood"
              )}
            />
            {errors.howToExecute && (
              <span className="text-sm text-accent-blood">{errors.howToExecute}</span>
            )}
          </div>

          {/* Notes (optional) */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              NOTES <span className="text-text-dim">(Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional tips or warnings..."
              rows={3}
              maxLength={VALIDATION.notes.max}
              className="w-full p-3 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              TAGS * <span className="text-text-dim">({tags.length}/{VALIDATION.tags.max})</span>
            </label>
            
            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-accent-blood text-white text-xs font-pixel"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="hover:text-red-200"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 p-3 bg-bg-paper-dark border-2 border-text-ink/40 font-handwriting text-lg focus:outline-none focus:border-accent-blood"
              />
              <Button
                type="button"
                onClick={() => addTag(tagInput)}
                variant="outline"
                className="px-4"
              >
                Add
              </Button>
            </div>

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {SUGGESTED_TAGS.slice(0, 12).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= VALIDATION.tags.max}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-pixel border transition-all",
                    tags.includes(tag)
                      ? "bg-bg-paper-dark text-text-dim/50 border-text-ink/10 cursor-not-allowed"
                      : "bg-bg-paper border-text-ink/30 hover:border-accent-blood hover:text-accent-blood"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {errors.tags && (
              <span className="text-sm text-accent-blood block mt-1">{errors.tags}</span>
            )}
          </div>

          {/* Items */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              ITEMS * <span className="text-text-dim">({items.length} selected)</span>
            </label>

            <ItemAutocomplete 
              onSelect={(item) => setItems([...items, item])}
              selectedItems={items}
            />

            {/* Selected Items */}
            {items.length > 0 && (
              <div className="mt-3 space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.externalId}
                    className="flex items-center gap-3 p-2 bg-bg-paper-dark border border-text-ink/20"
                  >
                    <FaGripVertical className="w-4 h-4 text-text-dim cursor-move" />
                    
                    {item.spriteUrl ? (
                      <img 
                        src={item.spriteUrl} 
                        alt={item.name}
                        className="w-8 h-8 object-contain pixelated bg-[#1a1a1a]"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#1a1a1a] flex items-center justify-center">
                        ❓
                      </div>
                    )}
                    
                    <span className="flex-1 font-pixel text-sm">{item.name}</span>
                    
                    {/* Essential toggle */}
                    <button
                      type="button"
                      onClick={() => toggleEssential(index)}
                      className={cn(
                        "p-1 transition-colors",
                        item.isEssential ? "text-accent-gold" : "text-text-dim hover:text-accent-gold"
                      )}
                      title={item.isEssential ? "Mark as optional" : "Mark as essential"}
                    >
                      <FaStar className="w-4 h-4" />
                    </button>
                    
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-text-dim hover:text-accent-blood transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.items && (
              <span className="text-sm text-accent-blood block mt-1">{errors.items}</span>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="block font-heading text-sm text-text-heading mb-2">
              MEDIA <span className="text-text-dim">(Optional, max {VALIDATION.media.max})</span>
            </label>
            <MediaUploader media={media} setMedia={setMedia} />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-6 border-t-2 border-dashed border-text-ink/30">
            <Button
              type="button"
              onClick={() => navigate('/builds')}
              variant="outline"
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={createBuildMutation.isPending}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 font-pixel text-lg bg-accent-blood text-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
            >
              {createBuildMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus />
                  Publish Build
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default CreateBuildPage;
