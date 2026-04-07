import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useProfile } from '../../lib/ProfileContext';
import { 
  Settings as SettingsIcon, 
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  Grid as DashboardIcon,
  PieChart as ChartIcon,
  Heart as CompatibilityIcon,
  Zap as TransitIcon,
  Cloud as VaultIcon
} from 'lucide-react';

/**
 * Sticky Top Header for Naksha
 * Replaces BottomNav. Aligned Logo (Left), Auth/Settings (Right).
 */
export const TopHeader = () => {
  const { activeProfile, loading: profileLoading } = useProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Small buffer to prevent scroll jitter/flicker
      if (window.scrollY > 20) setIsScrolled(true);
      else setIsScrolled(false);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { name: 'Chart', path: '/chart', icon: ChartIcon },
    { name: 'Match', path: '/compatibility', icon: CompatibilityIcon },
    { name: 'Transits', path: '/transits', icon: TransitIcon },
    { name: 'Vault', path: '/vault', icon: VaultIcon },
  ];

  if (location.pathname === '/' && !activeProfile && !profileLoading) return null;

  return (
    <header className={`
      sticky top-0 z-[1000] w-full transition-all duration-300 transform-gpu
      ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-2.5 sm:py-3 shadow-lg' : 'bg-transparent py-3 sm:py-4 md:py-5 border-b border-transparent'}
    `} style={{ backfaceVisibility: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-10 sm:h-11 md:h-12">
          
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white font-cinzel">VYOMA</span>
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          {activeProfile && (
            <nav className="hidden md:flex items-center gap-1 bg-gray-900/50 rounded-full p-1 border border-gray-800">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                    `}
                  >
                    <Icon size={16} />
                    {link.name}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {activeProfile ? (
               <div className="flex items-center gap-2 md:gap-3">
                 <button
                  onClick={() => navigate('/settings')}
                  className="p-2 md:p-2.5 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
                  aria-label="Open settings"
                 >
                   <SettingsIcon size={18} />
                 </button>
                 <button
                  onClick={() => setMobileMenuOpen((s) => !s)}
                  className="sm:hidden p-2 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
                  aria-label="Toggle navigation menu"
                 >
                   {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
                 </button>
                 <button 
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all"
                 >
                   <LogOutIcon size={16} />
                   <span className="hidden lg:inline">Sign Out</span>
                 </button>
               </div>
            ) : null}
          </div>
        </div>
      </div>

      {activeProfile && mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-3 py-2 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  {link.name}
                </button>
              );
            })}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-300 hover:bg-red-600/10"
            >
              <LogOutIcon size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopHeader;
