package com.apphistory.nativebridge

import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import android.util.LruCache
import java.io.ByteArrayOutputStream

/**
 * Reads the applications Android makes visible to this app.
 *
 * Visibility is limited by package-visibility rules (Android 11+): the caller sees
 * only packages matched by <queries>, packages it interacts with, and — when the
 * restricted QUERY_ALL_PACKAGES permission is granted — everything installed.
 * This class never fabricates entries for packages it cannot see.
 */
class PackageScanner(private val context: Context) {

    data class ScannedApp(
        val packageName: String,
        val appName: String,
        val iconDataUrl: String?
    )

    private val iconCache = LruCache<String, String?>(96)

    fun scan(): List<ScannedApp> {
        val packageManager = context.packageManager
        val flags = PackageManager.GET_META_DATA
        val packages = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.getInstalledPackages(PackageManager.PackageInfoFlags.of(flags.toLong()))
        } else {
            @Suppress("DEPRECATION")
            packageManager.getInstalledPackages(flags)
        }

        return packages.asSequence()
            .filter { it.packageName != context.packageName }
            .mapNotNull { info ->
                val appInfo = info.applicationInfo ?: return@mapNotNull null
                val label = try {
                    appInfo.loadLabel(packageManager).toString().trim()
                } catch (error: Throwable) {
                    ""
                }
                ScannedApp(
                    packageName = info.packageName,
                    appName = label.ifEmpty { info.packageName },
                    iconDataUrl = iconCache.get(info.packageName) ?: run {
                        val encoded = try {
                            encodeIcon(appInfo.loadIcon(packageManager))
                        } catch (error: Throwable) {
                            null
                        }
                        iconCache.put(info.packageName, encoded)
                        encoded
                    }
                )
            }
            .sortedBy { it.appName.lowercase() }
            .toList()
    }

    private fun encodeIcon(drawable: Drawable): String? = try {
        val bitmap = drawable.toBitmap(96)
        val stream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 90, stream)
        val base64 = Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
        "data:image/png;base64,$base64"
    } catch (error: Throwable) {
        null
    }

    private fun Drawable.toBitmap(size: Int): Bitmap {
        if (this is BitmapDrawable && bitmap != null) {
            return Bitmap.createScaledBitmap(bitmap, size, size, true)
        }
        val target = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(target)
        setBounds(0, 0, size, size)
        draw(canvas)
        return target
    }
}
