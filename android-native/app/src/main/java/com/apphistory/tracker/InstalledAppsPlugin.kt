package com.apphistory.tracker

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Capacitor bridge for the installed-apps scan.
 *
 * JS side: `src/native/deviceProvider.ts` calls `InstalledApps.scanInstalledApps()`.
 * The work runs on a background thread because reading every package and
 * decoding icons can take a moment on a device with many apps.
 */
@CapacitorPlugin(name = "InstalledApps")
class InstalledAppsPlugin : Plugin() {

    private val executor: ExecutorService = Executors.newSingleThreadExecutor()

    @PluginMethod
    fun scanInstalledApps(call: PluginCall) {
        executor.execute {
            try {
                val report = InstalledAppsReader.scan(context)
                val apps = JSArray()
                for (app in report.apps) {
                    val entry = JSObject()
                    entry.put("appName", app.appName)
                    entry.put("packageName", app.packageName)
                    entry.put("icon", app.iconDataUrl)
                    entry.put("isSystemApp", app.isSystemApp)
                    apps.put(entry)
                }

                val result = JSObject()
                result.put("apps", apps)
                result.put("visibility", report.visibility)
                result.put("note", report.note)
                call.resolve(result)
            } catch (error: Throwable) {
                val detail = error.message?.takeIf { it.isNotBlank() } ?: "unknown error"
                call.reject("The installed apps could not be read ($detail).", null, error)
            }
        }
    }

    override fun handleOnDestroy() {
        executor.shutdownNow()
    }
}
