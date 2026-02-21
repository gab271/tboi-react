import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { FaEnvelope, FaArrowLeft, FaSkull, FaCheckCircle, FaQuestion } from 'react-icons/fa';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Anti-spam
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;

    if (isSubmitting) return;

    try {
      setMessage('');
      setError('');
      setIsSubmitting(true);
      const { error } = await resetPasswordForEmail(email);
      if (error) throw error;
      setMessage('Check your inbox for password reset instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      {/* Back Link - Outside of paper but inside layout */}
      <Link 
        to="/login" 
        className="absolute -top-12 left-0 flex items-center gap-2 text-white/50 hover:text-white text-sm font-handwriting transition-colors group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
        Volver al login
      </Link>

      {/* Header */}
      <div className="text-center mb-6">
        {/* Question Mark Icon */}
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 mb-3"
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <FaQuestion className="text-4xl text-[#8a1c1c]" />
        </motion.div>
        
        <div className="relative inline-block">
          <h1 className="text-3xl sm:text-4xl font-heading text-[#1a1a1a] tracking-widest uppercase">
            RECUPERAR
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
        
        <p className="text-[#5c4a32]/70 mt-4 font-handwriting text-lg italic">
          Ingresa tu email para recibir instrucciones
        </p>
      </div>

      {/* Messages */}
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
      
      {message && (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-green-900/10 border-l-4 border-green-700 text-green-900 p-3 mb-4 font-handwriting text-base flex items-center gap-2"
        >
          <FaCheckCircle className="text-green-700 flex-shrink-0" />
          <p>{message}</p>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider ml-1 font-pixel">
            Email
          </label>
          <div className="relative group">
            <Input
              type="email"
              placeholder="isaac@basement.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#e8dcc4] border-2 border-[#5c4a32]/30 focus:border-[#8a1c1c] font-handwriting text-lg sm:text-xl h-11 sm:h-12 pl-10 placeholder:text-[#5c4a32]/40 transition-all rounded-sm shadow-inner"
              required
            />
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c4a32]/50 group-focus-within:text-[#8a1c1c] transition-colors" />
          </div>
        </div>

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
                ENVIANDO...
              </>
            ) : (
              'ENVIAR LINK'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <p className="text-[#5c4a32]/70 font-handwriting text-base sm:text-lg">
          ¿Te acordaste?{' '}
          <Link 
            to="/login" 
            className="font-bold text-[#8a1c1c] hover:text-[#b91c1c] transition-colors relative inline-block group"
          >
            Entra aquí
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#8a1c1c] group-hover:w-full transition-all duration-300" />
          </Link>
        </p>
      </div>
    </LoginLayout>
  );
};

export default ForgotPassword;
