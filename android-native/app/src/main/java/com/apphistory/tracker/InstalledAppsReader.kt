package com.apphistory.tracker

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import java.io.ByteArrayOutputStream

/**
 * Reads the installed applications that Android allows this app to see.
 *
 * Two modes, chosen at runtime by inspecting our own manifest:
 *  - FULL    – `<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"/>`
 *              is declared, so PackageManager returns every package. Google Play
 *              requires a declared, approved use case for this permission.
 *  - LIMITED – default. Only launcher-visible apps (the ones from `<queries>`
 *              with MAIN/LAUNCHER) are visible. This is the privacy-preserving
 *              mode and is what ships by default.
 *
 * Nothing leaves the device: the caller stores the result locally.
 */
object InstalledAppsReader {

    private const val ICON_SIZE_PX = 96
    private const val QUERY_ALL_PACKAGES = "android.permission.QUERY_ALL_PACKAGES"

    data class ScannedApp(
        val appName: String,
        val packageName: String,
        val iconDataUrl: String?,
        val isSystemApp: Boolean,
    )

    data class ScanReport(
        /** "full" or "limited" — the UI shows what this really means. */
        val visibility: String,
        val note: String?,
        val apps: List<ScannedApp>,
    )

    fun scan(context: Context): ScanReport {
        val packageManager = context.packageManager
        val fullVisibility = hasQueryAllPackages(packageManager, context.packageName)

        val entries: List<ApplicationInfo> =
            if (fullVisibility) {
                packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
            } else {
                launcherApplications(packageManager)
            }

        val apps = entries
            .asSequence()
            .filter { it.packageName != context.packageName }
            .map { toScannedApp(packageManager, it) }
            .sortedBy { it.appName.lowercase() }
            .toList()

        val note =
            if (fullVisibility) {
                null
            } else {
                "Android only exposes launcher-visible apps to App History on this device. Apps without a launcher icon may be missing."
            }

        return ScanReport(
            visibility = if (fullVisibility) "full" else "limited",
            note = note,
            apps = apps,
        )
    }

    /** Launcher apps are visible to every app that declares the matching `<queries>` intent. */
    private fun launcherApplications(packageManager: PackageManager): List<ApplicationInfo> {
        val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val resolved =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.queryIntentActivities(intent, PackageManager.ResolveInfoFlags.of(0L))
            } else {
                @Suppress("DEPRECATION")
                packageManager.queryIntentActivities(intent, 0)
            }
        return resolved
            .mapNotNull { it.activityInfo?.applicationInfo }
            .distinctBy { it.packageName }
    }

    /**
     * True when this app declares QUERY_ALL_PACKAGES in its own manifest (which
     * only matters from Android 11 / API 30 onward).
     */
    private fun hasQueryAllPackages(packageManager: PackageManager, selfPackage: String): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return true
        return try {
            val info =
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    packageManager.getPackageInfo(
                        selfPackage,
                        PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()),
                    )
                } else {
                    @Suppress("DEPRECATION")
                    packageManager.getPackageInfo(selfPackage, PackageManager.GET_PERMISSIONS)
                }
            info.requestedPermissions?.contains(QUERY_ALL_PACKAGES) == true
        } catch (_: Throwable) {
            false
        }
    }

    private fun toScannedApp(packageManager: PackageManager, info: ApplicationInfo): ScannedApp {
        val label =
            try {
                packageManager.getApplicationLabel(info).toString()
            } catch (_: Throwable) {
                info.packageName
            }

        val icon = try {
            packageManager.getApplicationIcon(info)
        } catch (_: Throwable) {
            null
        }

        return ScannedApp(
            appName = label.ifBlank { info.packageName },
            packageName = info.packageName,
            iconDataUrl = icon?.let { encodeIcon(it) },
            isSystemApp = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
        )
    }

    /** Icons are sent as small PNG data URLs so the web layer can store/show them. */
    private fun encodeIcon(drawable: Drawable): String? =
        try {
            val bitmap = Bitmap.createBitmap(ICON_SIZE_PX, ICON_SIZE_PX, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            val bytes = stream.toByteArray()
            bitmap.recycle()
            "data:image/png;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
        } catch (_: Throwable) {
            // A missing icon must never fail a scan; the UI falls back to a letter tile.
            null
        }
}
