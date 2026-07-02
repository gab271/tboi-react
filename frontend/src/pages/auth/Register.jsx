import { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaSkull, FaEnvelopeOpenText } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LoginLayout } from '../../components/LoginLayout/LoginLayout';
import { AuthField } from '../../components/LoginLayout/AuthField';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSentTo, setConfirmSentTo] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const lastSubmitTime = useRef(0);

  // Validación en vivo (null = aún sin tocar → neutro)
  const usernameValid = username === '' ? null : USERNAME_REGEX.test(username);
  const passwordValid = password === '' ? null : password.length >= 6;
  const confirmValid =
    confirmPassword === '' ? null : confirmPassword === password && passwordValid;

  const canSubmit = usernameValid && passwordValid && confirmValid && email.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastSubmitTime.current < 2000) return;
    lastSubmitTime.current = now;
    if (isSubmitting) return;

    if (!USERNAME_REGEX.test(username)) {
      return setError(
        t('auth.usernameInvalid', 'El usuario debe tener 3–20 caracteres: letras, números, _ o -')
      );
    }
    if (password !== confirmPassword) {
      return setError(t('auth.passwordsNotMatch'));
    }
    if (password.length < 6) {
      return setError(t('auth.passwordTooShort'));
    }

    try {
      setError('');
      setIsSubmitting(true);

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

      // Supabase devuelve un "usuario" con identities vacío cuando el email
      // ya estaba registrado (para no filtrar qué correos existen).
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return setError(t('auth.emailExists'));
      }

      // Con sesión → ya está dentro. Sin sesión → falta confirmar el email.
      if (data?.session) {
        navigate('/');
      } else if (data?.user) {
        setConfirmSentTo(email);
      } else {
        setError(t('auth.errorCreatingAccount'));
      }
    } catch {
      setError(t('auth.errorCreatingAccount'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmSentTo) {
    return (
      <LoginLayout mode="register">
        <div className="py-2 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 inline-flex h-16 w-16 items-center justify-center text-[#8a1c1c]"
          >
            <FaEnvelopeOpenText className="text-4xl" />
          </motion.div>

          <h2 className="font-heading text-lg uppercase tracking-widest text-[#1a1a1a] sm:text-xl">
            {t('auth.checkEmailTitle')}
          </h2>

          <p className="font-handwriting mt-4 text-lg leading-snug text-[#5c4a32]">
            {t('auth.checkEmailBody')}
            <br />
            <span className="break-all font-bold text-[#1a1a1a]">{confirmSentTo}</span>.
          </p>
          <p className="font-handwriting mt-3 text-base leading-snug text-[#5c4a32]/70">
            {t('auth.checkEmailSpam')}
          </p>

          <Link
            to="/login"
            className="font-pixel mt-6 inline-block bg-[#1a1a1a] px-8 py-3 text-lg uppercase tracking-widest text-[#f5edd8] shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-colors hover:bg-[#8a1c1c]"
            style={{ borderRadius: '2px 255px 3px 25px / 255px 5px 225px 5px' }}
          >
            {t('auth.goToLogin')}
          </Link>
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout mode="register">
      <p className="font-handwriting -mt-1 mb-5 text-center text-lg italic text-[#5c4a32]/70">
        {t('auth.registerTagline')}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="username"
          label={t('auth.usernameLabel')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('auth.usernamePlaceholder')}
          autoComplete="username"
          maxLength={20}
          valid={usernameValid}
          hint={usernameValid === false ? t('auth.usernameRule') : t('auth.usernameHint')}
          required
        />

        <AuthField
          id="email"
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
          maxLength={254}
          required
        />

        <AuthField
          id="password"
          label={t('auth.password')}
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
          label={t('auth.confirmLabel')}
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
          className="font-pixel mt-1 flex w-full items-center justify-center gap-2 bg-[#1a1a1a] py-3.5 text-lg uppercase tracking-widest text-[#f5edd8] shadow-[3px_3px_0_rgba(0,0,0,0.3)] transition-colors hover:bg-[#8a1c1c] disabled:cursor-not-allowed disabled:opacity-45"
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
              {t('auth.creatingAccount')}
            </>
          ) : (
            t('auth.createAccountAction')
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

export default Register;
