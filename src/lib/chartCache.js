import { supabase } from './supabase';

const DB_NAME    = 'naksha_cache';
const DB_VERSION = 2;
const STORES = {
  CHARTS:   'charts',   // birth chart data (never expires)
  INSIGHTS: 'insights', // daily insights (expires at midnight)
  TRANSITS: 'transits', // pre-computed transit positions
};

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORES.CHARTS)) {
        db.createObjectStore(STORES.CHARTS, { keyPath: 'profileId' });
      }
      if (!db.objectStoreNames.contains(STORES.INSIGHTS)) {
        const store = db.createObjectStore(STORES.INSIGHTS, { keyPath: 'key' });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.TRANSITS)) {
        db.createObjectStore(STORES.TRANSITS, { keyPath: 'key' });
      }
    };
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

async function dbGet(store, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbPut(store, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// Hash function to detect parameter changes
export function generateCalculationHash(profile, ayanamsaSystem) {
  return `${profile.dob_date}_${profile.dob_time}_${profile.latitude}_${profile.longitude}_${ayanamsaSystem}`;
}

const TTL_DAYS = 7;

/* Birth chart cache — Cache-First with Supabase and IndexedDB fallback */
export async function getCachedChart(profile, ayanamsaSystem) {
  if (!profile || !profile.id) return null;
  const hash = generateCalculationHash(profile, ayanamsaSystem);

  try {
    // 1. Check Supabase first
    const { data: supabaseData, error } = await supabase
      .from('calculated_charts')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('calculation_hash', hash)
      .single();

    if (!error && supabaseData) {
      // Check TTL (7 days)
      const calculatedAt = new Date(supabaseData.calculated_at);
      const ageInDays = (new Date() - calculatedAt) / (1000 * 60 * 60 * 24);

      if (ageInDays <= TTL_DAYS) {
        // Valid cache found in Supabase
        const chartData = supabaseData.chart_data;
        // Parse dates back to Date objects
        const parsedData = JSON.parse(JSON.stringify(chartData), (key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value);
          }
          return value;
        });
        
        // Update local IndexedDB for future offline/fast access
        await dbPut(STORES.CHARTS, {
          profileId: profile.id,
          hash: hash,
          data: JSON.stringify(parsedData),
          cachedAt: supabaseData.calculated_at,
        });

        return parsedData;
      }
    }
  } catch (err) {
    console.warn('Supabase cache check failed, falling back to local DB:', err);
  }

  // 2. Fallback to IndexedDB
  try {
    const cached = await dbGet(STORES.CHARTS, profile.id);
    if (!cached) return null;

    // Check if hash matches local cache
    if (cached.hash !== hash) return null;

    const calculatedAt = new Date(cached.cachedAt);
    const ageInDays = (new Date() - calculatedAt) / (1000 * 60 * 60 * 24);
    if (ageInDays > TTL_DAYS) return null;

    return JSON.parse(cached.data, (key, value) => {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value);
      }
      return value;
    });
  } catch(e) {
    return null;
  }
}

export async function setCachedChart(profile, ayanamsaSystem, chartData) {
  if (!profile || !profile.id) return;
  const hash = generateCalculationHash(profile, ayanamsaSystem);
  const now = new Date().toISOString();

  // Strip non-essential deeply nested properties to save row limit if needed
  // (Assuming chartData is reasonably sized for JSONB)
  const optimizedData = JSON.parse(JSON.stringify(chartData));

  // 1. Save to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('calculated_charts').upsert({
        profile_id: profile.id,
        user_id: user.id,
        calculation_hash: hash,
        chart_data: optimizedData,
        calculated_at: now
      }, { onConflict: 'profile_id, calculation_hash' });
    }
  } catch (err) {
    console.warn('Supabase cache write failed:', err);
  }

  // 2. Save to IndexedDB
  try {
    await dbPut(STORES.CHARTS, {
      profileId: profile.id,
      hash: hash,
      data: JSON.stringify(chartData),
      cachedAt: now,
    });
  } catch(e) {
    console.warn('Cache write failed:', e);
  }
}

export async function invalidateCachedChart(profileId) {
  try {
    await supabase.from('calculated_charts').delete().eq('profile_id', profileId);
  } catch(e) {
    // ignore
  }

  try {
    const db = await openDB();
    const tx  = db.transaction(STORES.CHARTS, 'readwrite');
    tx.objectStore(STORES.CHARTS).delete(profileId);
  } catch(e) {
    // ignore
  }
}

/* Daily insights cache — expires at midnight */
export async function getCachedInsights(profileId, date) {
  const dateStr = date.toISOString().split('T')[0];
  const key     = `${profileId}_${dateStr}`;
  try {
    const cached = await dbGet(STORES.INSIGHTS, key);
    if (!cached) return null;
    /* Check if it's still today */
    if (cached.date !== dateStr) return null;
    return JSON.parse(cached.data);
  } catch(e) {
    return null;
  }
}

export async function setCachedInsights(profileId, date, insights) {
  const dateStr = date.toISOString().split('T')[0];
  const key     = `${profileId}_${dateStr}`;
  try {
    await dbPut(STORES.INSIGHTS, { key, date: dateStr, data: JSON.stringify(insights) });
  } catch(e) {
    console.warn('Insights cache write failed:', e);
  }
}

export async function setCachedTransits(key, data) {
    try {
        await dbPut(STORES.TRANSITS, { key, data: JSON.stringify(data) });
    } catch(e) {
        console.warn('Transits cache write failed:', e);
    }
}

export async function getCachedTransits(key) {
    try {
        const cached = await dbGet(STORES.TRANSITS, key);
        if (!cached) return null;
        return JSON.parse(cached.data, (k, v) => {
            if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
                return new Date(v);
            }
            return v;
        });
    } catch(e) {
        return null;
    }
}
