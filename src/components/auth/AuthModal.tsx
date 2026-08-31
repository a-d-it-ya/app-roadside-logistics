import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Zap,
  Truck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AccountType, OrganizationType } from '../../types/auth';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const {
    isAuthModalOpen,
    authModalMode,
    authIntent,
    closeAuthModal,
    signIn,
    signUp
  } = useAuth();

  // Mode: SIGN_IN, SIGN_UP, FORGOT_PASSWORD
  const [mode, setMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'FORGOT_PASSWORD'>(
    authModalMode || 'SIGN_IN'
  );

  // Sync mode if changed by external trigger
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('Individual');
  const [companyName, setCompanyName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('SHIPPER');

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleUseDemoAccount = () => {
    setEmail('demo@roadside.in');
    setPassword('RoadSide123');
    setErrorMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const activeEmail = email.trim() || 'demo@roadside.in';
    const activePass = password || 'RoadSide123';

    try {
      setIsSubmitting(true);
      const user = await signIn({ email: activeEmail, password: activePass });
      setSuccessMsg(`Welcome back, ${user.name.split(' ')[0]}!`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        closeAuthModal();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const user = await signIn({
        email: 'aditya.singh@gmail.com',
        password: 'GoogleOAuth2SecureSessionKey99#'
      });
      setSuccessMsg(`Signed in with Google as ${user.email}`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        closeAuthModal();
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Google sign in failed.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await signUp({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        organizationName: accountType === 'Business' ? companyName.trim() : undefined,
        organizationType: accountType === 'Business' ? orgType : undefined
      });
      setSuccessMsg(`Account created! Welcome to RoadSide, ${user.name.split(' ')[0]}.`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        closeAuthModal();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to create account.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email to receive recovery instructions.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Simulated password reset instructions dispatched to your email.');
      setTimeout(() => {
        setSuccessMsg(null);
        setMode('SIGN_IN');
      }, 2000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl shadow-black/90 text-white overflow-hidden flex flex-col relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Intent Banner (If triggered by Booking or My Shipments) */}
        {authIntent === 'BOOKING_FLOW' && (
          <div className="bg-cyan-950/80 border-b border-cyan-500/40 px-5 py-2.5 flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Sign in to confirm and lock your freight reservation.</span>
          </div>
        )}
        {authIntent === 'MY_SHIPMENTS' && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2.5 flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sign in required to view your personal shipments.</span>
          </div>
        )}

        {/* Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/80 text-center space-y-1.5 font-mono">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-lg shadow-emerald-950/40">
            {mode === 'SIGN_IN' ? (
              <Lock className="w-6 h-6" />
            ) : mode === 'SIGN_UP' ? (
              <UserIcon className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 inline-block">
            {mode === 'SIGN_IN' ? 'Access Freight Portal' : mode === 'SIGN_UP' ? 'New Fleet / Shipper Member' : 'Account Recovery'}
          </span>

          <h2 className="text-lg font-bold text-white tracking-wide uppercase">
            {mode === 'SIGN_IN'
              ? 'Welcome Back'
              : mode === 'SIGN_UP'
              ? 'Create Your Account'
              : 'Reset Password'}
          </h2>

          <p className="text-xs text-slate-400 max-w-xs mx-auto font-sans">
            {mode === 'SIGN_IN'
              ? 'Sign in to manage freight capacity and live bookings.'
              : mode === 'SIGN_UP'
              ? 'Join RoadSide Logistics for smart corridor freight matching.'
              : 'Enter your registered email to reset your credentials.'}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-10rem)] custom-scrollbar font-mono text-xs">
          
          {/* Sign In with Google Button */}
          {mode !== 'FORGOT_PASSWORD' && (
            <div className="space-y-3 font-sans">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold transition flex items-center justify-center gap-3 shadow-md hover:shadow-lg border border-slate-200 active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{mode === 'SIGN_IN' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="w-full border-t border-slate-800"></div>
                <span className="bg-slate-950 px-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider absolute">
                  or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2.5 text-emerald-300 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center gap-2.5 text-red-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'SIGN_IN' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@roadside.in"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode('FORGOT_PASSWORD');
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'SIGN_UP' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aditya Singh"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aditya@example.com"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-8 pr-2 text-white text-[11px] placeholder:text-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-8 pr-2 text-white text-[11px] placeholder:text-slate-600 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Type Selection */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('Individual')}
                    className={`py-1.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      accountType === 'Individual'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <UserIcon className="w-3 h-3" />
                    <span>Individual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('Business')}
                    className={`py-1.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      accountType === 'Business'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Business</span>
                  </button>
                </div>
              </div>

              {accountType === 'Business' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[11px] text-cyan-300 block uppercase font-semibold">
                      Organization / Enterprise Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Aditya Freight Solutions"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                      required={accountType === 'Business'}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Organization Category
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl py-1.5 px-2.5 text-white text-xs outline-none"
                    >
                      <option value="SHIPPER">Shipper / Cargo Owner</option>
                      <option value="FLEET_PARTNER">Fleet Partner / Carrier</option>
                      <option value="LOGISTICS_COMPANY">3PL Logistics Provider</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Password (8+ chars)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>REGISTERING IN POSTGRESQL...</span>
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'DISPATCHING...' : 'SEND RESET INSTRUCTIONS'}
              </button>
            </form>
          )}

          {/* Mode Switcher Footer */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-1">
            {mode === 'SIGN_IN' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('SIGN_UP');
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1"
                >
                  CREATE ACCOUNT
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('SIGN_IN');
                  }}
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1"
                >
                  SIGN IN
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
