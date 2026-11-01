package com.apphistory.tracker

import android.content.Intent
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

    /**
     * Launches an app that is currently installed, by package name.
     *
     * The web layer only calls this for apps whose last scan found them
     * installed, and Android itself refuses with NOT_INSTALLED when the package
     * has no launchable activity — so App History never pretends to open an app
     * that is gone. Nothing is installed, downloaded or modified here.
     */
    @PluginMethod
    fun openApp(call: PluginCall) {
        val packageName = call.getString("packageName")?.trim().orEmpty()
        if (packageName.isEmpty()) {
            call.reject("A package name is required.", "INVALID_PACKAGE")
            return
        }
        executor.execute {
            try {
                val intent = context.packageManager.getLaunchIntentForPackage(packageName)
                if (intent == null) {
                    call.reject(
                        "$packageName is not installed on this device, or it has no launchable screen.",
                        "NOT_INSTALLED",
                    )
                } else {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    call.resolve()
                }
            } catch (error: Throwable) {
                val detail = error.message?.takeIf { it.isNotBlank() } ?: "unknown error"
                call.reject("Android could not open $packageName ($detail).", "OPEN_FAILED", error)
            }
        }
    }

    override fun handleOnDestroy() {
        executor.shutdownNow()
    }
}
