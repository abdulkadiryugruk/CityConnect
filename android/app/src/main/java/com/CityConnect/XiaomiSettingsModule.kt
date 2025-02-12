package com.cityConnect


import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class XiaomiSettingsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "XiaomiSettings"

    @ReactMethod
    fun openAutoStartSettings(promise: Promise) {
        val context = currentActivity ?: reactApplicationContext
        try {
            // MIUI için farklı intent yollarını dene
            val possibleIntents = arrayOf(
                // Yol 1: Uygulamalar > İzinler > Arka planda otomatik başlatma
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.permcenter.autostart.AutoStartManagementActivity"
                    )
                },
                // Yol 2: Uygulamalar > Uygulamaları yönet > Arka planda otomatik başlatma
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.permcenter.permissions.PermissionsEditorActivity"
                    )
                },
                // Yedek yol: Güvenlik uygulaması
                Intent().apply {
                    component = android.content.ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.securityscan.MainActivity"
                    )
                }
            )

            // Intentleri sırayla dene
            var activityStarted = false
            for (intent in possibleIntents) {
                try {
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                    activityStarted = true
                    break
                } catch (e: Exception) {
                    continue
                }
            }

            // Eğer hiçbir intent çalışmazsa
            if (!activityStarted) {
                // Genel uygulama ayarlarını aç
                val intent = Intent(Settings.ACTION_APPLICATION_SETTINGS)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "Ayarlar açılırken hata oluştu: ${e.message}")
        }
    }
}