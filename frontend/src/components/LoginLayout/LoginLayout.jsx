import { DustParticles } from './DustParticles';
import { CharacterCarousel } from './CharacterCarousel';
import { AuthModeToggle } from './AuthModeToggle';
import { cn } from '../../lib/utils';

/**
 * LoginLayout — la superficie compartida de autenticación: el sótano oscuro
 * y, dentro, la "hoja del diario" de Isaac.
 *
 * `mode` ('login' | 'register') activa la cabecera compartida
 * (carrusel "¿Quién soy?" + toggle Entrar/Crear cuenta) para que ambos
 * caminos vivan en la misma superficie. Sin `mode` (recuperar/restablecer
 * contraseña) se muestra solo la hoja.
 */
export const LoginLayout = ({ children, mode }) => {
  const showHeader = mode === 'login' || mode === 'register';

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] font-sans">
      {/* 1. Atmósfera del sótano */}
      <DustParticles count={50} />
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* 2. Contenido */}
      <div className="relative z-10 w-full max-w-md px-4 py-10">
        {/* La hoja del diario */}
        <div
          className={cn('relative bg-[#f5edd8] px-6 pb-6 pt-9 sm:px-9')}
          style={{
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E"),
              linear-gradient(135deg, #f5edd8 0%, #e8dcc4 50%, #f0e4ce 100%)
            `,
            boxShadow: '0 0 80px -10px rgba(139,69,19,0.45), 0 0 130px -20px rgba(0,0,0,0.9)',
            clipPath: `polygon(
              0% 2%, 3% 0%, 8% 1%, 15% 0%, 22% 1.5%, 30% 0%,
              38% 0.5%, 45% 0%, 55% 1%, 62% 0%, 70% 0.5%,
              78% 0%, 85% 1%, 92% 0%, 97% 1.5%, 100% 0%,
              100% 98%, 97% 100%, 90% 99%, 82% 100%, 75% 98.5%,
              68% 100%, 60% 99%, 52% 100%, 45% 98.5%, 38% 100%,
              30% 99%, 22% 100%, 15% 98%, 8% 100%, 2% 99%, 0% 100%
            )`,
          }}
        >
          {/* Línea de margen roja, como un cuaderno de cole */}
          <div
            className="pointer-events-none absolute inset-y-0 left-5 w-px bg-[#8a1c1c]/25 sm:left-7"
            aria-hidden
          />

          {/* Cabecera compartida: identidad + los dos caminos */}
          {showHeader && (
            <div className="relative z-10 mb-6">
              <CharacterCarousel />
              <div className="mt-5">
                <AuthModeToggle mode={mode} />
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="relative z-10">{children}</div>

          {/* Pie del diario */}
          <div className="mt-7 border-t-2 border-dashed border-[#5c4a32]/20 pt-4 text-center">
            <p className="font-handwriting text-sm italic text-[#5c4a32]/50">
              {'"Only the penitent man shall pass..."'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Pie global */}
      <footer className="font-pixel absolute bottom-4 left-0 z-10 w-full text-center text-xs tracking-widest text-white/20">
        TBOI Codex © {new Date().getFullYear()}
      </footer>
    </div>
  );
};
