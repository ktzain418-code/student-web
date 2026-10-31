export type StoreName = "apps" | "events" | "meta";

const DB_VERSION = 1;

export function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not provide local storage, so app history cannot be saved."));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(name, DB_VERSION);
    } catch (error) {
      reject(asDbError(error));
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("apps")) {
        const apps = db.createObjectStore("apps", { keyPath: "id" });
        apps.createIndex("packageName", "packageName", { unique: true });
        apps.createIndex("status", "status");
        apps.createIndex("lastSeen", "lastSeen");
      }
      if (!db.objectStoreNames.contains("events")) {
        const events = db.createObjectStore("events", { keyPath: "id" });
        events.createIndex("at", "at");
        events.createIndex("appId", "appId");
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(asDbError(request.error));
    request.onblocked = () =>
      reject(new Error("Your app history is in use by another window. Close it and try again."));
  });
}

export function asDbError(error: unknown): Error {
  if (error instanceof Error) return error;
  const message = typeof error === "string" ? error : "The local database reported an unknown error.";
  return new Error(message);
}

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(asDbError(request.error));
  });
}

export function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(asDbError(tx.error));
    tx.onabort = () => reject(asDbError(tx.error));
  });
}

export function createId(prefix: string): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return `${prefix}_${cryptoApi.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}


