import { motion } from 'framer-motion';
import { useAnimations } from '../../../../hooks/useAnimations';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

type StatusType = 'good' | 'warn' | 'bad' | 'pending';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  pulse?: boolean;
}

const statusConfig = {
  good: {
    icon: CheckCircle,
    color: 'var(--good)',
    bgColor: 'rgba(55, 214, 122, 0.1)',
    label: 'Good'
  },
  warn: {
    icon: AlertTriangle,
    color: 'var(--warn)',
    bgColor: 'rgba(245, 166, 35, 0.1)',
    label: 'Warning'
  },
  bad: {
    icon: XCircle,
    color: 'var(--bad)',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    label: 'Error'
  },
  pending: {
    icon: Clock,
    color: 'var(--muted)',
    bgColor: 'rgba(127, 182, 230, 0.1)',
    label: 'Pending'
  }
};

export default function StatusIndicator({
  status,
  label,
  size = 'md',
  showIcon = true,
  showLabel = true,
  pulse = false
}: StatusIndicatorProps) {
  const { statusIndicator, pulseAnimation } = useAnimations();
  const config = statusConfig[status];
  const Icon = config.icon;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return { container: 'p-xs gap-xs text-sm', icon: 16 };
      case 'lg': return { container: 'p-md gap-sm text-lg', icon: 24 };
      default: return { container: 'p-sm gap-sm', icon: 20 };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <motion.div
      {...statusIndicator(status === 'pending' ? 'good' : status)}
      {...(pulse ? pulseAnimation : {})}
      className={`inline-flex items-center rounded-lg ${sizeClasses.container}`}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}20`
      }}
    >
      {showIcon && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: pulse ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 0.5, repeat: pulse ? Infinity : 0, repeatDelay: 2 }}
        >
          <Icon size={sizeClasses.icon} />
        </motion.div>
      )}
      {showLabel && (
        <span className="font-medium">
          {label || config.label}
        </span>
      )}
    </motion.div>
  );
}