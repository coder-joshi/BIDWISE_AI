import { forwardRef } from 'react'
import { clsx } from 'clsx'

export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, iconRight: IconRight, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gem-white/80 mb-1.5 font-body">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Icon size={16} className="text-gem-muted" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input-base',
            Icon && 'pl-10',
            IconRight && 'pr-10',
            error && 'border-gem-red/60 focus:ring-gem-red',
            className
          )}
          {...props}
        />
        {IconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {IconRight}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-gem-red font-body">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gem-muted font-body">{hint}</p>}
    </div>
  )
})

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gem-white/80 mb-1.5 font-body">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'input-base appearance-none',
          error && 'border-gem-red/60',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-gem-red font-body">{error}</p>}
    </div>
  )
}
