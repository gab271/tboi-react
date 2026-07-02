import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FaSkull, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { AuthField } from '../../components/LoginLayout/AuthField';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const lastSubmitTime = useRef(0);

  const passwordValid = password === '' ? null : password.length >= 6;
  const confirmValid =
    confirmPassword === '' ? null : confirmPassword === password && passwordValid;
  const canSubmit = passwordValid && confirmValid;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;
    if (isSubmitting) return;

    if (password.length < 6) return setError(t('auth.passwordTooShort'));
    if (password !== confirmPassword) return setError(t('auth.passwordsNotMatch'));

    try {
      setError('');
      setIsSubmitting(true);
      const { error } = await updatePassword(password);
      if (error) throw error;
      navigate('/');
    } catch {
      setError(t('auth.resetError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginLayout>
      <div className="mb-6 text-center">
        <motion.div
          className="mb-2 inline-flex h-14 w-14 items-center justify-center text-[#d97706]"
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <FaKey className="text-3xl" />
        </motion.div>

        <h1 className="font-heading text-xl uppercase tracking-widest text-[#1a1a1a] sm:text-2xl">
          {t('auth.resetTitle')}
        </h1>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="password"
          label={t('auth.newPassword')}
          reveal
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          maxLength={128}
          valid={passwordValid}
          hint={t('auth.passwordHint')}
          required
        />

        <AuthField
          id="confirmPassword"
          label={t('auth.repeatPasswordLabel')}
          reveal
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          maxLength={128}
          valid={confirmValid}
          hint={
            confirmValid === false
              ? t('auth.confirmMismatch')
              : confirmValid
                ? t('auth.confirmMatch')
                : undefined
          }
          required
        />

        <motion.button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          whileHover={{ scale: isSubmitting || !canSubmit ? 1 : 1.015 }}
          whileTap={{ scale: isSubmitting || !canSubmit ? 1 : 0.985 }}
          className="font-pixel flex w-full items-center justify-center gap-2 bg-[#1a1a1a] py-3.5 text-lg uppercase tracking-widest text-[#f5edd8] shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-colors hover:bg-[#8a1c1c] disabled:cursor-not-allowed disabled:opacity-45"
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
              {t('auth.savingPassword')}
            </>
          ) : (
            t('auth.savePasswordAction')
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

export default ResetPassword;
