import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export function Card({ children, className = '', hover = false, glow = false, ...props }) {
  const Comp = hover ? motion.div : 'div'
  
  const hoverProps = hover ? {
    whileHover: { scale: 1.01, translateY: -2 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {}

  return (
    <Comp
      className={clsx(
        hover ? 'glass-card-hover' : 'glass-card',
        glow && 'shadow-gem-glow',
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-white/5', className)}>
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
    <div className={clsx('px-6 py-4 border-t border-white/5', className)}>
      {children}
    </div>
  )
}
