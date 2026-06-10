import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, LogIn, ShieldAlert, Sparkles, Key } from 'lucide-react';
import { UserRole } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (role: UserRole) => void;
  triggerSystemNotification: (message: string) => void;
}

export default function AdminLogin({ onLoginSuccess, triggerSystemNotification }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper dictionary with verified administrative accounts
  const demoAccounts = [
    { username: 'feelzonebd@gmail.com', password: 'feelzonebd0011', label: 'Super Admin', desc: 'সকল ফিচার ও সেটিংসের নিয়ন্ত্রণ' },
    { username: 'manager', password: 'feelzonemanager', label: 'Store Manager', desc: 'স্টক, ইনভেন্টরি ও ডেলিভারি নিয়ন্ত্রণ' },
    { username: 'sales', password: 'feelzonesales', label: 'Sales Staff', desc: 'শুধু POS অর্ডার জেনারেটর এক্সেস' }
  ];

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    if (!username.trim() || !password.trim()) {
      setErrorStatus('দয়া করে ইউজারনেম এবং পাসওয়ার্ড উভয়ই পূরণ করুন!');
      return;
    }

    setIsSubmitting(true);

    // Simulate safe secure network authentication
    setTimeout(() => {
      const match = demoAccounts.find(
        acc => acc.username.toLowerCase() === username.toLowerCase().trim() && acc.password === password
      );

      if (match) {
        triggerSystemNotification(`✅ সফল লগইন! স্বাগতম, ${match.label}।`);
        onLoginSuccess(match.label as UserRole);
      } else {
        setErrorStatus('দুঃখিত! ভুল ইউজারনেম অথবা পাসওয়ার্ড প্রদান করেছেন। আবার চেষ্টা করুন।');
        triggerSystemNotification('⚠️ ভুল অ্যাডমিন লগইন চেষ্টা চিহ্নিত করা হয়েছে!');
      }
      setIsSubmitting(false);
    }, 700);
  };

  const handleQuickFill = (acc: typeof demoAccounts[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorStatus(null);
    triggerSystemNotification(`📝 ডেমো অ্যাক্সেস লোড হয়েছে: ${acc.label}`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-zinc-950">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10"
        id="admin-login-card"
      >
        {/* Aesthetic top lock header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-500/15 to-indigo-500/15 border border-teal-500/20 text-teal-400 mb-2">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">অফিসিয়াল অ্যাডমিন লগইন</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            বিলিং, ডেলিভারি, ইনভেন্টরি ও কাস্টমার ফ্রন্ট ও POS সেলস মনিটর করতে নিচে আপনার অফিসিয়াল ইউজার ও পাসওয়ার্ড দিয়ে প্রবেশ করুন।
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorStatus && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorStatus}</span>
          </motion.div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 select-none block" htmlFor="username-input">
              ইমেইল / ইউজারনেম (Email / Username)
            </label>
            <div className="relative">
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="feelzonebd@gmail.com"
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-teal-500 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono"
                disabled={isSubmitting}
                autoFocus
              />
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 select-none block" htmlFor="password-input">
              লগইন পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-teal-500 rounded-xl py-3 pl-11 pr-11 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-mono"
                disabled={isSubmitting}
              />
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 font-bold text-sm text-zinc-950 rounded-xl py-3 flex.5 tracking-wide shadow-lg shadow-teal-500/10 cursor-pointer disabled:opacity-50 select-none flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-zinc-950" />
                <span>নিরাপদ লগইন সম্পন্ন করুন</span>
              </>
            )}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
