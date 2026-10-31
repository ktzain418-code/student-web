package com.apphistory.tracker

import android.os.Bundle
import com.getcapacitor.BridgeActivity

/**
 * Android host for the App History web UI.
 * The only native capability registered is the installed-apps reader.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(InstalledAppsPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
