import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LogIn, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, 
  AlertCircle, Monitor, Shield, Zap
} from 'lucide-react';
import { useAuthStore } from '../shared/store/authStore';

function sanitizeInput(v: string) { return v.replace(/[<>"'`]/g, '').trim(); }

const features = [
  {
    icon: Monitor,
    title: 'Remote Control',
    description: 'Control your 3D printer from anywhere'
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Enterprise-grade security and encryption'
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Live monitoring and instant notifications'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[\w.-]+@[\w-]+(?:\.[\w-]+)+$/;
    return re.test(email);
  };

  const authLogin = useAuthStore(s => s.login);
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    if (!validateEmail(email)) {
      setStatus('error');
      setError('Please enter a valid email address.');
      return;
    }

    const ok = await authLogin(sanitizeInput(email).toLowerCase(), password);
    if (ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Branding & Features */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-blue-800/20" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              3D Printer Control System
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Professional remote monitoring and control for your 3D printing workflow.
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        className="flex-1 lg:w-1/2 flex items-center justify-center px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md">
          <motion.div 
            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl"
            variants={itemVariants}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                <LogIn className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to access your printer control panel</p>
            </div>

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 disabled:border-blue-500/30 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'error' && error && (
              <motion.div 
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div 
                className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300 text-sm">Successfully signed in!</p>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Branding */}
          <motion.div 
            className="lg:hidden text-center mt-8"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              3D Printer Control System
            </h3>
            <p className="text-slate-400">
              Professional remote monitoring and control
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
