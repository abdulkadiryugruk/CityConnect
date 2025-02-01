package com.denemee

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback
import android.util.Log

class WorkManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val scheduler = WorkManagerScheduler()

    override fun getName(): String = "WorkManagerModule"

    @ReactMethod
    fun startBackgroundService(callback: Callback) {
        try {
            scheduler.scheduleBackgroundWork(reactApplicationContext)
            callback.invoke(null, "Background service başarıyla başlatıldı")
            Log.d(TAG, "Background service başlatıldı")
        } catch (e: Exception) {
            callback.invoke("Background service başlatılırken hata oluştu: ${e.message}", null)
            Log.e(TAG, "Hata: ${e.message}")
        }
    }

    @ReactMethod
    fun stopBackgroundService(callback: Callback) {
        try {
            scheduler.cancelBackgroundWork(reactApplicationContext)
            callback.invoke(null, "Background service durduruldu")
            Log.d(TAG, "Background service durduruldu")
        } catch (e: Exception) {
            callback.invoke("Background service durdurulurken hata oluştu: ${e.message}", null)
            Log.e(TAG, "Hata: ${e.message}")
        }
    }

    companion object {
        private const val TAG = "WorkManagerModule"
    }
}