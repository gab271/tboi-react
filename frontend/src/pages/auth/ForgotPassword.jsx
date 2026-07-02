import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaSkull, FaCheckCircle, FaQuestion } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { AuthField } from '../../components/LoginLayout/AuthField';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPasswordForEmail } = useAuth();

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
      setMessage(t('auth.resetEmailSent'));
    } catch {
      setError(t('auth.resetEmailError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      <div className="mb-6 text-center">
        <motion.div
          className="mb-2 inline-flex h-14 w-14 items-center justify-center text-[#8a1c1c]"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <FaQuestion className="text-3xl" />
        </motion.div>

        <h1 className="font-heading text-xl uppercase tracking-widest text-[#1a1a1a] sm:text-2xl">
          {t('auth.forgotTitle')}
        </h1>
        <p className="font-handwriting mt-3 text-lg italic text-[#5c4a32]/70">
          {t('auth.forgotTagline')}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="font-handwriting mb-5 flex items-center gap-2 border-l-4 border-[#8a1c1c] bg-[#8a1c1c]/10 p-3 text-base text-[#8a1c1c]"
          role="alert"
        >
          <FaSkull className="flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {message && (
        <motion.div
          initial={{ x: -8, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="font-handwriting mb-5 flex items-center gap-2 border-l-4 border-[#3f6212] bg-[#3f6212]/10 p-3 text-base text-[#3f6212]"
        >
          <FaCheckCircle className="flex-shrink-0" />
          <p>{message}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
          required
        />

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
          className="font-pixel flex w-full items-center justify-center gap-2 bg-[#1a1a1a] py-3.5 text-lg uppercase tracking-widest text-[#f5edd8] shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-colors hover:bg-[#8a1c1c] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderRadius: '2px 255px 3px 25px / 255px 5px 225px 5px' }}
        >
          {isSubmitting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="inline-block"
              >
                ⟳
              </motion.span>
              {t('auth.sending')}
            </>
          ) : (
            t('auth.sendResetLink')
          )}
        </motion.button>
      </form>

      <div className="mt-6 flex justify-center">
        <Link
          to="/login"
          className="font-handwriting group flex items-center gap-2 text-sm text-[#5c4a32]/55 transition-colors hover:text-[#1a1a1a]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          {t('auth.backToLogin')}
        </Link>
      </div>
    </LoginLayout>
  );
};

export default ForgotPassword;
