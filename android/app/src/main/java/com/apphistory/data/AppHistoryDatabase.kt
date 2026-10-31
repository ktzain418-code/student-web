package com.apphistory.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Index
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.Upsert

/**
 * Reference Room schema for a fully native storage layer.
 *
 * The shipped build keeps the app history in the shared web layer (js/db.js,
 * IndexedDB) so the same database model, scan reconciliation and UI logic run in
 * the Base44 preview and inside the Android WebView. This file documents and
 * prepares the equivalent native model; the Capacitor plugin does not write to it
 * yet, so there is exactly one source of truth at runtime.
 */

enum class AppStatus { INSTALLED, UNINSTALLED }

@Entity(tableName = "tracked_apps", indices = [Index(value = ["packageName"], unique = true)])
data class TrackedApp(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val appName: String,
    val packageName: String,
    val icon: String? = null,
    val firstSeen: Long,
    val lastSeen: Long,
    val status: AppStatus,
    val uninstallDetectedAt: Long? = null
)

@Entity(tableName = "app_events", indices = [Index("packageName"), Index("at")])
data class AppEvent(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val packageName: String,
    val appName: String,
    /** detected | uninstalled | reinstalled */
    val type: String,
    val at: Long
)

@Dao
interface AppHistoryDao {

    @Query("SELECT * FROM tracked_apps ORDER BY appName COLLATE NOCASE ASC")
    suspend fun allApps(): List<TrackedApp>

    @Query("SELECT * FROM tracked_apps WHERE packageName = :packageName LIMIT 1")
    suspend fun find(packageName: String): TrackedApp?

    @Upsert
    suspend fun upsertAll(apps: List<TrackedApp>)

    @Query("DELETE FROM tracked_apps WHERE packageName = :packageName")
    suspend fun deleteApp(packageName: String)

    @Query("DELETE FROM app_events WHERE packageName = :packageName")
    suspend fun deleteEvents(packageName: String)

    @Insert
    suspend fun insertEvents(events: List<AppEvent>)

    @Query("SELECT * FROM app_events ORDER BY at DESC LIMIT 500")
    suspend fun recentEvents(): List<AppEvent>

    @Query("SELECT * FROM app_events WHERE packageName = :packageName ORDER BY at DESC")
    suspend fun eventsFor(packageName: String): List<AppEvent>

    @Query("DELETE FROM app_events")
    suspend fun clearEvents()

    @Query("DELETE FROM tracked_apps")
    suspend fun clearApps()
}

@Database(
    entities = [TrackedApp::class, AppEvent::class],
    version = 1,
    exportSchema = true
)
abstract class AppHistoryDatabase : RoomDatabase() {

    abstract fun dao(): AppHistoryDao

    companion object {
        @Volatile
        private var instance: AppHistoryDatabase? = null

        fun get(context: Context): AppHistoryDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppHistoryDatabase::class.java,
                    "app-history.db"
                ).build().also { instance = it }
            }
    }
}
