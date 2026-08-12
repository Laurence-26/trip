import Dexie from 'dexie';

export const db = new Dexie('truck-trip-tracker');

db.version(1).stores({
  sessions: 'id, date, driverName, truckName, tripCount, synced, updatedAt'
});

export async function getAllSessions() {
  return db.table('sessions').orderBy('date').reverse().toArray();
}

export async function saveSession(session) {
  const sessionWithMeta = {
    ...session,
    synced: 0,
    updatedAt: new Date().toISOString()
  };

  await db.table('sessions').put(sessionWithMeta);
  return sessionWithMeta;
}

export async function getPendingSessions() {
  return db.table('sessions').where('synced').equals(0).toArray();
}

export async function markSessionSynced(id) {
  await db.table('sessions').update(id, { synced: 1 });
}

export async function syncSessions() {
  if (!navigator.onLine) {
    return { synced: 0, message: 'Offline - your session is stored locally.' };
  }

  const pending = await getPendingSessions();
  if (!pending.length) {
    return { synced: 0, message: 'No pending sessions.' };
  }

  try {
    const response = await fetch('/api/sessions/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending)
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }

    const syncedPayload = await response.json();
    await Promise.all(syncedPayload.map((item) => markSessionSynced(item.id)));
    return { synced: syncedPayload.length, message: 'Synced successfully.' };
  } catch (error) {
    console.error(error);
    return { synced: 0, message: 'Could not sync yet.' };
  }
}
