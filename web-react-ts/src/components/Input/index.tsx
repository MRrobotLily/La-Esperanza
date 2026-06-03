import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefijo?: ReactNode;
  sufijo?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, hint, prefijo, sufijo, id, className, ...rest }, ref) => {
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <div
          className={[
            'flex items-center gap-2 rounded-xl border bg-white px-3 transition-all',
            error
              ? 'border-danger focus-within:border-danger'
              : 'border-line focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light/30',
          ].join(' ')}
        >
          {prefijo && <span className="text-ink-muted text-sm">{prefijo}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[
              'flex-1 bg-transparent py-3 text-[15px] outline-none placeholder:text-ink-light',
              className ?? '',
            ].join(' ')}
            {...rest}
          />
          {sufijo && <span className="text-ink-muted text-sm">{sufijo}</span>}
        </div>
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-ink-light">{hint}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
