import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../auth/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2, AlertCircle, Sparkles } from 'lucide-react';

type Mode = 'signin' | 'signup';

export function AuthModal({
  open,
  onClose,
  initialMode = 'signin',
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setPassword('');
    }
  }, [open, initialMode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email.trim(), password, fullName.trim() || email.split('@')[0]);
        if (error) setError(error);
        else onClose();
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) setError(error);
        else onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white mb-3 shadow-glow">
          <Sparkles size={22} />
        </div>
        <h2 className="text-xl font-bold text-ink">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {mode === 'signin' ? 'Sign in to use every tool on Allin1.' : "It's free. Sign up to unlock all tools."}
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700 animate-slide-up">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="label" htmlFor="auth-name">Full name</label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="input pl-9"
                autoComplete="name"
              />
            </div>
          </div>
        )}
        <div>
          <label className="label" htmlFor="auth-email">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input pl-9"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="auth-pw">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="auth-pw"
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-9 pr-10"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <Loader2 size={18} className="animate-spin" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </Modal>
  );
}
