import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaLock, FaUser, FaArrowLeft, FaSkull, FaKey } from 'react-icons/fa';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { motion } from 'framer-motion';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Antispam protection
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    if (isSubmitting) return;

    if (password !== confirmPassword) {
      return setError(t('auth.passwordsNotMatch'));
    }

    if (password.length < 6) {
        return setError(t('auth.passwordTooShort'));
    }

    try {
      setError('');
      setIsSubmitting(true);

      // Check if username exists
      const { count, error: checkError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);

      if (checkError) {
         console.error(checkError);
      } else if (count > 0) {
         setIsSubmitting(false);
         return setError(t('auth.usernameAlreadyTaken'));
      }

      const { data, error } = await signUp(email, password, { username });
      
      if (error) throw error;
      
      if (data?.user) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || t('auth.errorCreatingAccount'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      {/* Back Link */}
      <Link 
        to="/" 
        className="absolute -top-12 left-0 flex items-center gap-2 text-white/50 hover:text-white text-sm font-handwriting transition-colors group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        {t('auth.backToCodex')}
      </Link>

      {/* Header */}
      <div className="text-center mb-5">
        {/* Key Icon */}
        <motion.div 
          className="inline-flex items-center justify-center w-14 h-14 mb-2"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <FaKey className="text-4xl text-[#d97706]" />
        </motion.div>
        
        <div className="relative inline-block">
          <h1 className="text-2xl sm:text-3xl font-heading text-[#1a1a1a] tracking-widest uppercase">
            {t('auth.joinTheDescent')}
          </h1>
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
        
        <p className="text-[#5c4a32]/70 mt-3 font-handwriting text-base sm:text-lg italic">
          {t('auth.createAccountDescription')}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-red-900/10 border-l-4 border-red-800 text-red-900 p-3 mb-4 font-handwriting text-sm sm:text-base flex items-center gap-2" 
          role="alert"
        >
          <FaSkull className="text-red-800 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-bold text-[#1a1a1a] uppercase tracking-wider ml-1 font-pixel">
            {t('auth.username')}
          </label>
          <div className="relative group">
            <Input 
              type="text" 
              placeholder="Isaac"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-base sm:text-lg h-10 sm:h-11 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
              required
            />
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-bold text-[#1a1a1a] uppercase tracking-wider ml-1 font-pixel">
            Email
          </label>
          <div className="relative group">
            <Input 
              type="email" 
              placeholder="isaac@basement.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-base sm:text-lg h-10 sm:h-11 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
              required
            />
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
          </div>
        </div>
        
        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-bold text-[#1a1a1a] uppercase tracking-wider ml-1 font-pixel">
            {t('auth.password')}
          </label>
          <div className="relative group">
            <Input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-base sm:text-lg h-10 sm:h-11 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
              required
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-bold text-[#1a1a1a] uppercase tracking-wider ml-1 font-pixel">
            {t('auth.confirm')}
          </label>
          <div className="relative group">
            <Input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-base sm:text-lg h-10 sm:h-11 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
              required
            />
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button 
          type="submit" 
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full font-pixel text-base sm:text-lg py-3 sm:py-4 mt-4 bg-[#1a1a1a] text-[#f5edd8] hover:bg-[#8a1c1c] disabled:opacity-50 disabled:cursor-not-allowed transition-all tracking-widest uppercase shadow-lg relative overflow-hidden group"
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
                {t('auth.summoning')}
              </>
            ) : (
              t('auth.createAccount')
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      </form>

      {/* Footer Link */}
      <div className="mt-6 text-center">
        <p className="text-[#5c4a32]/70 font-handwriting text-sm sm:text-base">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link 
            to="/login" 
            className="font-bold text-[#8a1c1c] hover:text-[#b91c1c] transition-colors relative inline-block group"
          >
            {t('auth.signIn')}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#8a1c1c] group-hover:w-full transition-all duration-300" />
          </Link>
        </p>
      </div>
    </LoginLayout>
  );
};

export default Register;