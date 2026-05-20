import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, error, hint, id, className, ...rest }, ref) => {
    const tid = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={tid} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={tid}
          className={[
            'min-h-[96px] rounded-xl border bg-white px-3 py-2.5 text-[15px] outline-none transition-all placeholder:text-ink-light',
            error
              ? 'border-danger focus:border-danger'
              : 'border-line focus:border-primary focus:ring-2 focus:ring-primary-light/30',
            className ?? '',
          ].join(' ')}
          {...rest}
        />
        {error ? (
          <span className="text-xs font-medium text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-ink-light">{hint}</span>
        ) : null}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
export default TextArea;
