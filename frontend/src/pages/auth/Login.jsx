import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaLock, FaArrowLeft, FaSkull } from 'react-icons/fa';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { CharacterCarousel } from '../../components/LoginLayout/CharacterCarousel';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Anti-spam / Debounce
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);
      
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data?.user) {
         navigate('/');
      }
    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes('Invalid login credentials')) {
         setError('Incorrect email or password.');
      } else {
         setError('Failed to log in. Please check connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      {/* Header Section */}
      <div className="mb-4 text-center z-20 relative">
        <CharacterCarousel />
        
        {/* Title with hand-drawn underline */}
        <div className="relative inline-block mt-4">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#1a1a1a] tracking-widest">
            THE BASEMENT AWAITS
          </h2>
          <svg 
            className="absolute -bottom-1 left-0 w-full h-3" 
            viewBox="0 0 200 10" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,5 Q25,2 50,6 T100,5 T150,6 T200,5" 
              fill="none" 
              stroke="#8a1c1c" 
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        <motion.p 
          className="text-[#5c4a32]/70 font-handwriting text-lg mt-3 italic"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Resume your run...
        </motion.p>
      </div>

      {error && (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-red-900/10 border-l-4 border-red-800 text-red-900 p-3 mb-4 font-handwriting text-base flex items-center gap-2" 
          role="alert"
        >
          <FaSkull className="text-red-800 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
            {/* Email Input */}
            <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-lg sm:text-xl h-11 sm:h-12 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
                  icon={null}
                />
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
            </div>

            {/* Password Input */}
            <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-lg sm:text-xl h-11 sm:h-12 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
                  icon={null}
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
            </div>
        </div>

        {/* Submit Button - Isaac Style */}
        <motion.button 
          type="submit" 
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full font-pixel text-lg sm:text-xl py-4 mt-4 bg-[#1a1a1a] text-[#f5edd8] hover:bg-[#8a1c1c] disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-widest uppercase shadow-lg relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  ⟳
                </motion.span>
                DESCENDING...
              </>
            ) : (
              'DESCEND'
            )}
          </span>
          {/* Button shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      </form>
      
      {/* Links Section */}
      <div className="mt-8 text-center space-y-4">
        <div className="text-sm sm:text-base text-[#5c4a32]/70 font-handwriting">
          No seed?{' '}
          <Link 
            to="/register" 
            className="font-bold text-[#8a1c1c] hover:text-[#b91c1c] transition-colors relative inline-block group"
          >
            START NEW RUN
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#8a1c1c] group-hover:w-full transition-all duration-300" />
          </Link>
        </div>
        
        <div className="text-xs">
          <Link 
            to="/forgot-password" 
            className="text-[#5c4a32]/40 hover:text-[#5c4a32] font-mono tracking-wide transition-colors"
          >
            [FORGOT PASSWORD]
          </Link>
        </div>
      </div>

      {/* Back to Home */}
      <div className="mt-6 flex justify-center">
         <Link 
           to="/" 
           className="flex items-center gap-2 text-[#5c4a32]/50 hover:text-[#1a1a1a] text-xs sm:text-sm font-bold group transition-colors uppercase tracking-widest font-pixel"
         >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            Escape
         </Link>
      </div>

    </LoginLayout>
  );
};

export default Login;
