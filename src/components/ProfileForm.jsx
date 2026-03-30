import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Box, TextField, Button, Typography, Stack, CircularProgress } from '@mui/material';
import { StaggerParent, StaggerChild } from '../lib/animations';
import { useToast } from '../lib/ToastContext';
import { log } from '../lib/logger';
import { FieldError } from './FieldError';
import { CosmicLoader } from './CosmicLoader';

export default function ProfileForm({ userId, profile = null, isPrimary = false, onSuccess, onCancel }) {
  const [name, setName] = useState(profile?.name || '');
  const [dobDate, setDobDate] = useState(profile?.dob_date || '');
  const [dobTime, setDobTime] = useState(profile?.dob_time || '');
  const [birthCity, setBirthCity] = useState(profile?.latitude ? `Lat: ${profile.latitude}, Lon: ${profile.longitude}` : '');
  const [lat, setLat] = useState(profile?.latitude || null);
  const [lon, setLon] = useState(profile?.longitude || null);
  const [timezoneOffset, setTimezoneOffset] = useState(profile?.timezone_offset || null);
  const [geocodingResult, setGeocodingResult] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ city: null, form: null });
  const toast = useToast();

  const setFieldError = (field, msg) => setFieldErrors(prev => ({ ...prev, [field]: msg }));

  const handleCityBlur = async () => {
    if (!birthCity.trim() || birthCity.startsWith('Lat:')) return;
    
    setGeocoding(true);
    setFieldError('city', null);
    setGeocodingResult('');
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(birthCity)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        
        setLat(parsedLat);
        setLon(parsedLon);
        setGeocodingResult(`Found: ${display_name.split(',')[0]}, Lat: ${parsedLat.toFixed(4)}, Lon: ${parsedLon.toFixed(4)}`);
        
        const offset = new Date().getTimezoneOffset() / -60;
        setTimezoneOffset(offset);
        
        setFieldError('city', null);
        toast.success('Location Found', display_name.split(',')[0]);
        log.info('Geocoding', 'Location resolved', { lat: parsedLat, lon: parsedLon });
      } else {
        setFieldError('city', 'No location found. Try a larger nearby city.');
        setLat(null); setLon(null); setTimezoneOffset(null);
      }
    } catch (err) {
      setFieldError('city', 'Geocoding service unavailable.');
      toast.error('Geocoding Failed', 'Could not reach the location service.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lat === null || lon === null) {
      setFieldError('form', 'Please provide a valid city.');
      return;
    }

    setLoading(true);
    setFieldError('form', null);

    const profileData = {
      user_id: userId,
      name,
      dob_date: dobDate,
      dob_time: dobTime,
      latitude: lat,
      longitude: lon,
      timezone_offset: timezoneOffset || 5.5,
      is_primary: isPrimary
    };

    try {
      let error;
      if (profile?.id) {
        const { error: err } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profile.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('profiles')
          .insert(profileData);
        error = err;
      }

      if (error) throw error;
      
      toast.success('Profile Saved', `${name}'s profile is updated.`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Save Failed', err.message);
      setFieldError('form', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <StaggerParent stagger={0.05}>
        {fieldErrors.form && (
          <StaggerChild y={10}>
            <FieldError message={fieldErrors.form} />
          </StaggerChild>
        )}
        
        <StaggerChild y={10}>
          <TextField
            fullWidth label="Full Name" value={name}
            onChange={(e) => setName(e.target.value)}
            required margin="dense" variant="outlined"
          />
        </StaggerChild>

        <StaggerChild y={10}>
          <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1 }}>
            <TextField
              fullWidth label="Date of Birth" type="date"
              value={dobDate} onChange={(e) => setDobDate(e.target.value)}
              required InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth label="Time of Birth" type="time"
              value={dobTime} onChange={(e) => setDobTime(e.target.value)}
              required InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </StaggerChild>

        <StaggerChild y={10}>
          <TextField
            fullWidth label="Birth City" placeholder="e.g. Nanded"
            value={birthCity} onChange={(e) => setBirthCity(e.target.value)}
            onBlur={handleCityBlur} required margin="dense"
            helperText={geocoding ? 'Locating city...' : geocodingResult || ''}
            FormHelperTextProps={{ sx: { color: geocodingResult ? 'primary.main' : 'text.secondary' } }}
          />
          <FieldError message={fieldErrors.city} />
        </StaggerChild>

        <StaggerChild y={10}>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel} disabled={loading} fullWidth size="large">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" variant="contained" color="primary"
              disabled={loading || geocoding || lat === null}
              fullWidth size="large"
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Saving…' : (profile ? 'Update Profile' : 'Create Profile')}
            </Button>
          </Stack>
        </StaggerChild>
      </StaggerParent>
    </Box>
  );
}

