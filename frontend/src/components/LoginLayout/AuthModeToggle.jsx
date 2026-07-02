import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

/**
 * AuthModeToggle — pastilla segmentada que deja claro que existen dos caminos
 * (volver / empezar) y en cuál estás. Mismo lenguaje que el toggle
 * NORMAL / TAINTED de la página de personajes.
 */
export function AuthModeToggle({ mode }) {
  const { t } = useTranslation();
  const segments = [
    { key: 'login', label: t('auth.tabReturning'), to: '/login' },
    { key: 'register', label: t('auth.tabNew'), to: '/register' },
  ];

  return (
    <div
      role="tablist"
      aria-label={t('auth.signIn')}
      className="relative flex w-full rounded-sm border-[2px] border-[#5c4a32]/25 bg-[#e2d4b8] p-1 shadow-inner"
    >
      {segments.map((seg) => {
        const active = seg.key === mode;
        return (
          <Link
            key={seg.key}
            to={seg.to}
            role="tab"
            aria-selected={active}
            className={cn(
              'font-pixel flex-1 rounded-[2px] py-2 text-center text-base tracking-wide transition-colors duration-200 sm:text-lg',
              active
                ? 'bg-[#1a1a1a] text-[#f5edd8] shadow-[2px_2px_0_rgba(0,0,0,0.25)]'
                : 'text-[#5c4a32]/70 hover:text-[#8a1c1c]'
            )}
          >
            {seg.label}
          </Link>
        );
      })}
    </div>
  );
}
