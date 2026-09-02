import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const variants = {
  primary:   'bg-white hover:bg-white/90 text-black shadow-sm border border-transparent',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20',
  ghost:     'bg-transparent hover:bg-white/5 text-gem-muted hover:text-white border border-transparent',
  danger:    'bg-gem-red/10 hover:bg-gem-red/20 text-gem-red border border-gem-red/20',
  success:   'bg-gem-green/10 hover:bg-gem-green/20 text-gem-green-light border border-gem-green/20',
  outline:   'bg-transparent border border-white/10 text-white hover:bg-white/5',
}

const sizes = {
  sm:  'px-4 py-2 text-xs gap-1.5',
  md:  'px-5 py-2.5 text-sm gap-2',
  lg:  'px-6 py-3 text-sm gap-2.5',
  xl:  'px-8 py-4 text-base gap-3',
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
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-display font-medium rounded-full',
        'transition-colors duration-200 cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
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
    </motion.button>
  )
}
