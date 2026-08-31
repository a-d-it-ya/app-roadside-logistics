import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  Edit2,
  Check,
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewMyShipments?: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
  onViewMyShipments
}) => {
  const { user, updateProfile, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync with user prop
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      setIsSaving(true);
      await updateProfile({
        fullName: name.trim(),
        phone: phone.trim()
      });
      setIsSaving(false);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setIsSaving(false);
      setSaveError(e?.message || 'Failed to update profile.');
    }
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const primaryOrg = user.organizations && user.organizations.length > 0 ? user.organizations[0] : null;

  return (
    <div className="fixed inset-0 z-[2400] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl shadow-black/90 text-white overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 to-slate-950 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                User Profile
              </h3>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                {user.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
          
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2 text-emerald-300 text-xs animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile updated in PostgreSQL successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs animate-fadeIn">
              <span>{saveError}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-4">
              
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Full Name</span>
                    <span className="font-bold text-white text-sm">{user.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {user.accountType.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>Email</span>
                    </span>
                    <span className="text-slate-300 font-semibold text-[11px] truncate block">
                      {user.email}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Phone</span>
                    </span>
                    <span className="text-slate-300 font-semibold text-[11px] block">
                      {user.phone ? `+91 ${user.phone}` : 'Not provided'}
                    </span>
                  </div>
                </div>

                {/* SaaS Organization Info */}
                {primaryOrg && (
                  <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-500 uppercase block flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-cyan-400" />
                        <span>SaaS Organization</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                        {primaryOrg.role}
                      </span>
                    </div>
                    <p className="text-cyan-300 font-bold text-[11px]">
                      {primaryOrg.organizationName || 'Enterprise Shipper'}
                    </p>
                    <span className="text-[9px] text-slate-400 block">
                      Category: {primaryOrg.organizationType || 'SHIPPER'}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Member Since: {user.memberSince}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>PostgreSQL Verified</span>
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>EDIT PROFILE</span>
                </button>

                {onViewMyShipments && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewMyShipments();
                    }}
                    className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>MY SHIPMENTS</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 animate-fadeIn">
              
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase block font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 uppercase block font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-white text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between font-mono">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-400 border border-red-800/40 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>SIGN OUT</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
