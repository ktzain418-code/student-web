// Local app-history database (IndexedDB).
// Equivalent of the Room database on Android: everything stays on this device.

const DB_NAME = 'app-history';
const DB_VERSION = 1;

export class AppDataError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'AppDataError';
    this.userMessage = message;
    this.cause = cause;
  }
}

let dbPromise = null;

function openDatabase() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      dbPromise = null;
      reject(new AppDataError('This browser cannot open a local database, so app history cannot be saved.'));
      return;
    }

    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      dbPromise = null;
      reject(new AppDataError('The local app history database could not be opened.', error));
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('apps')) {
        database.createObjectStore('apps', { keyPath: 'packageName' });
      }
      if (!database.objectStoreNames.contains('events')) {
        const events = database.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        events.createIndex('at', 'at');
        events.createIndex('packageName', 'packageName');
      }
      if (!database.objectStoreNames.contains('meta')) {
        database.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(new AppDataError('The local app history database could not be opened.', request.error));
    };
    request.onblocked = () => {
      dbPromise = null;
      reject(
        new AppDataError(
          'The app history database is locked by another tab. Close other tabs and try again.'
        )
      );
    };
  });

  return dbPromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function guard(action, message) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof AppDataError) throw error;
    throw new AppDataError(message, error);
  }
}

export function getAllApps() {
  return guard(async () => {
    const database = await openDatabase();
    return requestResult(database.transaction('apps').objectStore('apps').getAll());
  }, 'Your app history could not be read from this device.');
}

export function saveApps(apps) {
  if (!apps.length) return Promise.resolve();
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction('apps', 'readwrite');
    const store = tx.objectStore('apps');
    apps.forEach((app) => store.put(app));
    await transactionDone(tx);
  }, 'Your app history could not be saved on this device.');
}

export function deleteAppAndEvents(packageName) {
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction(['apps', 'events'], 'readwrite');
    tx.objectStore('apps').delete(packageName);
    const eventIndex = tx.objectStore('events').index('packageName');
    const request = eventIndex.openCursor(IDBKeyRange.only(packageName));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    await transactionDone(tx);
  }, 'That app record could not be deleted.');
}

export function addEvents(events) {
  if (!events.length) return Promise.resolve();
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    events.forEach((event) => store.add(event));
    await transactionDone(tx);
  }, 'The activity history could not be saved.');
}

export function getRecentEvents(limit = 500) {
  return guard(async () => {
    const database = await openDatabase();
    const index = database.transaction('events').objectStore('events').index('at');
    return new Promise((resolve, reject) => {
      const items = [];
      const request = index.openCursor(null, 'prev');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor || items.length >= limit) {
          resolve(items);
          return;
        }
        items.push(cursor.value);
        cursor.continue();
      };
    });
  }, 'The activity history could not be read.');
}

export function getEventsFor(packageName) {
  return guard(async () => {
    const database = await openDatabase();
    const index = database.transaction('events').objectStore('events').index('packageName');
    const events = await requestResult(index.getAll(IDBKeyRange.only(packageName)));
    return events.sort((a, b) => b.at - a.at);
  }, 'This app’s history could not be read.');
}

export function clearEvents() {
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction('events', 'readwrite');
    tx.objectStore('events').clear();
    await transactionDone(tx);
  }, 'The activity history could not be cleared.');
}

export function getMeta(key, fallback = null) {
  return guard(async () => {
    const database = await openDatabase();
    const record = await requestResult(database.transaction('meta').objectStore('meta').get(key));
    return record ? record.value : fallback;
  }, 'App settings could not be read.');
}

export function getAllMeta() {
  return guard(async () => {
    const database = await openDatabase();
    const records = await requestResult(database.transaction('meta').objectStore('meta').getAll());
    return records.reduce((acc, record) => {
      acc[record.key] = record.value;
      return acc;
    }, {});
  }, 'App settings could not be read.');
}

export function setMeta(key, value) {
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction('meta', 'readwrite');
    tx.objectStore('meta').put({ key, value });
    await transactionDone(tx);
  }, 'App settings could not be saved.');
}

export function eraseAllData() {
  return guard(async () => {
    const database = await openDatabase();
    const tx = database.transaction(['apps', 'events', 'meta'], 'readwrite');
    tx.objectStore('apps').clear();
    tx.objectStore('events').clear();
    tx.objectStore('meta').clear();
    await transactionDone(tx);
  }, 'Your data could not be deleted.');
}
