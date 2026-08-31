import { clsx } from 'clsx'
import { CheckCircle2, XCircle, Clock, AlertTriangle, Info, ShieldCheck } from 'lucide-react'

const variants = {
  verified:   { class: 'badge-verified', Icon: CheckCircle2 },
  failed:     { class: 'badge-failed',   Icon: XCircle },
  pending:    { class: 'badge-pending',  Icon: Clock },
  warning:    { class: 'badge-pending',  Icon: AlertTriangle },
  info:       { class: 'badge-info',     Icon: Info },
  processing: { class: 'badge-info',     Icon: ShieldCheck },
  muted:      { class: 'badge-muted',    Icon: null },
}

export function Badge({ variant = 'muted', label, icon: CustomIcon, className = '' }) {
  const { class: cls, Icon } = variants[variant] || variants.muted
  const IconComponent = CustomIcon || Icon
  return (
    <span className={clsx(cls, className)}>
      {IconComponent && <IconComponent size={11} />}
      {label}
    </span>
  )
}

export function RiskBadge({ score }) {
  if (score <= 30) return <Badge variant="verified" label={`Low Risk · ${score}`} />
  if (score <= 60) return <Badge variant="warning" label={`Medium Risk · ${score}`} />
  return <Badge variant="failed" label={`High Risk · ${score}`} />
}

export function StatusBadge({ status }) {
  const map = {
    verified:   'verified',
    failed:     'failed',
    pending:    'pending',
    processing: 'processing',
  }
  const labels = {
    verified:   'Verified',
    failed:     'Failed',
    pending:    'Pending',
    processing: 'Processing',
  }
  return <Badge variant={map[status] || 'muted'} label={labels[status] || status} />
}
