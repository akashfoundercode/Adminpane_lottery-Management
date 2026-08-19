import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { adminLogin } = useAdmin();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const success = await adminLogin(email, password);
      if (success) {
        showToast('Login successful. Welcome Admin!', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast('Invalid credentials. Use admin@gmail.com / admin123.', 'error');
      }
    } catch (err) {
      showToast('An error occurred during login.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-gradient-to-tr from-[#1e1b4b]/10 via-[#F0F2F5] to-[#6366f1]/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* LOGO SHAPE */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4 animate-bounce">
          <Sparkles className="w-7 h-7 text-indigo-100" />
        </div>
        <h2 className="text-center font-display font-extrabold text-3xl text-text-primary tracking-tight">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-xs text-text-secondary font-medium tracking-wide">
          LOTTERY & LUCKY DRAW MANAGEMENT SYSTEM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-border-light shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* EMAIL FIELD */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary uppercase tracking-wide">
                Email address
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="admin@gmail.com"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-primary uppercase tracking-wide">
                Password
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-text-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* DEMO CREDENTIALS HELPER */}
            <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3 text-[11px] text-indigo-700 leading-normal">
              <span className="font-bold uppercase tracking-wider block mb-1">Demo Credentials:</span>
              <div className="flex justify-between">
                <span>Email: <strong className="font-semibold select-all">admin@gmail.com</strong></span>
                <span>Pass: <strong className="font-semibold select-all">admin123</strong></span>
              </div>
            </div>

            {/* SIGN IN BUTTON */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-semibold text-white bg-[#6366f1] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
