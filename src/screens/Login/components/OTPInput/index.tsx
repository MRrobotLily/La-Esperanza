import { useEffect, useRef } from 'react';

interface Props {
  valor: string;
  onCambio: (v: string) => void;
  largo?: number;
  error?: boolean;
}

export default function OTPInput({ valor, onCambio, largo = 6, error }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const set = (i: number, v: string) => {
    const chars = valor.padEnd(largo, ' ').split('');
    chars[i] = v;
    onCambio(chars.join('').replace(/\s+$/u, ''));
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length: largo }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={valor[i] ?? ''}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, '').slice(0, 1);
            if (!char) return;
            set(i, char);
            if (i < largo - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              if (valor[i]) set(i, '');
              else if (i > 0) {
                refs.current[i - 1]?.focus();
                set(i - 1, '');
              }
            } else if (e.key === 'ArrowLeft' && i > 0) {
              refs.current[i - 1]?.focus();
            } else if (e.key === 'ArrowRight' && i < largo - 1) {
              refs.current[i + 1]?.focus();
            }
          }}
          onPaste={(e) => {
            const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, largo);
            if (!pegado) return;
            e.preventDefault();
            onCambio(pegado);
            refs.current[Math.min(pegado.length, largo - 1)]?.focus();
          }}
          className={[
            'h-14 w-11 rounded-xl border-2 bg-bg-alt text-center text-2xl font-bold outline-none transition-all sm:w-12',
            error
              ? 'border-danger text-danger'
              : 'border-line focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light/30',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
