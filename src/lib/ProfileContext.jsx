import { createContext, useContext, useState, useEffect } from 'react';
import { log } from './logger';
import { supabase } from './supabase';
import { scheduleDailyNotification } from './notifications';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    fontFamily: 'Geist', // 'Geist' or 'Geist Mono'
    fontSizeScale: 1.0, // Multiplier for global scaling
    ayanamsaSystem: 'lahiri',
    houseSystem: 'whole_sign',
  });

  // Load active profile and settings from localStorage on mount
  useEffect(() => {
    const rehydrate = async () => {
      // Rehydrate settings
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) {
          log.error('ProfileContext', 'Failed to parse saved settings', e);
        }
      }

      const savedProfileId = localStorage.getItem('activeProfileId');
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id);

        if (profiles && profiles.length > 0) {
          let selected = profiles.find(p => p.id === savedProfileId);
          if (!selected) {
            selected = profiles.find(p => p.is_primary) || profiles[0];
          }
          setActiveProfile(selected);
          localStorage.setItem('activeProfileId', selected.id);

          // Silent notification reschedule
          if (localStorage.getItem('notifEnabled') === 'true') {
            scheduleDailyNotification(selected);
          }
        }
      }
      setLoading(false);
    };

    rehydrate();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setActiveProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSettings = (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('appSettings', JSON.stringify(merged));
  };

  const switchProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem('activeProfileId', profile.id);
  };

  return (
    <ProfileContext.Provider value={{ 
      user,
      activeProfile, 
      setActiveProfile: switchProfile, 
      loading,
      settings,
      updateSettings
    }}>
      {children}
    </ProfileContext.Provider>
  );
}


export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
