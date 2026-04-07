import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../lib/ProfileContext';
import { 
  Grid as DashboardIcon, 
  PieChart as ChartIcon, 
  Heart as CompatibilityIcon, 
  Zap as TransitIcon, 
  Cloud as VaultIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Mobile-only Bottom Navigation for Vyoma (Naksha)
 * Visible only on md:hidden.
 */
export const BottomTabs = () => {
    const { activeProfile } = useProfile();
    const navigate = useNavigate();
    const location = useLocation();

    if (!activeProfile) return null;

    const tabs = [
        { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
        { name: 'Chart', path: '/chart', icon: ChartIcon },
        { name: 'Match', path: '/compatibility', icon: CompatibilityIcon },
        { name: 'Transits', path: '/transits', icon: TransitIcon },
        { name: 'Vault', path: '/vault', icon: VaultIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-t border-gray-900 pb-[max(env(safe-area-inset-bottom),0px)]">
            <div className="flex items-center justify-around h-16 px-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-full transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <div className="relative">
                                <Icon size={20} className={isActive ? 'scale-110' : 'scale-100'} />
                                {isActive && (
                                    <motion.div 
                                        layoutId="bottom-tab-bg"
                                        className="absolute -inset-2 bg-blue-500/10 rounded-lg -z-10 blur-sm"
                                    />
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.16em] leading-none">
                                {tab.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomTabs;
