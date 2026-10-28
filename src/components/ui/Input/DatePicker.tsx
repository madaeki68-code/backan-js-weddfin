import React, { forwardRef, useId } from 'react';
import { Calendar } from 'lucide-react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      wrapperClassName = '',
      disabled,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const dateInputId = id || generatedId;

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={dateInputId} className="text-xs font-bold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
          <input
            ref={ref}
            type="date"
            id={dateInputId}
            disabled={disabled}
            className={`w-full bg-white text-slate-800 text-sm font-medium rounded-xl border pl-9 pr-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-300'
            } ${className}`}
            {...rest}
          />
        </div>
        {error ? (
          <p className="text-[11px] font-semibold text-red-600 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
