import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, KeyRound, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@brokerage.ae');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/clients');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrefill = (prefillEmail: string) => {
    setEmail(prefillEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col items-center justify-center p-4">
      {/* Brand Icon & Heading */}
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-[8px] bg-[#004080] text-white flex items-center justify-center mx-auto mb-3 card-shadow">
          <Building2 size={24} strokeWidth={1.75} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080]">
          Emirates Advisory & Asset Brokerage
        </p>
      </div>

      {/* Centred white card */}
      <div
        id="login-card"
        className="w-full max-w-md bg-white rounded-[8px] border border-[#DDE3EC] card-shadow p-8"
      >
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-semibold text-[#101828]">
            Access Portal
          </h1>
          <p className="text-sm text-[#5C6880] mt-1">
            Sign in to your advisory brokerage CRM account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                strokeWidth={1.75}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6880]"
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advisor@brokerage.ae"
                className="w-full bg-white text-[#101828] text-sm pl-9 pr-3 py-2.5 rounded-[6px] border border-[#DDE3EC] focus:outline-hidden focus:border-[#004080] focus:ring-1 focus:ring-[#004080] transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#004080] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                strokeWidth={1.75}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6880]"
              />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white text-[#101828] text-sm pl-9 pr-3 py-2.5 rounded-[6px] border border-[#DDE3EC] focus:outline-hidden focus:border-[#004080] focus:ring-1 focus:ring-[#004080] transition-colors"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#004080] hover:bg-[#003060] text-white text-sm font-semibold py-2.5 px-4 rounded-[6px] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span>Authorizing Session...</span>
            ) : (
              <>
                <KeyRound size={16} strokeWidth={1.75} />
                <span>Enter Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#DDE3EC] pt-4">
          <p className="text-xs text-[#5C6880]">
            Demo login —{' '}
            <span className="font-mono text-[#004080] font-medium">
              demo@brokerage.ae / demo123
            </span>
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handlePrefill('demo@brokerage.ae')}
              className="text-[11px] px-2 py-1 bg-[#F0F4F9] text-[#004080] hover:bg-[#E7EEF7] rounded font-medium border border-[#DDE3EC]"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handlePrefill('manager@brokerage.ae')}
              className="text-[11px] px-2 py-1 bg-[#F0F4F9] text-[#004080] hover:bg-[#E7EEF7] rounded font-medium border border-[#DDE3EC]"
            >
              Manager Demo
            </button>
            <button
              type="button"
              onClick={() => handlePrefill('agent@brokerage.ae')}
              className="text-[11px] px-2 py-1 bg-[#F0F4F9] text-[#004080] hover:bg-[#E7EEF7] rounded font-medium border border-[#DDE3EC]"
            >
              Agent Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
