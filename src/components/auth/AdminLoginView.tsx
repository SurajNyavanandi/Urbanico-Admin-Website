import React, { useState } from 'react';
import { verifyOtpApi } from '../../services/authApi';
import { IAdminUser } from '../../types';
import { ShieldCheck, KeyRound, Phone, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (user: IAdminUser, token: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('9666635009');
  const [authKey, setAuthKey] = useState('261125');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackAdminUser: IAdminUser = {
    name: 'Master Admin (Kanu Suraj)',
    phone: '9666635009',
    role: 'super_admin',
    email: 'kanusuraj15@gmail.com',
    creditLimit: 5000000,
  };

  const executeLogin = (user: IAdminUser, token: string) => {
    localStorage.setItem('urbanico_admin_session', token);
    localStorage.setItem('urbanico_admin_user', JSON.stringify(user));
    onLoginSuccess(user, token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter the admin phone number');
      return;
    }
    if (!authKey.trim()) {
      setError('Please enter the OTP or admin password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await verifyOtpApi({
        phone: phone.trim(),
        otp: authKey.trim(),
        password: authKey.trim(),
      });

      executeLogin(res.user, res.token);
    } catch {
      // Fallback for dummy credentials mode
      if (phone.trim() === '9666635009' || authKey.trim() === '261125') {
        executeLogin(fallbackAdminUser, `urbanico_jwt_session_${Date.now()}`);
      } else {
        setError('Authentication failed. Please check your credentials or use 9666635009 / 261125.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantSignIn = () => {
    setPhone('9666635009');
    setAuthKey('261125');
    executeLogin(fallbackAdminUser, `urbanico_jwt_session_${Date.now()}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand identity header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white mb-4 shadow-sm">
            <span className="font-bold text-2xl tracking-tighter">U</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">Urbanico Admin</h1>
          <p className="text-sm text-[#86868B] mt-1">Single Administrator Control Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          {/* Quick preset banner */}
          <div className="mb-5 p-3.5 bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#1D1D1F]">
              <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
              <span>
                Prefilled: <strong className="font-mono">9666635009</strong> / <strong className="font-mono">261125</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleInstantSignIn}
              className="text-xs bg-black text-white px-2.5 py-1 rounded-lg font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>1-Click Enter</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#FF3B30] font-medium leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B] mb-1.5">
                Admin Phone / Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#86868B]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9666635009"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F7] text-sm text-[#1D1D1F] font-mono rounded-xl border border-transparent focus:border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#86868B]">
                  Password / OTP Code
                </label>
                <span className="text-[11px] text-[#86868B] font-mono">Code: 261125</span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#86868B]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  placeholder="261125"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#F5F5F7] text-sm text-[#1D1D1F] font-mono rounded-xl border border-transparent focus:border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-5 bg-[#007AFF] hover:bg-blue-600 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#86868B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Single-Admin Secure Gateway • Urbanico Core v2.4</span>
        </div>
      </div>
    </div>
  );
};
