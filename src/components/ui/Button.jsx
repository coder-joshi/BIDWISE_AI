import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-gem-blue hover:bg-blue-600 text-white shadow-sm hover:shadow-gem-glow border border-gem-blue/50',
  secondary: 'bg-white/10 hover:bg-white/15 text-gem-white border border-white/15 hover:border-white/25',
  ghost:     'bg-transparent hover:bg-white/8 text-gem-muted hover:text-gem-white border border-transparent',
  danger:    'bg-gem-red/15 hover:bg-gem-red/25 text-gem-red border border-gem-red/30',
  success:   'bg-gem-green/15 hover:bg-gem-green/25 text-gem-green-light border border-gem-green/30',
  outline:   'bg-transparent border border-gem-border-dark text-gem-white hover:bg-white/5',
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2.5 text-sm gap-2',
  lg:  'px-6 py-3 text-base gap-2.5',
  xl:  'px-8 py-4 text-lg gap-3',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-body font-medium rounded-lg',
        'transition-all duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gem-blue-light',
        'select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      )}
    </button>
  )
}
