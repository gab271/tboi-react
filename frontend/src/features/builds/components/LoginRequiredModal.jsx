/**
 * LoginRequiredModal Component
 * Shown when anonymous users try to perform authenticated actions
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export function LoginRequiredModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: window.location.pathname } });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            zIndex: 99999,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-[#d4c8b8] border-4 border-[#3d3629] p-6 max-w-md w-full"
            style={{ 
              zIndex: 100000,
              boxShadow: '8px 8px 0 rgba(0,0,0,0.4)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#3d3629]/60 hover:text-[#3d3629] transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-[#c4b8a8] rounded-full flex items-center justify-center">
                <FaSignInAlt className="w-8 h-8 text-[#8a1c1c]" />
              </div>

              {/* Title */}
              <h2 className="font-heading text-2xl text-[#1a1a1a] mb-2">
                SIGN IN REQUIRED
              </h2>

              {/* Message */}
              <p className="font-handwriting text-xl text-[#3d3629] mb-6">
                {message || 'You need to be signed in to perform this action.'}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-[#8a1c1c] text-white font-pixel text-base py-3 px-6 border-2 border-black hover:bg-[#6a1515] transition-colors"
                  style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.8)' }}
                >
                  <FaSignInAlt /> Sign In
                </button>
                
                <button
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center gap-2 py-3 font-pixel text-sm text-[#3d3629] border-2 border-[#3d3629]/40 hover:border-[#3d3629] hover:bg-[#c4b8a8] transition-all"
                >
                  <FaUserPlus /> Create Account
                </button>
              </div>

              {/* Guest note */}
              <p className="mt-4 text-sm font-handwriting text-[#3d3629]/70">
                You can browse builds without signing in
              </p>
            </div>

            {/* Decorative tape */}
            <div 
              className="absolute -top-3 left-8 w-16 h-6 -rotate-3" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render in portal to escape any parent positioning/overflow
  return createPortal(modalContent, document.body);
}

export default LoginRequiredModal;
