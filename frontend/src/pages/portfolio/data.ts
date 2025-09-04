import {
  Monitor, Printer, Clock, Settings,
  TrendingUp, CheckCircle, Play,
  Users, Shield, Zap
} from 'lucide-react';

export const quickStats = [
  {
    title: 'Active Printers',
    value: '3',
    change: '+1',
    icon: Printer,
    color: 'blue',
    trend: 'up'
  },
  {
    title: 'Projects Complete',
    value: '847',
    change: '+12%',
    icon: CheckCircle,
    color: 'green',
    trend: 'up'
  },
  {
    title: 'Print Hours',
    value: '2,340',
    change: '+8%',
    icon: Clock,
    color: 'purple',
    trend: 'up'
  },
  {
    title: 'Success Rate',
    value: '96.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'orange',
    trend: 'up'
  }
];

export const features = [
  {
    icon: Monitor,
    title: 'Real-time Monitoring',
    description: 'Live temperature tracking, print progress, and system status monitoring.',
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Enterprise-grade security with role-based access control and audit logging.',
    color: 'green'
  },
  {
    icon: Zap,
    title: 'Performance Analytics',
    description: 'Detailed insights into print quality, material usage, and system performance.',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Collaborative workspace with project management and team coordination.',
    color: 'orange'
  }
];

export const recentActivity = [
  {
    id: 1,
    type: 'print_completed',
    title: 'Phone Case v2 print completed successfully',
    time: '2 minutes ago',
    status: 'success',
    icon: Printer
  },
  {
    id: 2,
    type: 'maintenance',
    title: 'Printer #1 maintenance scheduled',
    time: '15 minutes ago',
    status: 'info',
    icon: Settings
  },
  {
    id: 3,
    type: 'print_started',
    title: 'Dragon Miniature print started',
    time: '1 hour ago',
    status: 'info',
    icon: Play
  }
];