import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { cn } from '../../lib/utils';

/**
 * AuthField — un campo del "diario". Etiqueta manuscrita sobre una línea
 * subrayada donde escribes, en lugar de una caja genérica con icono.
 *
 * - `reveal`   : muestra el botón ojo para contraseñas.
 * - `valid`    : true → tick rojo; false → subrayado en rojo; null → neutro.
 * - `hint`     : nota corta bajo la línea (reglas / errores en voz de la UI).
 */
export function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  reveal = false,
  valid = null,
  hint,
  autoComplete,
  maxLength,
  required,
}) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  const inputType = reveal ? (show ? 'text' : 'password') : type;

  const underline =
    valid === false
      ? 'border-[#a33535]'
      : 'border-[#5c4a32]/45 group-focus-within:border-[#8a1c1c]';

  return (
    <div className="group">
      <label
        htmlFor={id}
        className="font-handwriting mb-1 block select-none text-base leading-none text-[#5c4a32]"
      >
        {label}
      </label>

      <div className="relative flex items-end">
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required={required}
          aria-invalid={valid === false || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={cn(
            'peer w-full rounded-none border-0 border-b-[2.5px] bg-transparent',
            'font-handwriting text-xl leading-tight text-[#1a1a1a] sm:text-2xl',
            'px-1 pb-1 pr-9 outline-none transition-colors duration-200',
            'placeholder:italic placeholder:text-[#5c4a32]/35',
            underline
          )}
        />

        {/* Estado válido: tick rojo dibujado al final de la línea */}
        {valid === true && !reveal && (
          <FaCheck className="absolute bottom-2 right-1 text-sm text-[#8a1c1c]" aria-hidden />
        )}

        {/* Mostrar / ocultar contraseña */}
        {reveal && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
            aria-pressed={show}
            className="absolute bottom-1.5 right-0 p-1 text-[#5c4a32]/55 transition-colors hover:text-[#8a1c1c] focus-visible:text-[#8a1c1c] focus-visible:outline-none"
          >
            {show ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>

      {hint && (
        <p
          id={`${id}-hint`}
          className={cn(
            'font-pixel mt-1 text-[13px] leading-tight tracking-wide',
            valid === false ? 'text-[#a33535]' : 'text-[#5c4a32]/55'
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
