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

/* Birth chart cache — permanent, keyed by profile ID */
export async function getCachedChart(profileId) {
  try {
    const cached = await dbGet(STORES.CHARTS, profileId);
    if (!cached) return null;
    /* Deserialize dates */
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

export async function setCachedChart(profileId, chartData) {
  try {
    await dbPut(STORES.CHARTS, {
      profileId,
      data: JSON.stringify(chartData),
      cachedAt: new Date().toISOString(),
    });
  } catch(e) {
    console.warn('Cache write failed:', e);
  }
}

export async function invalidateCachedChart(profileId) {
  const db = await openDB();
  const tx  = db.transaction(STORES.CHARTS, 'readwrite');
  tx.objectStore(STORES.CHARTS).delete(profileId);
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
