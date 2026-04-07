import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Settings as SettingsIcon, 
  User as UserIcon,
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
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

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
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { name: 'Chart', path: '/chart', icon: ChartIcon },
    { name: 'Match', path: '/compatibility', icon: CompatibilityIcon },
    { name: 'Transits', path: '/transits', icon: TransitIcon },
    { name: 'Vault', path: '/vault', icon: VaultIcon },
  ];

  if (!user && location.pathname === '/') return null;

  return (
    <header className={`
      sticky top-0 z-[1000] w-full transition-all duration-300 transform-gpu
      ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg' : 'bg-transparent py-4 md:py-5 border-b border-transparent'}
    `} style={{ backfaceVisibility: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 md:h-12">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight text-white font-cinzel">VYOMA</span>
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          {user && (
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
            {user ? (
               <div className="flex items-center gap-2 md:gap-3">
                 <button 
                  onClick={() => navigate('/settings')}
                  className="p-2 md:p-2.5 rounded-full border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-colors"
                 >
                   <SettingsIcon size={18} />
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
    </header>
  );
};

export default TopHeader;
