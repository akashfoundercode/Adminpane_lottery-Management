import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgent } from '../context/AgentContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Lock, User, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { FieldError } from '../components/ui/FieldError';

export const Login: React.FC = () => {
  const { login } = useAgent();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ agentId?: string; password?: string; form?: string }>({});

  const validate = () => {
    const nextErrors = {
      agentId: agentId.trim() ? undefined : 'Agent ID or mobile number is required.',
      password: password.trim() ? undefined : 'Password is required.'
    };
    setErrors(nextErrors);
    return !nextErrors.agentId && !nextErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const success = await login(agentId.trim(), password);
      if (success) {
        showToast('Welcome back, Rajesh!', 'success');
        navigate('/agent/dashboard');
      } else {
        setErrors({ form: 'Invalid Agent ID or Password.' });
      }
    } catch (err) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex flex-col md:flex-row">
      {/* LEFT PANEL: Abstract Premium Branding Banner */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-brand-emerald to-emerald-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Top Header Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white text-brand-emerald flex items-center justify-center font-bold text-xl font-display shadow-lg">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold font-display leading-none">LuckyDraw</h1>
            <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
              Management System
            </span>
          </div>
        </div>

        {/* Center Promotion Text */}
        <div className="my-auto relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm">
              v2.0 Agent Release
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-display leading-tight mt-4">
              Empowering Agents, Simplifying Sales.
            </h2>
            <p className="text-base text-white/80 mt-4 leading-relaxed font-light">
              Manage your assigned lottery books, track real-time sold/unsold distributions, and view winning ticket results through our high-performance SaaS workspace.
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-2 text-xs text-white/60 relative z-10">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured with SSL 256-bit encryption</span>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:w-1/2">
        <div className="w-full max-w-md bg-white border border-border-light rounded-2xl shadow-xl p-8 relative">
          <div className="text-center md:text-left mb-6">
            <h3 className="text-2xl font-bold font-display text-text-primary">Agent Portal</h3>
            <p className="text-sm text-text-secondary mt-1">
              Manage your assigned books, sales and winning tickets.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="agentId" className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
                Agent ID / Mobile Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="agentId"
                  type="text"
                  value={agentId}
                  onChange={(e) => { setAgentId(e.target.value); setErrors(prev => ({ ...prev, agentId: undefined, form: undefined })); }}
                  onBlur={() => setErrors(prev => ({ ...prev, agentId: agentId.trim() ? undefined : 'Agent ID or mobile number is required.' }))}
                  aria-invalid={Boolean(errors.agentId)}
                  placeholder="e.g. AG1001"
                  className={`w-full pl-10 pr-4 py-2.5 bg-bg-app border rounded-xl text-sm text-text-primary placeholder-gray-400 focus:outline-none focus:border-brand-emerald transition-colors ${errors.agentId ? 'border-rose-400' : 'border-border-light'}`}
                  required={false}
                />
              </div>
              <FieldError message={errors.agentId} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Demo Password is: 123456', 'info')}
                  className="text-xs font-semibold text-brand-emerald hover:text-brand-emerald-hover cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined, form: undefined })); }}
                  onBlur={() => setErrors(prev => ({ ...prev, password: password.trim() ? undefined : 'Password is required.' }))}
                  aria-invalid={Boolean(errors.password)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-bg-app border border-border-light rounded-xl text-sm text-text-primary placeholder-gray-400 focus:outline-none focus:border-brand-emerald transition-colors"
                  required={false}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-0.5 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <FieldError message={errors.form} />

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border-light text-brand-emerald focus:ring-brand-emerald accent-brand-emerald"
                />
                <span className="text-xs font-medium text-text-secondary">Remember Me</span>
              </label>
            </div>

            {/* Login Trigger */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand-emerald hover:bg-brand-emerald-hover disabled:bg-emerald-300 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-brand-emerald/10 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login Securely</span>
              )}
            </button>
          </form>

          {/* Demo Credentials Info Panel */}
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-border-light space-y-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-emerald" />
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Demo Credentials
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-text-secondary">Agent ID:</p>
                <p className="font-mono font-semibold text-text-primary bg-white px-2 py-0.5 rounded border border-border-light inline-block">
                  AG1001
                </p>
              </div>
              <div>
                <p className="text-text-secondary">Password:</p>
                <p className="font-mono font-semibold text-text-primary bg-white px-2 py-0.5 rounded border border-border-light inline-block">
                  123456
                </p>
              </div>
            </div>
            <p className="text-[10px] text-text-secondary italic">
              * Note: Logged in agent will be Rajesh Kumar (First Party Agent).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
