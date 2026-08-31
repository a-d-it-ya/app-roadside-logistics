import React, { useState } from 'react';
import {
  Truck,
  Bell,
  Radio,
  User as UserIcon,
  MapPin,
  Layers,
  HelpCircle,
  PackageCheck,
  ChevronDown,
  LogOut,
  Settings,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  activeTrucksCount: number;
  activeTab: 'explore' | 'shipments' | 'howItWorks';
  onTabChange: (tab: 'explore' | 'shipments' | 'howItWorks') => void;
  onOpenHowItWorks?: () => void;
  onOpenProfile?: () => void;
  onOpenDriverApp?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTrucksCount,
  activeTab,
  onTabChange,
  onOpenHowItWorks,
  onOpenProfile,
  onOpenDriverApp
}) => {
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();
  const [hasUnreadAlert, setHasUnreadAlert] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] px-3 sm:px-5 py-2.5 pointer-events-none font-sans">
      <div className="w-full mx-auto flex items-center justify-between pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 sm:px-6 py-2 shadow-2xl shadow-black/60">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
            <Truck className="w-5 h-5 text-slate-950 font-bold stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-sm lg:text-base text-white uppercase font-mono">
                ROADSIDE <span className="text-emerald-400">LOGISTICS</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE NETWORK
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-tight">
              Real-time Freight Capacity Corridors • India
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/60 font-mono">
          <button
            onClick={() => onTabChange('explore')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'explore'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explore Network</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 font-mono">
              {activeTrucksCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('shipments')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'shipments'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>My Shipments</span>
          </button>

          <button
            onClick={() => {
              if (onOpenDriverApp) onOpenDriverApp();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 transition-all"
            title="Open Driver Mobile In-Cab Interface"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Driver App</span>
          </button>

          <button
            onClick={() => {
              onTabChange('howItWorks');
              if (onOpenHowItWorks) onOpenHowItWorks();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'howItWorks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Driver App Button for Mobile */}
          <button
            onClick={() => {
              if (onOpenDriverApp) onOpenDriverApp();
            }}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Driver</span>
          </button>
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setHasUnreadAlert(false);
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-950 animate-pulse" />
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-2xl z-50 text-xs font-mono">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200">Network Alerts</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <p className="font-medium text-slate-200">Corridor Capacity Alert: NH-65</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Truck RSL-2048 (Bhubaneswar → Chennai) opened 2.4T capacity passing Hyderabad.
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">Just now</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800">
                    <p className="font-medium text-slate-300">Hub Online: Hyderabad Freight Hub</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fast cross-docking available for outbound shipments to Chennai & Bangalore.
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">12 mins ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AUTHENTICATED PROFILE OR SIGN IN BUTTON */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-slate-200 text-xs font-mono font-medium transition shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                  {user.name.split(' ')[0][0]}
                </div>
                <span className="font-semibold text-white max-w-[110px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs font-mono animate-fadeIn">
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {user.accountType}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onTabChange('shipments');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
                  >
                    <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Shipments</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1 pt-1">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-red-400 hover:bg-red-950/30 transition font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('SIGN_IN', 'GENERAL')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 text-xs font-mono font-medium transition shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

export default TopNav;
