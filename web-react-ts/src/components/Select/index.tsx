import { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, error, hint, id, className, children, ...rest }, ref) => {
    const sid = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={sid} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={sid}
          className={[
            'rounded-xl border bg-white px-3 py-3 text-[15px] outline-none transition-all',
            error
              ? 'border-danger focus:border-danger'
              : 'border-line focus:border-primary focus:ring-2 focus:ring-primary-light/30',
            className ?? '',
          ].join(' ')}
          {...rest}
        >
          {children}
        </select>
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-ink-light">{hint}</span>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
