import { supabase } from './supabase';
import { log } from './logger';

/**
 * Sharing Utilities for Naksha
 * Handles public slug generation and profile link management.
 */

export function generateSlug(name) {
  // slug: name-hexrandom
  const base = name.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20);
  
  // Use crypto for a more secure suffix
  const array = new Uint8Array(3);
  window.crypto.getRandomValues(array);
  const suffix = Array.from(array, byte => byte.toString(36).padStart(2, '0')).join('').slice(0, 5);
  
  return `${base}-${suffix}`;
}

export async function enableSharing(profile) {
  if (!profile || !profile.id) throw new Error('Invalid profile for sharing');
  
  const slug = generateSlug(profile.name);
  const { data, error } = await supabase
    .from('profiles')
    .update({ public_slug: slug })
    .eq('id', profile.id)
    .select()
    .single();

  if (error) {
    log.error('Share', `Failed to enable: ${error.message}`);
    throw error;
  }

  log.info('Share', `Public link enabled for ${profile.name}`, { slug });
  return slug;
}

export async function disableSharing(profileId) {
  const { error } = await supabase
    .from('profiles')
    .update({ public_slug: null })
    .eq('id', profileId);

  if (error) {
    log.error('Share', `Failed to disable: ${error.message}`);
    throw error;
  }

  log.info('Share', 'Public link disabled', { profileId });
}

export function getShareUrl(slug) {
  if (!slug) return '';
  return `${window.location.origin}/chart/${slug}`;
}
