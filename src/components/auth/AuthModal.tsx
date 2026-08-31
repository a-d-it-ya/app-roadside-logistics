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
  Truck,
  FileBadge2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, OrganizationType, User } from '../../types/auth';

interface AuthModalProps {
  onSuccess?: (user?: User) => void;
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

  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Role selector: BUSINESS vs DRIVER
  const [userRole, setUserRole] = useState<UserRole>('BUSINESS');
  
  // Business fields
  const [companyName, setCompanyName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('SHIPPER');

  // Driver fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleUseDemoAccount = (role: 'BUSINESS' | 'DRIVER' = 'BUSINESS') => {
    if (role === 'DRIVER') {
      setEmail('driver.suresh@roadside.in');
      setPassword('RoadSide123');
    } else {
      setEmail('demo@roadside.in');
      setPassword('RoadSide123');
    }
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
        if (onSuccess) onSuccess(user);
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
        email: userRole === 'DRIVER' ? 'driver.suresh@gmail.com' : 'aditya.singh@gmail.com',
        password: 'GoogleOAuth2SecureSessionKey99#'
      });
      setSuccessMsg(`Signed in with Google as ${user.email}`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        closeAuthModal();
        if (onSuccess) onSuccess(user);
      }, 600);
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
    if (userRole === 'BUSINESS' && !companyName.trim()) {
      setErrorMsg('Please enter your business or company name.');
      return;
    }
    if (userRole === 'DRIVER' && !licenseNumber.trim()) {
      setErrorMsg('Please enter your Commercial Driver License Number.');
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
        userRole,
        organizationName: userRole === 'BUSINESS' ? companyName.trim() : undefined,
        organizationType: userRole === 'BUSINESS' ? orgType : undefined,
        licenseNumber: userRole === 'DRIVER' ? licenseNumber.trim() : undefined,
        assignedVehicleReg: userRole === 'DRIVER' ? (vehicleReg.trim() || 'AP 31 TT 5510') : undefined,
      });
      setSuccessMsg(`Account created! Welcome to RoadSide, ${user.name.split(' ')[0]}.`);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMsg(null);
        closeAuthModal();
        if (onSuccess) onSuccess(user);
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800/90 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative text-white animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Intent Banner */}
        {authIntent === 'BOOKING_FLOW' && (
          <div className="bg-cyan-950/80 border-b border-cyan-500/40 px-5 py-2.5 flex items-center gap-2 text-xs font-mono text-cyan-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Sign in to confirm and lock your freight reservation.</span>
          </div>
        )}
        {authIntent === 'DRIVER_DASHBOARD' && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2.5 flex items-center gap-2 text-xs font-mono text-emerald-300">
            <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sign in as a Commercial Driver to access your In-Cab Cockpit.</span>
          </div>
        )}

        {/* Top Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-slate-900/90 to-slate-950 border-b border-slate-800/80 text-center space-y-1.5 font-mono">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-lg shadow-emerald-950/40">
            {mode === 'SIGN_IN' ? (
              <Lock className="w-6 h-6" />
            ) : mode === 'SIGN_UP' ? (
              userRole === 'DRIVER' ? <Truck className="w-6 h-6" /> : <Building2 className="w-6 h-6" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 inline-block">
            {mode === 'SIGN_IN' ? 'Access Freight Portal' : mode === 'SIGN_UP' ? 'Choose Your Account Type' : 'Account Recovery'}
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
              ? 'Sign in to access your business freight or driver dashboard.'
              : mode === 'SIGN_UP'
              ? 'Select whether you are a Business Shipper or Commercial Driver.'
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
                    placeholder="aditya@example.com"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-slate-400 block uppercase font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('FORGOT_PASSWORD')}
                    className="text-[10px] text-emerald-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                </button>
              </div>

              {/* Demo Sign In Shortcuts */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleUseDemoAccount('BUSINESS')}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-cyan-300 flex items-center justify-center gap-1 transition"
                >
                  <Building2 className="w-3 h-3 text-cyan-400" />
                  <span>Demo Business</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUseDemoAccount('DRIVER')}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-300 flex items-center justify-center gap-1 transition"
                >
                  <Truck className="w-3 h-3 text-emerald-400" />
                  <span>Demo Driver</span>
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM WITH ROLE SELECTION */}
          {mode === 'SIGN_UP' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              
              {/* PRIMARY ROLE CHOICE SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300 block uppercase font-bold tracking-wider">
                  Are you a Business / Shipper or a Commercial Driver?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUserRole('BUSINESS')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-center ${
                      userRole === 'BUSINESS'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className={`w-5 h-5 ${userRole === 'BUSINESS' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">Business / Shipper</span>
                      <span className="text-[9px] opacity-75 font-sans leading-tight block">Ship freight & book shared capacity</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('DRIVER')}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition text-center ${
                      userRole === 'DRIVER'
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Truck className={`w-5 h-5 ${userRole === 'DRIVER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="font-bold text-xs block">Commercial Driver</span>
                      <span className="text-[9px] opacity-75 font-sans leading-tight block">Manage trips & stream live GPS</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
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
                    placeholder={userRole === 'DRIVER' ? 'e.g. Suresh Naidu' : 'e.g. Aditya Singh'}
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Email and Phone */}
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
                      placeholder="user@example.com"
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

              {/* CONDITIONAL FIELDS: BUSINESS */}
              {userRole === 'BUSINESS' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[11px] text-cyan-300 block uppercase font-semibold">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Aditya Freight Solutions"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                      required
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

              {/* CONDITIONAL FIELDS: DRIVER */}
              {userRole === 'DRIVER' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[11px] text-emerald-300 block uppercase font-semibold flex items-center gap-1.5">
                      <FileBadge2 className="w-3.5 h-3.5 text-emerald-400" />
                      Commercial Driver License No.
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. DL-0820200192834"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs placeholder:text-slate-600 outline-none transition uppercase"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Assigned Vehicle Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value)}
                      placeholder="e.g. AP 31 TT 5510"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-1.5 px-2.5 text-white text-xs outline-none uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Account...' : userRole === 'DRIVER' ? 'Register & Open Driver Cockpit' : 'Register & Enter Freight Network'}
                </button>
              </div>
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
                    placeholder="aditya@example.com"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Recovery Instructions'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Mode Switcher */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-center font-sans text-xs text-slate-400">
          {mode === 'SIGN_IN' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('SIGN_UP')}
                className="text-emerald-400 hover:underline font-semibold font-mono"
              >
                Sign Up Now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('SIGN_IN')}
                className="text-emerald-400 hover:underline font-semibold font-mono"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
