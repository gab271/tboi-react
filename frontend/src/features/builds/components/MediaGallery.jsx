/**
 * MediaGallery Component
 * Display and preview media attachments for builds
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaExpand } from 'react-icons/fa';
import { cn } from '../../../lib/utils';

export function MediaGallery({ media = [] }) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  if (media.length === 0) return null;

  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % media.length);
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={cn(
        "grid gap-2",
        media.length === 1 && "grid-cols-1",
        media.length === 2 && "grid-cols-2",
        media.length >= 3 && "grid-cols-3"
      )}>
        {media.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "relative aspect-video bg-[#1a1a1a] border-2 border-[#404040] overflow-hidden cursor-pointer group",
              "hover:border-white transition-all",
              index === 0 && media.length >= 3 && "col-span-2 row-span-2"
            )}
            onClick={() => openLightbox(index)}
          >
            {item.type === 'external' ? (
              // External link (YouTube thumbnail, etc.)
              <div className="w-full h-full flex flex-col items-center justify-center bg-bg-paper-dark">
                <FaExternalLinkAlt className="w-8 h-8 text-text-dim mb-2" />
                <span className="text-xs font-pixel text-text-dim">{t('builds.externalLink')}</span>
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 text-xs text-accent-blood hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            ) : imageErrors[item.id] ? (
              // Error state
              <div className="w-full h-full flex items-center justify-center bg-bg-paper-dark">
                <span className="text-text-dim font-handwriting">{t('builds.failedToLoad')}</span>
              </div>
            ) : (
              // Image/GIF
              <>
                <img
                  src={item.thumbUrl || item.url}
                  alt={`Media ${index + 1}`}
                  onError={() => handleImageError(item.id)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* GIF indicator */}
                {item.type === 'gif' && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-white text-xs font-pixel rounded-sm">
                    GIF
                  </div>
                )}
                
                {/* Expand overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <FaExpand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <FaTimes className="w-8 h-8" />
            </button>

            {/* Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 transition-all z-10"
                >
                  <FaChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 transition-all z-10"
                >
                  <FaChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {media[selectedIndex].type === 'external' ? (
                <div className="bg-bg-paper p-8 text-center">
                  <FaExternalLinkAlt className="w-12 h-12 text-text-dim mx-auto mb-4" />
                  <p className="font-handwriting text-xl mb-4">{t('builds.externalContent')}</p>
                  <a
                    href={media[selectedIndex].external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blood hover:underline font-pixel"
                  >
                    {media[selectedIndex].external_url}
                  </a>
                </div>
              ) : (
                <img
                  src={media[selectedIndex].url}
                  alt={`Media ${selectedIndex + 1}`}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white font-pixel text-sm">
              {selectedIndex + 1} / {media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MediaGallery;
