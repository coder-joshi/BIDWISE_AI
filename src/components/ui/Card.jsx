import { clsx } from 'clsx'

export function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <div
      className={clsx(
        hover ? 'glass-card-hover' : 'glass-card',
        glow && 'shadow-gem-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-white/6', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4 border-t border-white/6', className)}>
      {children}
    </div>
  )
}
