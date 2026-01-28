/**
 * LoginRequiredModal Component
 * Shown when anonymous users try to perform authenticated actions
 */
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';

export function LoginRequiredModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: window.location.pathname } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: window.location.pathname } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-bg-paper border-4 border-text-ink p-6 shadow-[8px_8px_0_rgba(0,0,0,0.3)] max-w-md w-full"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-dim hover:text-text-ink transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-bg-paper-dark rounded-full flex items-center justify-center">
                <FaSignInAlt className="w-8 h-8 text-accent-blood" />
              </div>

              {/* Title */}
              <h2 className="font-heading text-2xl text-text-heading mb-2">
                SIGN IN REQUIRED
              </h2>

              {/* Message */}
              <p className="font-handwriting text-xl text-text-dim mb-6">
                {message || 'You need to be signed in to perform this action.'}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-accent-blood text-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all py-3"
                >
                  <FaSignInAlt /> Sign In
                </Button>
                
                <button
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center gap-2 py-3 font-pixel text-sm border-2 border-text-ink/40 hover:border-text-ink transition-all"
                >
                  <FaUserPlus /> Create Account
                </button>
              </div>

              {/* Guest note */}
              <p className="mt-4 text-sm font-handwriting text-text-dim/70">
                You can browse builds without signing in
              </p>
            </div>

            {/* Decorative tape */}
            <div className="absolute -top-3 left-8 w-16 h-6 bg-[#e8e4d9] opacity-90 -rotate-3 border border-black/10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default LoginRequiredModal;
