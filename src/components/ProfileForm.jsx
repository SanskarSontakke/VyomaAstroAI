import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Loader2,
  X,
  Globe,
  ChevronDown,
  ChevronUp,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { suggestTimezone } from '../lib/timezones';
import { Autocomplete, TextField, ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    background: { paper: '#0a0a0a', default: '#000000' }
  },
  typography: {
    fontFamily: 'inherit'
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }
    }
  }
});

const COMMON_ZONES = [
  'Asia/Kolkata','Asia/Karachi','Asia/Dhaka','Asia/Colombo',
  'Asia/Kathmandu','Asia/Kabul','Asia/Tehran','Asia/Dubai',
  'Asia/Singapore','Asia/Bangkok','Asia/Shanghai','Asia/Tokyo',
  'Asia/Seoul','Europe/London','Europe/Paris','Europe/Berlin',
  'Europe/Moscow','America/New_York','America/Chicago',
  'America/Denver','America/Los_Angeles','America/Toronto',
  'America/Sao_Paulo','Australia/Sydney','Australia/Melbourne',
  'Africa/Cairo','Africa/Lagos','Pacific/Auckland',
];

export default function ProfileForm({ userId, profile = null, isPrimary = false, onSuccess, onCancel }) {
  const [name, setName] = useState(profile?.name || '');
  const [dobDate, setDobDate] = useState(profile?.dob_date || '');
  const [dobTime, setDobTime] = useState(profile?.dob_time || '');
  const [birthCity, setBirthCity] = useState(profile?.pob_city || '');
  const [lat, setLat] = useState(profile?.latitude || null);
  const [lon, setLon] = useState(profile?.longitude || null);
  const [ianaTimezone, setIanaTimezone] = useState(profile?.iana_timezone || 'Asia/Kolkata');
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const toast = useToast();

  const handleCityBlur = async () => {
    if (!birthCity.trim() || showManualCoords) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthCity)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLat(parseFloat(lat));
        setLon(parseFloat(lon));
        setBirthCity(display_name.split(',')[0]);
        
        // Suggest timezone based on location
        const suggested = suggestTimezone(display_name);
        setIanaTimezone(suggested);
        
        toast.success('Location Resolved', `Matched to ${display_name.split(',')[0]}`);
      } else {
        toast.error('Location Error', 'Unable to find that city. Try a larger nearby hub.');
      }
    } catch (err) {
      toast.error('Service Offline', 'Geocoding is temporarily unavailable.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lat === null || lon === null) {
      toast.error('Missing Data', 'Please verify coordinates or birth city.');
      return;
    }

    setLoading(true);
    const profileData = {
      user_id: userId,
      name,
      dob_date: dobDate,
      dob_time: dobTime,
      latitude: lat,
      longitude: lon,
      pob_city: birthCity,
      iana_timezone: ianaTimezone,
      is_primary: isPrimary
    };

    try {
      const { error } = profile?.id 
        ? await supabase.from('profiles').update(profileData).eq('id', profile.id)
        : await supabase.from('profiles').insert(profileData);

      if (error) throw error;
      toast.success('Sequence Saved', `${name}'s identity is archived.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Archive Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="label-text">Identity Name</label>
            <div className="relative group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                id="name"
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Siddhartha Gautama"
                className="input-custom pl-11 pr-4"
              />
            </div>
          </div>

          {/* Time/Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dobDate" className="label-text">Arrival Date</label>
              <div className="relative group">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  id="dobDate"
                  type="date" 
                  required
                  value={dobDate}
                  onChange={(e) => setDobDate(e.target.value)}
                  className="input-custom pl-11 pr-4 mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="dobTime" className="label-text">Arrival Time</label>
              <div className="relative group">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  id="dobTime"
                  type="time" 
                  required
                  value={dobTime}
                  onChange={(e) => setDobTime(e.target.value)}
                  className="input-custom pl-11 pr-4 mono"
                />
              </div>
            </div>
          </div>

          {/* Birth City */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label htmlFor="birthCity" className="label-text">Origin City</label>
              <button 
                type="button" 
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-[10px] uppercase tracking-widest text-blue-500 font-bold flex items-center gap-1 hover:text-blue-400"
              >
                {showManualCoords ? 'Use Search' : 'Manual Coords'}
                {showManualCoords ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>
            <div className="relative group">
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
              <input 
                id="birthCity"
                type="text" 
                required={!showManualCoords}
                disabled={showManualCoords}
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                onBlur={handleCityBlur}
                placeholder="e.g. Nanded, Maharashtra"
                className={`
                  input-custom pl-11 pr-4 
                  ${lat && !showManualCoords ? 'border-green-500/30' : ''}
                  ${showManualCoords ? 'opacity-50 grayscale' : ''}
                `}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {geocoding && <Loader2 size={16} className="text-blue-500 animate-spin" />}
                {!geocoding && lat && !showManualCoords && <Check size={16} className="text-green-500" />}
              </div>
            </div>
          </div>

          {/* Manual Coordinates Toggle Section */}
          <AnimatePresence>
            {showManualCoords && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="lat" className="label-text">Latitude</label>
                    <input 
                      id="lat"
                      type="number" 
                      step="0.0001"
                      required
                      min="-90"
                      max="90"
                      value={lat || ''}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      placeholder="e.g. 19.1550"
                      className="input-custom px-4 mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lon" className="label-text">Longitude</label>
                    <input 
                      id="lon"
                      type="number" 
                      step="0.0001"
                      required
                      min="-180"
                      max="180"
                      value={lon || ''}
                      onChange={(e) => setLon(parseFloat(e.target.value))}
                      placeholder="e.g. 77.3170"
                      className="input-custom px-4 mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Coordinate Preview */}
          {lat && lon && (
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono bg-white/5 p-2 rounded-lg border border-white/5">
              <MapIcon size={12} className="text-blue-500" />
              <span>LAT: {Number(lat).toFixed(4)}</span>
              <span className="text-gray-700">|</span>
              <span>LON: {Number(lon).toFixed(4)}</span>
            </div>
          )}

          {/* Timezone Selection */}
          <div className="space-y-2">
            <label className="label-text">Timezone (IANA)</label>
            <div className="relative group">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10 group-focus-within:text-blue-500 transition-colors" />
              <Autocomplete
                options={COMMON_ZONES}
                value={ianaTimezone}
                onChange={(_, newValue) => setIanaTimezone(newValue)}
                freeSolo
                onInputChange={(_, newValue) => setIanaTimezone(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    variant="outlined" 
                    placeholder="Search or enter IANA zone"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        color: 'white',
                        paddingLeft: '32px',
                        fontSize: '14px',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#3b82f6',
                          borderWidth: '1px',
                          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '12px 14px 12px 0 !important',
                        fontFamily: 'Geist Mono, monospace'
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3">
          {onCancel && (
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-gray-500 border border-gray-800 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          )}
            <button 
              type="submit"
              disabled={loading || geocoding || lat === null}
              className="btn-primary flex-1"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Archiving...' : (profile ? 'Update Record' : 'Create Record')}
            </button>
        </div>
      </form>
    </ThemeProvider>
  );
}

