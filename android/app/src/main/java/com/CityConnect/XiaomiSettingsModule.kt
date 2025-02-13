package com.cityConnect

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class XiaomiSettingsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "XiaomiSettings"

    @ReactMethod
    fun openAutoStartSettings(promise: Promise) {
        try {
            val intent = Intent()
            intent.component = ComponentName(
                "com.miui.securitycenter",
                "com.miui.permcenter.autostart.AutoStartManagementActivity"
            )
            getCurrentActivity()?.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            // Alternatif yolu dene
            try {
                val intent = Intent()
                intent.component = ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } catch (e2: Exception) {
                promise.reject("ERROR", "Both attempts to open settings failed: ${e.message}, ${e2.message}")
            }
        }
    }

@ReactMethod
fun checkAutoStartPermission(promise: Promise) {
    try {
        val context = reactApplicationContext
        val packageName = context.packageName
        val autoStartEnabled = isAutoStartEnabled(context, packageName)
        promise.resolve(autoStartEnabled)
    } catch (e: Exception) {
        promise.reject("ERROR", "Failed to check autostart permission: ${e.message}")
    }
}

    private fun isAutoStartEnabled(context: Context, packageName: String): Boolean {
        try {
            val contentResolver = context.contentResolver
            val uri = Uri.parse("content://com.miui.securitycenter.autostart/state")
            val cursor = contentResolver.query(
                uri,
                null,
                "package_name=?",
                arrayOf(packageName),
                null
            )
            
            cursor?.use {
                if (it.moveToFirst()) {
                    val stateIndex = it.getColumnIndex("state")
                    if (stateIndex != -1) {
                        return it.getInt(stateIndex) == 1
                    }
                }
            }
        } catch (e: Exception) {
            Log.e("XiaomiSettings", "AutoStart permission check failed", e)
        }
        
        return false
    }
}