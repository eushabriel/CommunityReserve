import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';

interface LoginProps {
  authForm: { email: string; password: string };
  setAuthForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>;
  handleLogin: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  switchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({
  authForm,
  setAuthForm,
  handleLogin,
  loading,
  error,
  switchToRegister,
}) => {
  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
        <p className="text-black/50">Sign in to manage your bookings</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
            Email Address
          </label>
          <input
            type="email"
            required
            className="w-full px-5 py-4 bg-black/5 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all"
            placeholder="name@example.com"
            value={authForm.email}
            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
            Password
          </label>
          <input
            type="password"
            required
            className="w-full px-5 py-4 bg-black/5 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all"
            placeholder="••••••••"
            value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
          />
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-black/80 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {loading ? 'Processing...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={switchToRegister}
          className="text-sm font-medium text-black/60 hover:text-black transition-colors"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </motion.div>
  );
};

export default Login;