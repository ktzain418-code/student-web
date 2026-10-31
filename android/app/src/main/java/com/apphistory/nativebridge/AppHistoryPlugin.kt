package com.apphistory.nativebridge

import android.Manifest
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.concurrent.Executors

/**
 * Capacitor bridge for App History.
 *
 * Exposes:
 *  - scanInstalledApps()          → { apps: [...], scannedAt }
 *  - openPlayStore({ packageName }) → { opened, reason? }
 *  - getCapabilities()            → { sdkInt, queryAllPackages, packageVisibilityLimited }
 *
 * The web layer (js/native.js) detects this plugin automatically and never invents
 * scan results when it is missing.
 */
@CapacitorPlugin(name = "AppHistory")
class AppHistoryPlugin : Plugin() {

    private val executor = Executors.newSingleThreadExecutor()
    private val scanner by lazy { PackageScanner(context) }

    @PluginMethod
    fun scanInstalledApps(call: PluginCall) {
        // PackageManager enumeration can be slow: never block the main thread.
        executor.execute {
            try {
                val apps = scanner.scan()
                val array = JSArray()
                apps.forEach { app ->
                    val item = JSObject()
                    item.put("packageName", app.packageName)
                    item.put("appName", app.appName)
                    item.put("icon", app.iconDataUrl)
                    array.put(item)
                }
                val result = JSObject()
                result.put("apps", array)
                result.put("scannedAt", System.currentTimeMillis())
                call.resolve(result)
            } catch (error: Throwable) {
                call.reject(
                    "Android could not read the installed-app list: ${error.message ?: "unknown error"}",
                    null,
                    error
                )
            }
        }
    }

    @PluginMethod
    fun openPlayStore(call: PluginCall) {
        val packageName = call.getString("packageName")
        if (packageName.isNullOrBlank()) {
            call.resolve(JSObject().put("opened", false).put("reason", "missing-package"))
            return
        }

        bridge.activity.runOnUiThread {
            val marketIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            if (marketIntent.resolveActivity(context.packageManager) != null) {
                try {
                    context.startActivity(marketIntent)
                    call.resolve(JSObject().put("opened", true))
                    return@runOnUiThread
                } catch (error: ActivityNotFoundException) {
                    // Fall through to the web listing.
                }
            }

            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

            if (webIntent.resolveActivity(context.packageManager) != null) {
                try {
                    context.startActivity(webIntent)
                    call.resolve(JSObject().put("opened", true).put("fallback", true))
                    return@runOnUiThread
                } catch (error: ActivityNotFoundException) {
                    // Fall through to the unavailable result.
                }
            }

            call.resolve(JSObject().put("opened", false).put("reason", "no-play-store"))
        }
    }

    @PluginMethod
    fun getCapabilities(call: PluginCall) {
        val queryAllPackages = hasQueryAllPackagesDeclaration()
        val result = JSObject()
        result.put("sdkInt", Build.VERSION.SDK_INT)
        result.put("queryAllPackages", queryAllPackages)
        result.put(
            "packageVisibilityLimited",
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && !queryAllPackages
        )
        call.resolve(result)
    }

    /** True when QUERY_ALL_PACKAGES is declared in the merged manifest (API 30+). */
    private fun hasQueryAllPackagesDeclaration(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return true
        return try {
            context.packageManager
                .getPackageInfo(context.packageName, PackageManager.GET_PERMISSIONS)
                .requestedPermissions
                ?.contains(Manifest.permission.QUERY_ALL_PACKAGES) == true
        } catch (error: PackageManager.NameNotFoundException) {
            false
        }
    }
}
