import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';

interface RegisterProps {
  authForm: { name: string; email: string; password: string };
  setAuthForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; password: string }>>;
  handleRegister: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  switchToLogin: () => void;
  isValidEmail: boolean;
  isValidPassword: boolean;
}

const Register: React.FC<RegisterProps> = ({
  authForm,
  setAuthForm,
  handleRegister,
  loading,
  error,
  switchToLogin,
  isValidEmail,
  isValidPassword
}) => {
  return (
    <motion.div
      key="register"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Join Community</h2>
        <p className="text-black/50">Create an account to start reserving</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
            Full Name
          </label>
          <input
            type="text"
            required
            className="w-full px-5 py-4 bg-black/5 rounded-2xl border-none focus:ring-2 focus:ring-black transition-all"
            placeholder="John Doe"
            value={authForm.name}
            onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
          />
        </div>

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
          {(!isValidEmail && authForm.email) && <p className="text-xs text-red-400 font-medium">
            Please enter a valid email address
          </p>}
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
          <p className={`text-xs ${isValidPassword || !authForm.password ? 'text-black/40' : 'text-red-400'} font-medium`}>
            Use at least 8 characters including one uppercase letter, number, and symbol
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          disabled={loading || !isValidPassword}
          className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-black/80 transition-all disabled:opacity-50 shadow-xl shadow-black/10 cursor-pointer"
        >
          {loading ? 'Processing...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={switchToLogin}
          className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          Already have an account? Sign in
        </button>
      </div>
    </motion.div>
  );
};

export default Register;