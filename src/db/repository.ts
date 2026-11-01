import type { HistoryEvent, ScanRecord, TrackedApp } from "../types";
import { asDbError, openDb, requestToPromise, transactionDone } from "./idb";

export const REAL_DB = "apphistory";
export const DEMO_DB = "apphistory-demo";

export const META_LAST_SCAN = "lastScan";

export interface ScanCommit {
  apps: TrackedApp[];
  events: HistoryEvent[];
  scan: ScanRecord;
}

/**
 * Thin, typed data-access layer over IndexedDB.
 * One instance per database name (real history vs. the isolated demo database).
 */
export class LocalRepository {
  private readonly handle: Promise<IDBDatabase>;

  constructor(public readonly dbName: string) {
    this.handle = openDb(dbName);
  }

  private async db(): Promise<IDBDatabase> {
    return this.handle;
  }

  async getAllApps(): Promise<TrackedApp[]> {
    const db = await this.db();
    try {
      const tx = db.transaction("apps", "readonly");
      const rows = await requestToPromise(tx.objectStore("apps").getAll() as IDBRequest<TrackedApp[]>);
      return rows;
    } catch (error) {
      throw asDbError(error);
    }
  }

  async getEvents(): Promise<HistoryEvent[]> {
    const db = await this.db();
    try {
      const tx = db.transaction("events", "readonly");
      const rows = await requestToPromise(tx.objectStore("events").getAll() as IDBRequest<HistoryEvent[]>);
      return rows;
    } catch (error) {
      throw asDbError(error);
    }
  }

  async getLastScan(): Promise<ScanRecord | null> {
    const db = await this.db();
    try {
      const tx = db.transaction("meta", "readonly");
      const row = await requestToPromise(
        tx.objectStore("meta").get(META_LAST_SCAN) as IDBRequest<{ key: string; value: ScanRecord } | undefined>,
      );
      return row?.value ?? null;
    } catch (error) {
      throw asDbError(error);
    }
  }

  /**
   * Persists a whole scan atomically: app upserts, history events and the scan
   * summary either all land or none of them do.
   */
  async commitScan({ apps, events, scan }: ScanCommit): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(["apps", "events", "meta"], "readwrite");
      const appStore = tx.objectStore("apps");
      const eventStore = tx.objectStore("events");
      const metaStore = tx.objectStore("meta");
      for (const app of apps) appStore.put(app);
      for (const event of events) eventStore.put(event);
      metaStore.put({ key: META_LAST_SCAN, value: scan });
      await transactionDone(tx);
    } catch (error) {
      throw asDbError(error);
    }
  }

  async deleteApp(appId: string): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(["apps", "events"], "readwrite");
      tx.objectStore("apps").delete(appId);
      const eventStore = tx.objectStore("events");
      const index = eventStore.index("appId");
      const keys = await requestToPromise(index.getAllKeys(appId) as IDBRequest<IDBValidKey[]>);
      for (const key of keys) eventStore.delete(key);
      await transactionDone(tx);
    } catch (error) {
      throw asDbError(error);
    }
  }

  /** Clears the timeline but keeps the tracked apps and their status. */
  async clearHistory(): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction("events", "readwrite");
      tx.objectStore("events").clear();
      await transactionDone(tx);
    } catch (error) {
      throw asDbError(error);
    }
  }

  /** Removes every stored app, event and scan record for this database. */
  async deleteAllData(): Promise<void> {
    const db = await this.db();
    try {
      const tx = db.transaction(["apps", "events", "meta"], "readwrite");
      tx.objectStore("apps").clear();
      tx.objectStore("events").clear();
      tx.objectStore("meta").clear();
      await transactionDone(tx);
    } catch (error) {
      throw asDbError(error);
    }
  }
}
