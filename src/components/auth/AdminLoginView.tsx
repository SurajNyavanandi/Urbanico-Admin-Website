import React, { useState } from 'react';
import { verifyOtpApi } from '../../services/authApi';
import { IAdminUser } from '../../types';
import { ShieldCheck, HardHat } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: (user: IAdminUser, token: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('9666635009');
  const [authKey, setAuthKey] = useState('9666635009');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeLogin = (user: IAdminUser, token: string) => {
    localStorage.setItem('urbanico_admin_session', token);
    localStorage.setItem('urbanico_admin_user', JSON.stringify(user));
    onLoginSuccess(user, token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter the phone number');
      return;
    }
    if (!authKey.trim()) {
      setError('Please enter the OTP/Password');
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-zinc-50">
      <div className="w-full max-w-[420px] bg-[#18181B] border border-[#3F3F46] rounded-xl p-8 shadow-2xl flex flex-col items-center">
        
        {/* Brand Lockup */}
        <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center text-zinc-950 font-black mb-6 shadow-lg shadow-yellow-500/20">
          <HardHat className="w-8 h-8 text-zinc-950" />
        </div>
        
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 mb-2">
            Urbanico Admin
          </h1>
          <p className="text-sm font-normal text-zinc-400">
            Civil & Construction Procurement Portal
          </p>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400 text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Admin Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Admin Phone"
                  className="w-full h-11 px-4 bg-[#27272A] text-sm text-zinc-100 rounded-lg border border-[#3F3F46] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  OTP / Security Password
                </label>
                <input
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  placeholder="OTP / Password"
                  className="w-full h-11 px-4 bg-[#27272A] text-sm text-zinc-100 rounded-lg border border-[#3F3F46] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 px-6 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.98] text-zinc-950 text-sm font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-950" />
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-[#3F3F46] w-full text-center">
          <p className="text-xs text-zinc-500 font-normal">
            Single-Admin Secure Gateway • Urbanico Core v2.4
          </p>
        </div>
      </div>
    </div>
  );
};


