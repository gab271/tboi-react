import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FaSkull, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { AuthField } from '../../components/LoginLayout/AuthField';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Anti-spam / debounce
    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;
    if (isSubmitting) return;

    try {
      setError('');
      setIsSubmitting(true);

      const { data, error } = await signIn(email, password);
      if (error) throw error;
      if (data?.user) navigate('/');
    } catch (err) {
      console.error(err);
      if (err.message && err.message.includes('Invalid login credentials')) {
        setError(t('auth.loginErrorInvalid'));
      } else {
        setError(t('auth.loginErrorGeneric'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout mode="login">
      <p className="font-handwriting -mt-1 mb-5 text-center text-lg italic text-[#5c4a32]/70">
        {t('auth.loginTagline')}
      </p>

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

        <div>
          <AuthField
            id="password"
            label={t('auth.password')}
            reveal
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <div className="mt-1.5 text-right">
            <Link
              to="/forgot-password"
              className="font-handwriting text-[15px] text-[#5c4a32]/60 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#8a1c1c]"
            >
              {t('auth.forgotPasswordShort')}
            </Link>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.015 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.985 }}
          className="font-pixel flex w-full items-center justify-center gap-2 bg-[#1a1a1a] py-3.5 text-xl uppercase tracking-widest text-[#f5edd8] shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-colors hover:bg-[#8a1c1c] disabled:cursor-not-allowed disabled:opacity-50"
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
              {t('auth.signingIn')}
            </>
          ) : (
            <>
              {t('auth.signInAction')} <FaArrowDown className="text-sm opacity-70" aria-hidden />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 flex justify-center">
        <Link
          to="/"
          className="font-handwriting group flex items-center gap-2 text-sm text-[#5c4a32]/55 transition-colors hover:text-[#1a1a1a]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          {t('auth.backHome')}
        </Link>
      </div>
    </LoginLayout>
  );
};

export default Login;
